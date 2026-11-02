// Legacy pages store labels such as "50 minutos". New writes also store minutes.
export function serviceDurationMinutes(service) {
  const value = service?.durationMinutes ?? service?.duration;
  const match = typeof value === "string" && value.trim().match(/^(\d+)\s*(?:minutos?|minutes?|mins?)?$/i);
  const minutes = typeof value === "number" ? value : match ? Number(match[1]) : NaN;
  return Number.isInteger(minutes) && minutes > 0 && minutes <= 1440 ? minutes : null;
}

export function appointmentEnd(appointmentAt, minutes) {
  return new Date(new Date(appointmentAt).getTime() + minutes * 60000).toISOString();
}

export function intervalsOverlap(start, end, otherStart, otherEnd) {
  return Date.parse(start) < Date.parse(otherEnd) && Date.parse(otherStart) < Date.parse(end);
}

export function occupiedTimes({ dateKey, times, timeZone, durationMinutes, intervals, resolveInstant }) {
  if (!durationMinutes) return times;
  return times.filter((time) => {
    const start = resolveInstant(dateKey, time, timeZone);
    return !start || intervals.some((item) => intervalsOverlap(
      start, appointmentEnd(start, durationMinutes), item.appointment_at, item.appointment_end_at,
    ));
  });
}
