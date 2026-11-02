import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { serviceDurationMinutes } from "@/lib/appointmentIntervals";
import { isSupabaseConfigured } from "@/lib/supabase/config";

import { dayRangeInZone, isDateKey, validateBooking } from "@/lib/booking";

const requiredMessage = "Completa los campos obligatorios para reservar.";

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

  if (!slug || !isDateKey(date)) {
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
    .select("id,user_id,availability")
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

  const dayRange = dayRangeInZone(date, page.availability?.timeZone);
  if (!dayRange) {
    return NextResponse.json({ error: "Fecha no disponible." }, { status: 400 });
  }

  let { data: appointments, error: appointmentsError } = await supabase
    .from("appointments")
    .select("appointment_at,appointment_end_at,status")
    .eq("professional_user_id", page.user_id)
    .gt("appointment_end_at", dayRange.start)
    .lt("appointment_at", dayRange.end)
    .neq("status", "cancelada");

  let intervalProtectionReady = true;
  if (isMissingIntervalSchema(appointmentsError)) {
    intervalProtectionReady = false;
    const legacy = await supabase.from("appointments").select("appointment_at,status")
      .eq("professional_user_id", page.user_id).gte("appointment_at", dayRange.start)
      .lt("appointment_at", dayRange.end).neq("status", "cancelada");
    appointments = legacy.data;
    appointmentsError = legacy.error;
  }
  if (appointmentsError) {
    return NextResponse.json(
      { error: "No se pudieron consultar los horarios ocupados." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    intervalProtectionReady,
    bookedIntervals: intervalProtectionReady ? (appointments ?? []).map(({ appointment_at, appointment_end_at }) => ({ appointment_at, appointment_end_at })) : [],
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
    const reader = request.body?.getReader();
    if (!reader) throw new Error("Empty body");
    const chunks = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 8192) {
        await reader.cancel();
        return NextResponse.json({ error: "Solicitud demasiado grande." }, { status: 413 });
      }
      chunks.push(value);
    }
    payload = JSON.parse(new TextDecoder().decode(Buffer.concat(chunks)));
  } catch {
    return NextResponse.json({ error: requiredMessage }, { status: 400 });
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
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

  const availabilityError = validateBooking({
    appointmentAt,
    availability: page.availability,
    selectedTime,
    serviceName,
    services: page.services,
  });

  if (availabilityError) {
    return NextResponse.json({ error: availabilityError }, { status: 400 });
  }

  const bookingRow = {
    appointment_at: appointmentAt.toISOString(),
    duration_minutes: serviceDurationMinutes(page.services.find((service) => service.name === serviceName)),
    customer_email: customerEmail || null, customer_name: customerName, customer_phone: customerPhone,
    notes: notes || null, professional_page_id: page.id, professional_user_id: page.user_id,
    service_name: serviceName, status: "pendiente",
  };
  let { data: appointment, error: insertError } = await supabase.from("appointments")
    .insert(bookingRow).select("id,appointment_at,status").single();
  // Keep existing bookings working until the operator installs the SQL migration.
  // Only a missing-column schema error is retryable: never retry a conflict/network error.
  if (isMissingIntervalSchema(insertError)) {
    const { duration_minutes: _duration, ...legacyRow } = bookingRow;
    void _duration;
    const legacy = await supabase.from("appointments").insert(legacyRow).select("id,appointment_at,status").single();
    appointment = legacy.data;
    insertError = legacy.error;
  }

  if (insertError) {
    const isDuplicate =
      insertError.code === "23505" || insertError.code === "23P01" ||
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

// Owner mutations use the authenticated client and RLS, never the admin key.
export async function PATCH(request) {
  if (!isSupabaseConfigured) return NextResponse.json({ error: "Servicio no disponible." }, { status: 503 });
  try {
    const supabase = await createClient();
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user) return NextResponse.json({ error: "Inicia sesión para gestionar reservas." }, { status: 401 });
    const payload = await readMutationBody(request);
    if (!payload || typeof payload !== "object" || Array.isArray(payload) ||
        typeof payload.id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.id)) {
      return NextResponse.json({ error: "Reserva no válida." }, { status: 400 });
    }
    const { data: current, error: readError } = await supabase.from("appointments")
      .select("id,status,professional_page_id,service_name,updated_at")
      .eq("id", payload.id).eq("professional_user_id", auth.user.id).maybeSingle();
    if (readError) return NextResponse.json({ error: "No se pudo consultar la reserva." }, { status: 500 });
    if (!current) return NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
    if (current.status === "cancelada") return NextResponse.json({ error: "Esta reserva ya está cancelada." }, { status: 409 });
    let changes;
    if (payload.action === "confirm" || payload.action === "cancel") {
      changes = { status: payload.action === "confirm" ? "confirmada" : "cancelada" };
    } else if (payload.action === "reschedule") {
      const { data: page, error: pageError } = await supabase.from("professional_pages")
        .select("services,availability").eq("id", current.professional_page_id)
        .eq("user_id", auth.user.id).maybeSingle();
      if (pageError) return NextResponse.json({ error: "No se pudo consultar la disponibilidad." }, { status: 500 });
      if (!page) return NextResponse.json({ error: "La página profesional ya no existe." }, { status: 400 });
      const appointmentAt = parseAppointmentDate(payload.appointmentAt);
      const serviceName = cleanText(payload.serviceName, 120) || current.service_name;
      const validation = validateBooking({ appointmentAt, availability: page.availability,
        selectedTime: cleanText(payload.selectedTime, 5), serviceName, services: page.services });
      if (validation) return NextResponse.json({ error: validation }, { status: 400 });
      changes = { appointment_at: appointmentAt.toISOString(), service_name: serviceName,
        duration_minutes: serviceDurationMinutes(page.services.find((service) => service.name === serviceName)) };
    } else return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
    const { data: appointment, error } = await supabase.from("appointments").update(changes)
      .eq("id", current.id).eq("professional_user_id", auth.user.id).eq("updated_at", current.updated_at)
      .select("id,status,appointment_at,service_name").maybeSingle();
    if (isMissingIntervalSchema(error)) return NextResponse.json({ error: "La reprogramación estará disponible al aplicar la migración de duración de reservas." }, { status: 503 });
    if (error) {
      const conflict = ["23505", "23P01"].includes(error.code);
      return NextResponse.json({ error: conflict ? "La cita se solapa con otra reserva. Elige otro horario." : "No se pudo actualizar la reserva." }, { status: conflict ? 409 : 500 });
    }
    if (!appointment) return NextResponse.json({ error: "La reserva cambió mientras la editabas. Actualiza e inténtalo de nuevo." }, { status: 409 });
    return NextResponse.json({ appointment });
  } catch (error) {
    return NextResponse.json({ error: error.message === "body_limit" ? "Solicitud demasiado grande." : "No se pudo procesar la solicitud." },
      { status: error.message === "body_limit" ? 413 : error instanceof SyntaxError ? 400 : 500 });
  }
}

async function readMutationBody(request) {
  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 8192) { await reader.cancel(); throw new Error("body_limit"); }
    chunks.push(value);
  }
  return JSON.parse(new TextDecoder().decode(Buffer.concat(chunks)));
}

function isMissingIntervalSchema(error) {
  return Boolean(error && ["42703", "PGRST204"].includes(error.code) &&
    /duration_minutes|appointment_end_at/.test(error.message || ""));
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
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function parseAppointmentDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) return null;
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getRateLimitHeaders({ resetAt }) {
  return {
    "Retry-After": String(Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))),
  };
}
