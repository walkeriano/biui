"use client";

import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faCheck,
  faClock,
  faEnvelope,
  faPhone,
  faUser,
} from "@/lib/fontawesome";
import {
  buildAvailability,
  calendarDays,
  formatSelectedDay,
} from "@/lib/availability";

export default function PublicBookingSection({ page }) {
  const availability = useMemo(
    () =>
      buildAvailability({
        days: page.availability.days,
        end: page.availability.end,
        start: page.availability.start,
      }),
    [page.availability.days, page.availability.end, page.availability.start],
  );
  const [selectedDay, setSelectedDay] = useState(
    availability.month.firstAvailableDay,
  );
  const [selectedTime, setSelectedTime] = useState(availability.slots[0] ?? "");
  const [selectedService, setSelectedService] = useState(
    page.services[0]?.name ?? "",
  );
  const [formData, setFormData] = useState({
    customerEmail: "",
    customerName: "",
    customerPhone: "",
    notes: "",
  });
  const [status, setStatus] = useState({ message: "", state: "idle" });
  const selectedDayLabel = formatSelectedDay(selectedDay);
  const canSubmit = Boolean(
    selectedDay &&
    selectedTime &&
    selectedService &&
    formData.customerName.trim() &&
    formData.customerPhone.trim() &&
    status.state !== "submitting",
  );

  const updateField = (key, value) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canSubmit) {
      setStatus({
        message: "Completa nombre, telefono, servicio, dia y horario.",
        state: "error",
      });
      return;
    }

    setStatus({ message: "Creando tu reserva...", state: "submitting" });

    const response = await fetch("/api/appointments", {
      body: JSON.stringify({
        ...formData,
        appointmentAt: buildAppointmentIso(selectedDay, selectedTime),
        selectedTime,
        serviceName: selectedService,
        slug: page.slug,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const result = await response.json();

    if (!response.ok) {
      setStatus({
        message: result.error || "No se pudo crear la reserva.",
        state: "error",
      });
      return;
    }

    setFormData({
      customerEmail: "",
      customerName: "",
      customerPhone: "",
      notes: "",
    });
    setStatus({
      message: "Reserva creada correctamente. El profesional la vera en su panel.",
      state: "success",
    });
  };

  return (
    <section id="reservar" className="bg-[#f7fbf7] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
            Reserva tu cita
          </p>
          <h2
            className="mt-2 text-3xl font-bold text-foreground sm:text-4xl"
            style={{ fontFamily: page.theme.titleFont }}
          >
            Elige un dia y horario disponible
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Selecciona la fecha y el horario que mejor se adapte a ti. Esta
            disponibilidad se alimenta desde la configuracion del profesional.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_25rem]"
        >
          <div className="rounded-card border border-line bg-white p-5 shadow-card">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold capitalize text-foreground">
                  {availability.month.label}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Dias disponibles segun la configuracion publica
                </p>
              </div>
              <FontAwesomeIcon
                icon={faCalendarDays}
                className="size-5"
                style={{ color: page.theme.primaryColor }}
              />
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-muted">
              {calendarDays.map((day) => (
                <span key={day}>{day}</span>
              ))}
              {availability.month.cells.map((cell, index) => {
                const isSelected = cell.dayNumber === selectedDay;

                return (
                  <button
                    key={index}
                    type="button"
                    disabled={!cell.isAvailable}
                    onClick={() => setSelectedDay(cell.dayNumber)}
                    className={
                      !cell.dayNumber
                        ? "h-11 rounded-md text-transparent"
                        : isSelected
                          ? "h-11 rounded-md text-sm font-bold text-white"
                          : cell.isAvailable
                            ? "h-11 rounded-md bg-success-soft text-sm font-bold text-success transition hover:ring-2 hover:ring-success-soft"
                            : "h-11 rounded-md bg-surface-muted text-sm font-bold text-muted"
                    }
                    style={
                      isSelected
                        ? { backgroundColor: page.theme.primaryColor }
                        : undefined
                    }
                  >
                    {cell.dayNumber ?? ""}
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="rounded-card border border-line bg-white p-5 shadow-card">
            <label className="block">
              <span className="text-sm font-bold text-foreground">Servicio</span>
              <select
                value={selectedService}
                onChange={(event) => setSelectedService(event.target.value)}
                className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm font-bold text-foreground outline-none transition focus:border-accent focus:ring-4 focus:ring-accent-soft"
              >
                {page.services.map((service) => (
                  <option key={service.id} value={service.name}>
                    {service.name}
                  </option>
                ))}
              </select>
            </label>

            <p className="mt-5 text-sm font-bold text-foreground">
              Horarios disponibles
            </p>
            <p className="mt-1 text-xs text-muted">
              <span className="capitalize">{selectedDayLabel}</span>
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {availability.slots.length ? (
                availability.slots.map((time) => {
                const isActive = selectedTime === time;

                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={
                      isActive
                        ? "h-11 rounded-md text-sm font-bold text-white"
                        : "h-11 rounded-md border text-sm font-bold transition hover:bg-primary hover:text-white"
                    }
                    style={
                      isActive
                        ? { backgroundColor: page.theme.primaryColor }
                        : {
                            color: page.theme.primaryColor,
                            borderColor: `${page.theme.primaryColor}33`,
                          }
                    }
                  >
                    {time}
                  </button>
                );
                })
              ) : (
                <p className="col-span-full rounded-md bg-surface-muted px-3 py-3 text-sm text-muted">
                  No hay horarios disponibles para este rango.
                </p>
              )}
            </div>

            <div className="mt-5 rounded-card bg-surface-muted p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
                Resumen
              </p>
              <p className="mt-2 text-sm font-bold text-foreground">
                {page.professional.name}
              </p>
              <p className="mt-1 text-sm text-muted">
                {selectedService}
              </p>
              <p className="mt-1 text-sm text-muted">
                <span className="capitalize">{selectedDayLabel}</span>
                {selectedTime ? ` · ${selectedTime}` : ""}
              </p>
            </div>

            <div className="mt-5 grid gap-3">
              <label className="block">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  <FontAwesomeIcon icon={faUser} className="size-3" />
                  Nombre
                </span>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(event) => updateField("customerName", event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm font-bold text-foreground outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent-soft"
                  placeholder="Tu nombre"
                  required
                />
              </label>

              <label className="block">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  <FontAwesomeIcon icon={faPhone} className="size-3" />
                  Telefono
                </span>
                <input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(event) => updateField("customerPhone", event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm font-bold text-foreground outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent-soft"
                  placeholder="+34 600 000 000"
                  required
                />
              </label>

              <label className="block">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  <FontAwesomeIcon icon={faEnvelope} className="size-3" />
                  Email
                </span>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(event) => updateField("customerEmail", event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm font-bold text-foreground outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent-soft"
                  placeholder="tu@email.com"
                />
              </label>

              <label className="block">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  <FontAwesomeIcon icon={faClock} className="size-3" />
                  Notas
                </span>
                <textarea
                  value={formData.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                  className="mt-2 min-h-20 w-full resize-none rounded-md border border-line bg-white px-3 py-2.5 text-sm font-medium leading-5 text-foreground outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent-soft"
                  placeholder="Algo que quieras comentar antes de la cita"
                />
              </label>
            </div>

            {status.message ? (
              <p
                className={
                  status.state === "success"
                    ? "mt-4 rounded-md bg-success-soft px-3 py-2 text-sm font-bold text-success"
                    : status.state === "error"
                      ? "mt-4 rounded-md bg-danger-soft px-3 py-2 text-sm font-bold text-danger"
                      : "mt-4 rounded-md bg-surface-muted px-3 py-2 text-sm font-bold text-muted"
                }
              >
                {status.message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-md text-sm font-bold text-white transition hover:opacity-90"
              style={{
                backgroundColor: canSubmit
                  ? page.theme.secondaryColor
                  : `${page.theme.secondaryColor}80`,
              }}
            >
              {status.state === "submitting" ? "Confirmando..." : "Confirmar reserva"}
              <FontAwesomeIcon icon={faCheck} className="size-4" />
            </button>
          </aside>
        </form>
      </div>
    </section>
  );
}

function buildAppointmentIso(dayNumber, time) {
  const [hours, minutes] = time.split(":").map(Number);
  const today = new Date();
  const appointment = new Date(
    today.getFullYear(),
    today.getMonth(),
    dayNumber,
    hours,
    minutes,
    0,
    0,
  );

  return appointment.toISOString();
}
