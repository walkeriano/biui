import { test, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

let page, insertError, inserted, calls, limited;
const client = {
  from(table) {
    const builder = {
      select() { return this; }, eq() { return this; },
      gte(...args) { calls.push(['gte', ...args]); return this; },
      lt(...args) { calls.push(['lt', ...args]); return this; },
      neq() { return Promise.resolve({ data: [{ appointment_at: '2030-01-07T08:00:00Z' }] }); },
      maybeSingle() { return Promise.resolve({ data: page }); },
      insert(value) { assert.equal(table, 'appointments'); inserted = value; return this; },
      single() { return Promise.resolve({ data: { id: 'booking', appointment_at: inserted.appointment_at, status: 'pendiente' }, error: insertError }); },
    };
    return builder;
  },
};
mock.module('../src/lib/supabase/admin.js', { namedExports: { createAdminClient: () => client } });
mock.module('../src/lib/supabase/config.js', { namedExports: { isSupabaseConfigured: true } });
mock.module('../src/lib/rateLimit.js', { namedExports: {
  checkRateLimit: () => ({ isLimited: limited, resetAt: Date.now() + 1000 }), getClientIp: () => 'test',
} });
const { GET, POST } = await import('../src/app/api/appointments/route.js');
const payload = { customerName: 'Cliente', customerPhone: '600000000', serviceName: 'Consulta', slug: 'profesional', selectedTime: '09:00', appointmentAt: '2030-01-07T08:00:00.000Z' };
const post = (body) => POST(new Request('https://example.test/api/appointments', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }));
beforeEach(() => {
  page = { id: 'page', user_id: 'owner', availability: { days: ['Lun'], times: ['09:00'], start: '09:00', end: '10:00', timeZone: 'Europe/Madrid' }, services: [{ name: 'Consulta' }] };
  insertError = null; inserted = null; limited = false; calls = [];
});

test('Valid landing booking creates a pending reservation for the page owner', async () => {
  const response = await post(payload);
  assert.equal(response.status, 201);
  assert.equal(inserted.professional_user_id, 'owner');
  assert.equal(inserted.status, 'pendiente');
  assert.equal(inserted.customer_email, null);
});

test('Malformed bodies and invalid email never insert', async () => {
  for (const value of [null, [], 5, { ...payload, customerName: {} }, { ...payload, customerEmail: 'bad' }, { ...payload, appointmentAt: null }]) {
    assert.equal((await post(value)).status, 400);
    assert.equal(inserted, null);
  }
  assert.equal((await post({ ...payload, notes: 'x'.repeat(9000) })).status, 413);
});

test('Unpublished/missing pages and disabled services cannot receive bookings', async () => {
  page = null;
  assert.equal((await post(payload)).status, 404);
  assert.equal(inserted, null);
});

test('Atomic slot conflicts return 409; database errors return 500', async () => {
  insertError = { code: '23505' };
  assert.equal((await post(payload)).status, 409);
  insertError = { code: 'XX000' };
  assert.equal((await post(payload)).status, 500);
});

test('Rate limits and honeypot stop insertion', async () => {
  limited = true;
  const response = await post(payload);
  assert.equal(response.status, 429);
  assert.ok(response.headers.get('Retry-After'));
  assert.equal((await post({ ...payload, website: 'spam' })).status, 202);
  assert.equal(inserted, null);
});

test('Availability queries use professional timezone and expose only occupied instants', async () => {
  const response = await GET(new Request('https://example.test/api/appointments?slug=profesional&date=2030-01-07'));
  assert.equal(response.status, 200);
  assert.deepEqual(calls, [['gte', 'appointment_at', '2030-01-06T23:00:00.000Z'], ['lt', 'appointment_at', '2030-01-07T23:00:00.000Z']]);
  assert.deepEqual(Object.keys(await response.json()), ['bookedAppointmentAts']);
  assert.equal((await GET(new Request('https://example.test/api/appointments?slug=x&date=2030-02-30'))).status, 400);
});
