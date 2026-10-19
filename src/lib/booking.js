import { buildTimeSlots } from "./availability.js";

export const defaultTimeZone = "Europe/Madrid";
const dayNames = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];

export function getTimeZone(value) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value || defaultTimeZone }).format();
    return value || defaultTimeZone;
  } catch {
    return defaultTimeZone;
  }
}

export function dateKeyInZone(value, timeZone = defaultTimeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: getTimeZone(timeZone), year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date(value));
  const part = (type) => parts.find((item) => item.type === type).value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function timeInZone(value, timeZone = defaultTimeZone) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: getTimeZone(timeZone), hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(new Date(value));
}

export function isDateKey(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// Resolve a wall clock time in the professional's zone, independent of the visitor.
// Round-trip validation rejects nonexistent times during the spring DST change.
export function appointmentIso(dateKey, time, timeZone = defaultTimeZone) {
  if (!isDateKey(dateKey) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return null;
  const target = Date.parse(`${dateKey}T${time}:00Z`);
  let instant = target;
  for (let index = 0; index < 4; index += 1) {
    const local = `${dateKeyInZone(instant, timeZone)}T${timeInZone(instant, timeZone)}:00Z`;
    const correction = target - Date.parse(local);
    if (!correction) return new Date(instant).toISOString();
    instant += correction;
  }
  return null;
}

export function dayRangeInZone(dateKey, timeZone = defaultTimeZone) {
  if (!isDateKey(dateKey)) return null;
  const next = new Date(`${dateKey}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  const start = appointmentIso(dateKey, "00:00", timeZone);
  const end = appointmentIso(next.toISOString().slice(0, 10), "00:00", timeZone);
  return start && end ? { start, end } : null;
}

export function availableTimes(availability) {
  const generated = buildTimeSlots(availability?.start, availability?.end);
  if (!Array.isArray(availability?.times)) return generated;
  if (!generated.length) return [];
  return [...new Set(availability.times.filter((time) =>
    typeof time === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(time) &&
    time >= availability.start && time < availability.end,
  ))].sort();
}

export function validateBooking({ appointmentAt, availability, selectedTime, serviceName, services }, now = new Date()) {
  if (!(appointmentAt instanceof Date) || Number.isNaN(appointmentAt.getTime()) || appointmentAt <= now) {
    return "Elige una fecha futura para la reserva.";
  }
  if (appointmentAt.getUTCSeconds() || appointmentAt.getUTCMilliseconds()) {
    return "El horario seleccionado no es valido.";
  }
  const zone = getTimeZone(availability?.timeZone);
  if (timeInZone(appointmentAt, zone) !== selectedTime) {
    return "El horario seleccionado no coincide con la fecha de la reserva.";
  }
  const dateKey = dateKeyInZone(appointmentAt, zone);
  const day = dayNames[new Date(`${dateKey}T12:00:00Z`).getUTCDay()];
  if (!Array.isArray(availability?.days) || !availability.days.includes(day)) {
    return "El dia seleccionado no esta disponible para reservas.";
  }
  if (!Array.isArray(services) || !services.some((service) => service?.name && service.name === serviceName)) {
    return "Selecciona un servicio disponible en esta pagina.";
  }
  if (!availableTimes(availability).includes(selectedTime)) {
    return "El horario seleccionado no esta disponible.";
  }
  return "";
}
