import test from 'node:test';
import assert from 'node:assert/strict';
import { appointmentIso, dayRangeInZone, dateKeyInZone, timeInZone, isDateKey, validateBooking } from '../src/lib/booking.js';
import { buildCurrentMonth, buildTimeSlots } from '../src/lib/availability.js';
import { safeNextPath } from '../src/lib/authRedirect.js';
import { sanitizeSlug, isReservedSlug } from '../src/lib/slug.js';
import { databaseRowToPublicPage, editorStateToPagePayload, pagePayloadToEditorState, sanitizeStoredImageUrl } from '../src/lib/professionalPage/mapper.js';
import { defaultPageData } from '../src/components/dashboard/MyPageView/data.js';

const valid = {
  appointmentAt: new Date('2030-01-07T08:00:00Z'),
  availability: { days: ['Lun'], start: '09:00', end: '12:00', times: ['09:00', '10:00'], timeZone: 'Europe/Madrid' },
  selectedTime: '09:00', serviceName: 'Consulta', services: [{ name: 'Consulta' }],
};

test('Booking dates use the professional timezone including winter/summer DST', () => {
  assert.equal(appointmentIso('2030-01-07', '09:00'), '2030-01-07T08:00:00.000Z');
  assert.equal(appointmentIso('2030-07-08', '09:00'), '2030-07-08T07:00:00.000Z');
  assert.equal(timeInZone('2030-07-08T07:00:00Z'), '09:00');
  assert.equal(dateKeyInZone('2030-07-07T23:00:00Z'), '2030-07-08');
  assert.equal(appointmentIso('2030-03-31', '02:30'), null);
});

test('Day queries cover the whole professional day, including 23/25-hour DST days', () => {
  for (const [day, hours] of [['2030-03-31', 23], ['2030-10-27', 25]]) {
    const range = dayRangeInZone(day);
    assert.equal((Date.parse(range.end) - Date.parse(range.start)) / 3600000, hours);
  }
  assert.equal(isDateKey('2030-02-30'), false);
  assert.equal(dayRangeInZone('no-date'), null);
});

test('Empty schedules/services fail closed; configured slots and exact instants are enforced', () => {
  assert.equal(validateBooking(valid), '');
  for (const patch of [
    { services: [] }, { serviceName: 'Inventado' },
    { availability: { ...valid.availability, days: [] } },
    { availability: { ...valid.availability, times: [] } },
    { availability: { ...valid.availability, end: '08:00' } },
    { selectedTime: '10:00' },
    { appointmentAt: new Date('2030-01-07T08:00:01Z') },
    { appointmentAt: new Date('2000-01-01T08:00:00Z') },
  ]) assert.notEqual(validateBooking({ ...valid, ...patch }), '');
});

test('Calendar supports subsequent months, empty availability and strict time ranges', () => {
  const month = buildCurrentMonth(['Lun'], { now: new Date('2030-01-31T12:00Z'), monthOffset: 1 });
  assert.equal(month.key, '2030-02');
  assert.equal(month.cells.find((cell) => cell.dayNumber === 4).isAvailable, true);
  assert.equal(buildCurrentMonth([]).firstAvailableDay, null);
  assert.deepEqual(buildTimeSlots('09:00', '11:00'), ['09:00', '10:00']);
  assert.deepEqual(buildTimeSlots('09:', '11:00'), []);
  assert.deepEqual(buildTimeSlots('09:00', '11:00', 0), []);
});

test('Login destinations cannot execute scripts or redirect outside the dashboard', () => {
  for (const input of ['javascript:alert(1)', '//evil.test', 'https://evil.test', '/dashboard\\evil', '/dashboard-other', null]) {
    assert.equal(safeNextPath(input), '/dashboard');
  }
  assert.equal(safeNextPath('/dashboard?view=page'), '/dashboard?view=page');
  assert.equal(isReservedSlug(sanitizeSlug('Dashboard')), true);
  assert.equal(sanitizeSlug(undefined), '');
});

test('Real published pages preserve empty services and never inject demo contact details', () => {
  const page = databaseRowToPublicPage({ services: [], professional: {} });
  assert.deepEqual(page.services, []);
  assert.deepEqual(pagePayloadToEditorState(page).services, []);
  assert.equal(page.contact.phone, '');
  assert.equal(page.professional.name, 'Profesional');
  assert.equal(sanitizeStoredImageUrl('javascript:alert(1)'), '');
  assert.equal(sanitizeStoredImageUrl('data:image/svg+xml,x'), '');
  assert.equal(sanitizeStoredImageUrl('//evil.test/a.png'), '');
  assert.equal(sanitizeStoredImageUrl('https://example.com/a.png'), 'https://example.com/a.png');
});

test('Publishing serializes the real professional, normalized slug and the same booking schedule', () => {
  const payload = editorStateToPagePayload({
    availableDays: ['Lun'],
    data: { ...defaultPageData, publicSlug: 'Mi Página', scheduleStart: '09:00', scheduleEnd: '11:00', heroImage: 'blob:local' },
    professional: { name: 'Ana Pérez', title: 'Profesional' },
    services: [{ id: 1, name: 'Consulta', image: 'https://example.com/image.png' }],
  });
  assert.equal(payload.slug, 'mi-pagina');
  assert.equal(payload.professional.name, 'Ana Pérez');
  assert.equal(payload.published, true);
  assert.equal(payload.hero.image, '');
  assert.equal(validateBooking({ ...valid, availability: payload.availability, services: payload.services }), '');
  const restored = pagePayloadToEditorState(payload);
  assert.equal(restored.data.publicSlug, payload.slug);
  assert.deepEqual(restored.availableDays, ['Lun']);
});
