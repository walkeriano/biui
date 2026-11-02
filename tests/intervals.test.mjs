import test from 'node:test';
import assert from 'node:assert/strict';
import { serviceDurationMinutes, appointmentEnd, intervalsOverlap, occupiedTimes } from '../src/lib/appointmentIntervals.js';
import { appointmentIso, validateBooking } from '../src/lib/booking.js';

test('Legacy service labels and numeric duration snapshots remain compatible', () => {
  assert.equal(serviceDurationMinutes({ duration: '50 minutos' }), 50);
  assert.equal(serviceDurationMinutes({ duration: '90 minutos' }), 90);
  assert.equal(serviceDurationMinutes({ durationMinutes: 60, duration: '50 minutos' }), 60);
  for (const value of [-1, 0, 1441, 1.5, 'invalid', null]) assert.equal(serviceDurationMinutes({ durationMinutes: value }), null);
});

test('A 90 minute service blocks starts inside the interval, but adjacent appointments fit', () => {
  const intervals = [{ appointment_at: '2030-01-07T08:00:00.000Z', appointment_end_at: '2030-01-07T09:30:00.000Z' }];
  assert.deepEqual(occupiedTimes({ dateKey: '2030-01-07', times: ['09:00', '10:00', '10:30', '11:00'], timeZone: 'Europe/Madrid', durationMinutes: 50, intervals, resolveInstant: appointmentIso }), ['09:00', '10:00']);
  assert.equal(intervalsOverlap('2030-01-07T07:00Z', '2030-01-07T08:00Z', intervals[0].appointment_at, intervals[0].appointment_end_at), false);
  assert.equal(intervalsOverlap('2030-01-07T07:00Z', '2030-01-07T08:30Z', intervals[0].appointment_at, intervals[0].appointment_end_at), true);
  assert.equal(appointmentEnd('2030-01-07T08:00:00Z', 90), '2030-01-07T09:30:00.000Z');
});

test('New appointments must end before closing and require a valid duration', () => {
  const booking = { appointmentAt: new Date('2030-01-07T09:00:00Z'), selectedTime: '10:00', serviceName: 'Consulta', services: [{ name: 'Consulta', duration: '90 minutos' }], availability: { days: ['Lun'], times: ['10:00'], start: '09:00', end: '11:00', timeZone: 'Europe/Madrid' } };
  assert.match(validateBooking(booking), /terminar/);
  assert.equal(validateBooking({ ...booking, services: [{ name: 'Consulta', duration: '60 minutos' }] }), '');
  assert.match(validateBooking({ ...booking, services: [{ name: 'Consulta', duration: 'unknown' }] }), /duracion/);
});
