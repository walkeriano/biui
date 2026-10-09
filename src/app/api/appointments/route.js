import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const requiredMessage = "Completa los campos obligatorios para reservar.";
const defaultTimeZone = "Europe/Madrid";
const weekdayMap = {
  dom: "Dom",
  jue: "Jue",
  lun: "Lun",
  mar: "Mar",
  mie: "Mie",
  sab: "Sab",
  vie: "Vie",
};

export async function GET(request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: "Supabase no esta configurado para consultar horarios." },
      { status: 503 },
    );
  }

  const supabase = getAdminClient();

  if (supabase instanceof NextResponse) {
    return supabase;
  }

  const { searchParams } = new URL(request.url);
  const slug = cleanText(searchParams.get("slug"), 80);
  const date = cleanText(searchParams.get("date"), 10);
  const dayRange = getDayRange(date);

  if (!slug || !dayRange) {
    return NextResponse.json(
      { error: "Indica una pagina y fecha valida." },
      { status: 400 },
    );
  }

  const rateLimit = checkRateLimit({
    key: `appointments:get:${getClientIp(request)}:${slug}`,
    limit: 30,
  });

  if (rateLimit.isLimited) {
    return NextResponse.json(
      { error: "Demasiadas consultas de horarios. Intentalo en unos minutos." },
      {
        headers: getRateLimitHeaders(rateLimit),
        status: 429,
      },
    );
  }

  const { data: page, error: pageError } = await supabase
    .from("professional_pages")
    .select("id,user_id")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (pageError) {
    return NextResponse.json(
      { error: "No se pudo validar la pagina profesional." },
      { status: 500 },
    );
  }

  if (!page) {
    return NextResponse.json(
      { error: "La pagina profesional no esta disponible." },
      { status: 404 },
    );
  }

  const { data: appointments, error: appointmentsError } = await supabase
    .from("appointments")
    .select("appointment_at,status")
    .eq("professional_user_id", page.user_id)
    .gte("appointment_at", dayRange.start.toISOString())
    .lt("appointment_at", dayRange.end.toISOString())
    .neq("status", "cancelada");

  if (appointmentsError) {
    return NextResponse.json(
      { error: "No se pudieron consultar los horarios ocupados." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    bookedAppointmentAts: (appointments ?? []).map(
      (appointment) => appointment.appointment_at,
    ),
  });
}

export async function POST(request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: "Supabase no esta configurado para crear reservas." },
      { status: 503 },
    );
  }

  let payload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: requiredMessage }, { status: 400 });
  }

  const customerName = cleanText(payload.customerName, 120);
  const customerEmail = cleanText(payload.customerEmail, 254);
  const customerPhone = cleanText(payload.customerPhone, 40);
  const notes = cleanText(payload.notes, 500);
  const serviceName = cleanText(payload.serviceName, 120);
  const slug = cleanText(payload.slug, 80);
  const selectedTime = cleanText(payload.selectedTime, 5);
  const appointmentAt = parseAppointmentDate(payload.appointmentAt);

  if (cleanText(payload.website, 120)) {
    return NextResponse.json({ ok: true }, { status: 202 });
  }

  if (
    !customerName ||
    !customerPhone ||
    !serviceName ||
    !slug ||
    !selectedTime ||
    !appointmentAt
  ) {
    return NextResponse.json({ error: requiredMessage }, { status: 400 });
  }

  if (customerEmail && !isValidEmail(customerEmail)) {
    return NextResponse.json(
      { error: "Introduce un email valido o deja el campo vacio." },
      { status: 400 },
    );
  }

  const rateLimit = checkRateLimit({
    key: `appointments:post:${getClientIp(request)}:${slug}`,
    limit: 5,
  });

  if (rateLimit.isLimited) {
    return NextResponse.json(
      { error: "Demasiadas reservas desde esta conexion. Intentalo mas tarde." },
      {
        headers: getRateLimitHeaders(rateLimit),
        status: 429,
      },
    );
  }

  const supabase = getAdminClient();

  if (supabase instanceof NextResponse) {
    return supabase;
  }

  const { data: page, error: pageError } = await supabase
    .from("professional_pages")
    .select("id,user_id,slug,published,availability,services")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (pageError) {
    return NextResponse.json(
      { error: "No se pudo validar la pagina profesional." },
      { status: 500 },
    );
  }

  if (!page) {
    return NextResponse.json(
      { error: "La pagina profesional no esta disponible." },
      { status: 404 },
    );
  }

  const availabilityError = validateAvailability({
    appointmentAt,
    availability: page.availability,
    selectedTime,
    serviceName,
    services: page.services,
  });

  if (availabilityError) {
    return NextResponse.json({ error: availabilityError }, { status: 400 });
  }

  const { data: appointment, error: insertError } = await supabase
    .from("appointments")
    .insert({
      appointment_at: appointmentAt.toISOString(),
      customer_email: customerEmail || null,
      customer_name: customerName,
      customer_phone: customerPhone,
      notes: notes || null,
      professional_page_id: page.id,
      professional_user_id: page.user_id,
      service_name: serviceName,
      status: "pendiente",
    })
    .select("id,appointment_at,status")
    .single();

  if (insertError) {
    const isDuplicate =
      insertError.code === "23505" ||
      insertError.message?.toLowerCase().includes("duplicate");

    return NextResponse.json(
      {
        error: isDuplicate
          ? "Ese horario acaba de ocuparse. Elige otro horario disponible."
          : "No se pudo crear la reserva. Intentalo de nuevo.",
      },
      { status: isDuplicate ? 409 : 500 },
    );
  }

  return NextResponse.json({ appointment }, { status: 201 });
}

function getAdminClient() {
  const supabase = createAdminClient();

  if (!supabase) {
    return NextResponse.json(
      {
        error:
          "Falta SUPABASE_SERVICE_ROLE_KEY para operar reservas de forma segura.",
      },
      { status: 503 },
    );
  }

  return supabase;
}

function cleanText(value, maxLength = 500) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function parseAppointmentDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getDayRange(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null;
  }

  const start = new Date(`${date}T00:00:00`);

  if (Number.isNaN(start.getTime())) {
    return null;
  }

  const end = new Date(start);
  end.setDate(start.getDate() + 1);

  return { end, start };
}

function validateAvailability({
  appointmentAt,
  availability,
  selectedTime,
  serviceName,
  services,
}) {
  if (appointmentAt < new Date()) {
    return "Elige una fecha futura para la reserva.";
  }

  if (!/^\d{2}:\d{2}$/.test(selectedTime)) {
    return "El horario seleccionado no es valido.";
  }

  const timeZone = cleanText(availability?.timeZone, 80) || defaultTimeZone;
  const appointmentTime = formatTimeInZone(appointmentAt, timeZone);

  if (appointmentTime !== selectedTime) {
    return "El horario seleccionado no coincide con la fecha de la reserva.";
  }

  const allowedDays = Array.isArray(availability?.days) ? availability.days : [];
  const appointmentDay = formatWeekdayInZone(appointmentAt, timeZone);

  if (allowedDays.length && !allowedDays.includes(appointmentDay)) {
    return "El dia seleccionado no esta disponible para reservas.";
  }

  const allowedServices = Array.isArray(services)
    ? services.map((service) => service.name).filter(Boolean)
    : [];

  if (allowedServices.length && !allowedServices.includes(serviceName)) {
    return "Selecciona un servicio disponible en esta pagina.";
  }

  const allowedTimes = Array.isArray(availability?.times) ? availability.times : [];
  if (allowedTimes.length && !allowedTimes.includes(selectedTime)) {
    return "El horario seleccionado no esta disponible.";
  }

  return "";
}

function formatTimeInZone(date, timeZone) {
  const parts = createDateTimeFormat({
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    timeZone,
  }).formatToParts(date);
  const hour = parts.find((part) => part.type === "hour")?.value ?? "";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "";

  return `${hour}:${minute}`;
}

function formatWeekdayInZone(date, timeZone) {
  const weekday = createDateTimeFormat({
    timeZone,
    weekday: "short",
  }).format(date);
  const normalized = weekday
    .normalize("NFD")
    .replace(/[\u0300-\u036f.]/g, "")
    .toLowerCase()
    .slice(0, 3);

  return weekdayMap[normalized] ?? "";
}

function createDateTimeFormat(options) {
  try {
    return new Intl.DateTimeFormat("es-ES", options);
  } catch {
    return new Intl.DateTimeFormat("es-ES", {
      ...options,
      timeZone: defaultTimeZone,
    });
  }
}

function getRateLimitHeaders({ resetAt }) {
  return {
    "Retry-After": String(Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))),
  };
}
