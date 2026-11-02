import { test, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

const ownerId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const bookingId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
let page, insertError, inserted, calls, limited, authUser, current, mutationError, stale, legacySchema, queryError;
let insertAttempts, updated;
const client = {
  auth: { getUser: async () => ({ data: { user: authUser }, error: null }) },
  from(table) {
    let operation = 'read', selection = '', filters = {};
    const builder = {
      select(value) { selection = value; return this; },
      eq(key, value) { filters[key] = value; calls.push(['eq', key, value]); return this; },
      gt(...args) { calls.push(['gt', ...args]); return this; },
      gte(...args) { calls.push(['gte', ...args]); return this; },
      lt(...args) { calls.push(['lt', ...args]); return this; },
      neq() {
        const error = queryError || (legacySchema && selection.includes('appointment_end_at') ? { code: '42703', message: 'column appointments.appointment_end_at does not exist' } : null);
        return Promise.resolve({ data: error ? null : [{ appointment_at: '2030-01-07T08:00:00Z', appointment_end_at: '2030-01-07T09:00:00Z' }], error });
      },
      maybeSingle() {
        if (operation === 'update') return Promise.resolve({ data: stale ? null : { ...current, ...updated }, error: mutationError });
        if (table === 'professional_pages') return Promise.resolve({ data: page });
        return Promise.resolve({ data: current && filters.professional_user_id === current.professional_user_id ? current : null });
      },
      insert(value) { assert.equal(table, 'appointments'); inserted = value; insertAttempts += 1; return this; },
      update(value) { updated = value; operation = 'update'; return this; },
      single() {
        const error = legacySchema && 'duration_minutes' in inserted ? { code: 'PGRST204', message: "Could not find the 'duration_minutes' column in the schema cache" } : insertError;
        return Promise.resolve({ data: error ? null : { id: bookingId, appointment_at: inserted.appointment_at, status: 'pendiente' }, error });
      },
    };
    return builder;
  },
};
mock.module('../src/lib/supabase/admin.js', { namedExports: { createAdminClient: () => client } });
mock.module('../src/lib/supabase/server.js', { namedExports: { createClient: async () => client } });
mock.module('../src/lib/supabase/config.js', { namedExports: { isSupabaseConfigured: true } });
mock.module('../src/lib/rateLimit.js', { namedExports: {
  checkRateLimit: () => ({ isLimited: limited, resetAt: Date.now() + 1000 }), getClientIp: () => 'test',
} });
const { GET, POST, PATCH } = await import('../src/app/api/appointments/route.js');
const payload = { customerName: 'Cliente', customerPhone: '600000000', serviceName: 'Consulta', slug: 'profesional', selectedTime: '09:00', appointmentAt: '2030-01-07T08:00:00.000Z' };
const request = (method, body) => new Request('https://example.test/api/appointments', { method, body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
const post = (body) => POST(request('POST', body));
const patch = (body) => PATCH(request('PATCH', { id: bookingId, ...body }));
const get = () => GET(new Request('https://example.test/api/appointments?slug=profesional&date=2030-01-07'));
beforeEach(() => {
  page = { id: 'page', user_id: ownerId, availability: { days: ['Lun'], times: ['09:00', '10:00'], start: '09:00', end: '12:00', timeZone: 'Europe/Madrid' }, services: [{ name: 'Consulta', duration: '60 minutos' }] };
  current = { id: bookingId, professional_user_id: ownerId, professional_page_id: 'page', service_name: 'Consulta', status: 'pendiente', updated_at: '2026-10-26T12:00:00Z' };
  authUser = { id: ownerId };
  insertError = null; inserted = null; limited = false; calls = []; mutationError = null; stale = false; legacySchema = false; queryError = null; insertAttempts = 0; updated = null;
});

test('Existing landing booking creates a pending reservation with a duration snapshot', async () => {
  assert.equal((await post(payload)).status, 201);
  assert.equal(inserted.professional_user_id, ownerId);
  assert.equal(inserted.status, 'pendiente');
  assert.equal(inserted.customer_email, null);
  assert.equal(inserted.duration_minutes, 60);
  assert.equal(insertAttempts, 1);
});

test('Malformed bodies, invalid email and oversized payloads never insert', async () => {
  for (const value of [null, [], 5, { ...payload, customerName: {} }, { ...payload, customerEmail: 'bad' }, { ...payload, appointmentAt: null }]) {
    assert.equal((await post(value)).status, 400);
    assert.equal(inserted, null);
  }
  assert.equal((await post({ ...payload, notes: 'x'.repeat(9000) })).status, 413);
});

test('Missing pages and disabled services cannot receive bookings', async () => {
  page.services = [];
  assert.equal((await post(payload)).status, 400);
  page = null;
  assert.equal((await post(payload)).status, 404);
  assert.equal(inserted, null);
});

test('Same-start and full-interval conflicts return 409 and never retry', async () => {
  for (const code of ['23505', '23P01', 'XX000']) {
    insertAttempts = 0; insertError = { code };
    assert.equal((await post(payload)).status, code === 'XX000' ? 500 : 409);
    assert.equal(insertAttempts, 1);
  }
});

test('Rate limits and honeypot stop insertion', async () => {
  limited = true;
  const response = await post(payload);
  assert.equal(response.status, 429);
  assert.ok(response.headers.get('Retry-After'));
  assert.equal((await post({ ...payload, website: 'spam' })).status, 202);
  assert.equal(inserted, null);
});

test('Availability uses the professional day and returns intervals without personal data', async () => {
  const response = await get();
  assert.equal(response.status, 200);
  assert.deepEqual(calls.filter(([op]) => ['gt', 'lt'].includes(op)), [['gt', 'appointment_end_at', '2030-01-06T23:00:00.000Z'], ['lt', 'appointment_at', '2030-01-07T23:00:00.000Z']]);
  const data = await response.json();
  assert.equal(data.intervalProtectionReady, true);
  assert.deepEqual(data.bookedAppointmentAts, ['2030-01-07T08:00:00Z']);
  assert.deepEqual(data.bookedIntervals, [{ appointment_at: '2030-01-07T08:00:00Z', appointment_end_at: '2030-01-07T09:00:00Z' }]);
  assert.deepEqual(Object.keys(data).sort(), ['bookedAppointmentAts', 'bookedIntervals', 'intervalProtectionReady']);
  assert.equal((await GET(new Request('https://example.test/api/appointments?slug=x&date=2030-02-30'))).status, 400);
});

test('Before the SQL migration, existing availability and booking writes still work', async () => {
  legacySchema = true;
  const availability = await get();
  assert.equal(availability.status, 200);
  const result = await availability.json();
  assert.equal(result.intervalProtectionReady, false);
  assert.deepEqual(result.bookedIntervals, []);
  assert.equal(result.bookedAppointmentAts.length, 1);
  assert.equal((await post(payload)).status, 201);
  assert.equal(insertAttempts, 2);
  assert.equal('duration_minutes' in inserted, false);
});

test('Availability errors remain closed instead of returning free slots', async () => {
  queryError = { code: 'XX000', message: 'unavailable' };
  assert.equal((await get()).status, 500);
});

test('Owner mutations require authentication and reject another owner', async () => {
  authUser = null;
  assert.equal((await patch({ action: 'confirm' })).status, 401);
  authUser = { id: 'other-owner' };
  assert.equal((await patch({ action: 'confirm' })).status, 404);
  assert.equal(updated, null);
});

test('Owners can confirm or cancel only their own current reservation', async () => {
  for (const [action, status] of [['confirm', 'confirmada'], ['cancel', 'cancelada']]) {
    assert.equal((await patch({ action })).status, 200);
    assert.deepEqual(updated, { status });
  }
  assert.ok(calls.some(([op, key, value]) => op === 'eq' && key === 'updated_at' && value === current.updated_at));
  current.status = 'cancelada'; updated = null;
  assert.equal((await patch({ action: 'confirm' })).status, 409);
  assert.equal(updated, null);
});

test('Reprogramming validates service, schedule and duration and keeps the existing status', async () => {
  assert.equal((await patch({ action: 'reschedule', ...payload, selectedTime: '10:00', appointmentAt: '2030-01-07T09:00:00.000Z' })).status, 200);
  assert.deepEqual(updated, { appointment_at: '2030-01-07T09:00:00.000Z', service_name: 'Consulta', duration_minutes: 60 });
  updated = null;
  assert.equal((await patch({ action: 'reschedule', ...payload, serviceName: 'Missing' })).status, 400);
  assert.equal(updated, null);
  mutationError = { code: '23P01' };
  assert.equal((await patch({ action: 'reschedule', ...payload })).status, 409);
});

test('Stale writes, invalid mutations, oversized bodies and pending migration report errors', async () => {
  stale = true;
  assert.equal((await patch({ action: 'confirm' })).status, 409);
  stale = false;
  assert.equal((await patch({ action: 'invalid' })).status, 400);
  assert.equal((await patch({ id: 'bad', action: 'cancel' })).status, 400);
  assert.equal((await patch({ action: 'confirm', extra: 'x'.repeat(9000) })).status, 413);
  mutationError = { code: 'PGRST204', message: 'duration_minutes missing from schema cache' };
  assert.equal((await patch({ action: 'reschedule', ...payload })).status, 503);
});
