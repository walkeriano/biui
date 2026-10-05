import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const requiredMessage = "Completa los campos obligatorios para reservar.";

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

  const customerName = cleanText(payload.customerName);
  const customerEmail = cleanText(payload.customerEmail);
  const customerPhone = cleanText(payload.customerPhone);
  const notes = cleanText(payload.notes);
  const serviceName = cleanText(payload.serviceName);
  const slug = cleanText(payload.slug);
  const selectedTime = cleanText(payload.selectedTime);
  const appointmentAt = parseAppointmentDate(payload.appointmentAt);

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

  const supabase = await createClient();
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

function cleanText(value) {
  return String(value ?? "").trim().slice(0, 500);
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
