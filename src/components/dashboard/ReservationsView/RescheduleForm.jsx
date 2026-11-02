"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { appointmentIso, availableTimes, dateKeyInZone, getTimeZone, timeInZone, validateBooking } from "@/lib/booking";

export default function RescheduleForm({ appointment, busy, onCancel, onSave }) {
  const { supabase, user } = useAuth();
  const [page, setPage] = useState(null);
  const [error, setError] = useState("");
  const [date, setDate] = useState(() => dateKeyInZone(appointment.appointment_at));
  const [time, setTime] = useState(() => timeInZone(appointment.appointment_at));
  const [service, setService] = useState(appointment.service_name);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const { data, error } = await supabase.from("professional_pages").select("services,availability")
          .eq("id", appointment.professional_page_id).eq("user_id", user.id).maybeSingle();
        if (!active) return;
        if (error || !data) throw new Error("No se pudo cargar la disponibilidad de esta página.");
        setDate(dateKeyInZone(appointment.appointment_at, data.availability?.timeZone));
        setTime(timeInZone(appointment.appointment_at, data.availability?.timeZone));
        setPage(data);
      } catch (error) {
        if (active) setError(error.message || "No se pudo cargar la disponibilidad.");
      }
    }
    load();
    return () => { active = false; };
  }, [appointment, supabase, user]);

  const zone = getTimeZone(page?.availability?.timeZone);
  const instant = appointmentIso(date, time, zone);
  const validation = page ? validateBooking({ appointmentAt: instant ? new Date(instant) : null,
    availability: page.availability, selectedTime: time, serviceName: service, services: page.services }) : "Cargando...";
  const fieldClass = "h-11 w-full rounded-md border border-line bg-surface px-3 text-sm";

  async function submit(event) {
    event.preventDefault();
    if (busy || validation) return;
    await onSave({ action: "reschedule", appointmentAt: instant, selectedTime: time, serviceName: service });
  }

  return (
    <form className="grid gap-3 rounded-md bg-surface-muted p-4 sm:grid-cols-3" onSubmit={submit} aria-label={`Reprogramar cita de ${appointment.customer_name}`}>
      {error ? <p role="alert" className="text-danger sm:col-span-3">{error}</p> : !page ? <p role="status">Cargando disponibilidad...</p> : (
        <>
          <label className="grid gap-1 font-bold">Servicio<select className={fieldClass} value={service} onChange={(event) => setService(event.target.value)} disabled={busy} required>
            <option value="">Selecciona un servicio</option>
            {page.services.map((item) => <option key={item.id ?? item.name} value={item.name}>{item.name}</option>)}
          </select></label>
          <label className="grid gap-1 font-bold">Fecha<input className={fieldClass} type="date" min={dateKeyInZone(new Date(), zone)} value={date} onChange={(event) => setDate(event.target.value)} disabled={busy} required /></label>
          <label className="grid gap-1 font-bold">Hora<select className={fieldClass} value={time} onChange={(event) => setTime(event.target.value)} disabled={busy} required>
            <option value="">Selecciona una hora</option>
            {availableTimes(page.availability).map((slot) => <option key={slot} value={slot}>{slot}</option>)}
          </select></label>
          <p className="text-xs text-muted sm:col-span-3">Zona horaria: {zone}. Se comprobará que el horario está libre al guardar.</p>
          {validation ? <p role="status" className="text-sm text-danger sm:col-span-3">{validation}</p> : null}
        </>
      )}
      <div className="flex flex-wrap gap-2 sm:col-span-3">
        <button className="min-h-11 rounded-md bg-accent px-4 font-bold text-white disabled:opacity-50" disabled={busy || !page || Boolean(validation)}>{busy ? "Guardando..." : "Guardar nueva fecha"}</button>
        <button type="button" className="min-h-11 rounded-md border border-line px-4 font-bold" disabled={busy} onClick={onCancel}>Volver</button>
      </div>
    </form>
  );
}
