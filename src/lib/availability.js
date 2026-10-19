export const calendarDays = ["L", "M", "X", "J", "V", "S", "D"];

const dayNames = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];

export function buildAvailability({ days = [], end = "20:00", start = "09:00", monthOffset = 0, now = new Date() }) {
  const slots = buildTimeSlots(start, end);
  const month = buildCurrentMonth(days, { monthOffset, now });

  return {
    month,
    slots,
  };
}

export function buildTimeSlots(start, end, intervalMinutes = 60) {
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);

  if (startMinutes === null || endMinutes === null || startMinutes >= endMinutes) {
    return [];
  }

  const slots = [];

  if (!Number.isFinite(intervalMinutes) || intervalMinutes <= 0) return slots;

  for (
    let current = startMinutes;
    current < endMinutes;
    current += intervalMinutes
  ) {
    slots.push(minutesToTime(current));
  }

  return slots;
}

export function buildCurrentMonth(availableDays, { monthOffset = 0, now = new Date() } = {}) {
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const firstDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + monthOffset, 1));
  const year = firstDay.getUTCFullYear();
  const month = firstDay.getUTCMonth();
  const totalDays = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const leadingEmptyDays = (firstDay.getUTCDay() + 6) % 7;
  const cells = [];

  for (let index = 0; index < leadingEmptyDays; index += 1) {
    cells.push({ dayNumber: null, isAvailable: false });
  }

  for (let dayNumber = 1; dayNumber <= totalDays; dayNumber += 1) {
    const date = new Date(Date.UTC(year, month, dayNumber));
    const dayName = dayNames[date.getUTCDay()];

    cells.push({
      dayName,
      dayNumber,
      isAvailable: date >= today && availableDays.includes(dayName),
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ dayNumber: null, isAvailable: false });
  }

  const firstAvailableDay =
    cells.find((cell) => cell.dayNumber && cell.isAvailable)?.dayNumber ??
    null;

  return {
    cells,
    key: `${year}-${String(month + 1).padStart(2, "0")}`,
    firstAvailableDay,
    label: new Intl.DateTimeFormat("es", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(firstDay),
  };
}

export function formatSelectedDay(dayNumber) {
  const today = new Date();
  const date = new Date(today.getFullYear(), today.getMonth(), dayNumber);

  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(date);
}

function timeToMinutes(time) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(time))) return null;
  const [hours, minutes] = String(time).split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}
