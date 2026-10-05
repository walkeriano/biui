"use client";

import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faCalendarDays,
  faCheck,
  faCircleCheck,
  faClock,
  faEnvelope,
  faLotus,
  faPhone,
  faUser,
} from "@/lib/fontawesome";
import {
  buildAvailability,
  calendarDays,
  formatSelectedDay,
} from "@/lib/availability";
import { getButtonClassName, getButtonStyle } from "@/components/public-page/theme";

const steps = ["Servicio", "Fecha", "Hora", "Tus datos"];

export default function PublicBookingSection({ page, previewMode = false }) {
  const availability = useMemo(
    () =>
      buildAvailability({
        days: page.availability.days,
        end: page.availability.end,
        start: page.availability.start,
      }),
    [page.availability.days, page.availability.end, page.availability.start],
  );
  const [hasSelectedService, setHasSelectedService] = useState(false);
  const [selectedDay, setSelectedDay] = useState(
    availability.month.firstAvailableDay,
  );
  const [hasSelectedDay, setHasSelectedDay] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [formData, setFormData] = useState({
    customerEmail: "",
    customerName: "",
    customerPhone: "",
    notes: "",
  });
  const [status, setStatus] = useState({ message: "", state: "idle" });
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const selectedDayLabel = formatSelectedDay(selectedDay);
  const currentStep = getCurrentStep({
    hasSelectedDay,
    hasSelectedService,
    selectedTime,
  });
  const canSubmit = Boolean(
    hasSelectedDay &&
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

    if (previewMode) {
      setStatus({
        message: "Vista previa: asi se vera la confirmacion de reserva.",
        state: "success",
      });
      setIsSuccessModalOpen(true);
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
    setIsSuccessModalOpen(true);
  };

  return (
    <section
      id="reservar"
      className="px-4 py-20 sm:px-6 lg:px-8"
      style={{
        backgroundColor: `color-mix(in srgb, ${page.theme.secondaryColor} 10%, white)`,
      }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p
            className="text-xs font-bold uppercase tracking-[0.24em]"
            style={{ color: page.theme.secondaryColor }}
          >
            Reserva tu cita
          </p>
          <h2
            className="mt-3 text-4xl font-bold leading-tight text-[#061923] sm:text-5xl"
            style={{ fontFamily: page.theme.titleFont }}
          >
            Da el primer paso hoy
          </h2>
          <p className="mt-4 text-base leading-7 text-muted">
            Elige el servicio, la fecha y la hora que mejor se adapte a ti.
            Es rapido, facil y seguro.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-12">
          <div className="relative mx-auto grid max-w-5xl grid-cols-4 gap-2">
            <div className="absolute left-[12.5%] right-[12.5%] top-5 h-px bg-[#b9c5c1]" />
            {steps.map((step, index) => {
              const number = index + 1;
              const isActive = currentStep === number;
              const isDone = currentStep > number;

              return (
                <div
                  key={step}
                  className="relative z-10 flex flex-col items-center gap-3 text-center"
                >
                  <span
                    className={
                      isActive || isDone
                        ? "grid size-10 place-items-center rounded-full text-sm font-bold text-white"
                        : "grid size-10 place-items-center rounded-full border border-[#b9c5c1] bg-white text-sm font-bold text-[#061923]"
                    }
                    style={
                      isActive || isDone
                        ? { backgroundColor: page.theme.primaryColor }
                        : undefined
                    }
                  >
                    {isDone ? <FontAwesomeIcon icon={faCheck} className="size-3" /> : number}
                  </span>
                  <span
                    className={
                      isActive
                        ? "text-sm font-bold text-[#061923]"
                        : "text-sm font-medium text-muted"
                    }
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mx-auto mt-12 max-w-3xl">
            {currentStep === 1 ? (
              <StepCard
                accentColor={page.theme.secondaryColor}
                icon={faUser}
                eyebrow="Paso 1"
                title="Elige el servicio"
              >
                <div className="grid gap-3">
                  {page.services.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => {
                        setSelectedService(service.name);
                        setHasSelectedService(true);
                      }}
                      className="flex items-center justify-between gap-4 rounded-card border border-line bg-white p-4 text-left shadow-card transition hover:border-current"
                      style={{ color: page.theme.primaryColor }}
                    >
                      <span>
                        <span className="block text-sm font-bold text-[#061923]">
                          {service.name}
                        </span>
                        <span className="mt-1 block text-xs text-muted">
                          {service.duration} · {service.price} €
                        </span>
                      </span>
                      <FontAwesomeIcon icon={faArrowRight} className="size-3.5 text-muted" />
                    </button>
                  ))}
                </div>
              </StepCard>
            ) : null}

            {currentStep === 2 ? (
              <StepCard
                accentColor={page.theme.secondaryColor}
                icon={faCalendarDays}
                eyebrow="Paso 2"
                title="Selecciona la fecha"
              >
                <CalendarPicker
                  availability={availability}
                  page={page}
                  selectedDay={selectedDay}
                  onSelectDay={(dayNumber) => {
                    setSelectedDay(dayNumber);
                    setHasSelectedDay(true);
                    setSelectedTime("");
                  }}
                />
              </StepCard>
            ) : null}

            {currentStep === 3 ? (
              <StepCard
                accentColor={page.theme.secondaryColor}
                icon={faClock}
                eyebrow="Paso 3"
                title="Selecciona la hora"
              >
                <p className="mb-4 text-sm capitalize text-muted">
                  {selectedDayLabel}
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {availability.slots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className="h-12 rounded-md border border-line bg-white text-sm font-bold shadow-card transition hover:border-current"
                      style={{ color: page.theme.primaryColor }}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </StepCard>
            ) : null}

            {currentStep === 4 ? (
              <StepCard
                accentColor={page.theme.secondaryColor}
                icon={faUser}
                eyebrow="Paso 4"
                title="Completa tus datos"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    icon={faUser}
                    label="Nombre completo"
                    value={formData.customerName}
                    onChange={(event) => updateField("customerName", event.target.value)}
                    placeholder="Nombre completo"
                    required
                  />
                  <Field
                    icon={faPhone}
                    label="Telefono"
                    value={formData.customerPhone}
                    onChange={(event) => updateField("customerPhone", event.target.value)}
                    placeholder="+34 600 000 000"
                    required
                    type="tel"
                  />
                  <Field
                    icon={faEnvelope}
                    label="Email"
                    value={formData.customerEmail}
                    onChange={(event) => updateField("customerEmail", event.target.value)}
                    placeholder="tu@email.com"
                    type="email"
                  />
                  <Field
                    icon={faClock}
                    label="Notas"
                    value={formData.notes}
                    onChange={(event) => updateField("notes", event.target.value)}
                    placeholder={`${selectedService} · ${selectedDayLabel}`}
                  />
                </div>
              </StepCard>
            ) : null}
          </div>

          {status.message ? (
            <p
              className={
                status.state === "success"
                  ? "mx-auto mt-6 max-w-xl rounded-md bg-success-soft px-4 py-3 text-center text-sm font-bold text-success"
                  : status.state === "error"
                    ? "mx-auto mt-6 max-w-xl rounded-md bg-danger-soft px-4 py-3 text-center text-sm font-bold text-danger"
                    : "mx-auto mt-6 max-w-xl rounded-md bg-white px-4 py-3 text-center text-sm font-bold text-muted"
              }
            >
              {status.message}
            </p>
          ) : null}

          {currentStep === 4 ? (
            <button
              type="submit"
              disabled={!canSubmit}
              className={`mx-auto mt-7 flex h-14 w-full max-w-xs items-center justify-center gap-3 text-sm font-bold shadow-card disabled:cursor-not-allowed disabled:opacity-60 ${getButtonClassName(page.theme.buttonStyle)}`}
              style={getButtonStyle(page)}
            >
              {status.state === "submitting" ? "Confirmando..." : "Reservar cita ahora"}
              <FontAwesomeIcon icon={faArrowRight} className="size-3.5" />
            </button>
          ) : null}
        </form>
      </div>

      {isSuccessModalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#061923]/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-card bg-white p-7 text-center shadow-soft">
            <div
                className="mx-auto grid size-16 place-items-center rounded-full text-white"
              style={{ backgroundColor: page.theme.primaryColor }}
            >
              {page.professional.logoImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={page.professional.logoImage}
                  alt=""
                  className="size-11 rounded-full object-contain"
                />
              ) : (
                <FontAwesomeIcon icon={faLotus} className="size-8" />
              )}
            </div>
            <p
              className="mt-5 text-2xl font-bold text-[#061923]"
              style={{ fontFamily: page.theme.titleFont }}
            >
              Cita reservada
            </p>
            <p className="mt-3 text-sm leading-6 text-muted">
              Tu reserva con {page.professional.name} quedo registrada
              correctamente. El profesional podra verla en su panel.
            </p>
            <div
              className="mt-5 rounded-md px-4 py-3 text-left text-sm"
              style={{
                backgroundColor: `color-mix(in srgb, ${page.theme.secondaryColor} 10%, white)`,
              }}
            >
              <p className="font-bold text-[#061923]">{selectedService}</p>
              <p className="mt-1 text-muted">
                <span className="capitalize">{selectedDayLabel}</span>
                {selectedTime ? ` · ${selectedTime}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsSuccessModalOpen(false)}
              className={`mt-6 inline-flex h-12 items-center justify-center gap-2 px-6 text-sm font-bold ${getButtonClassName(page.theme.buttonStyle)}`}
              style={getButtonStyle(page)}
            >
              Perfecto
              <FontAwesomeIcon icon={faCircleCheck} className="size-4" />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Field({
  disabled = false,
  icon,
  label,
  onChange,
  placeholder,
  required = false,
  type = "text",
  value,
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-[#061923]">{label}</span>
      <div className="mt-3 flex h-12 items-center gap-3 rounded-md border border-line bg-white px-4 shadow-card">
        <FontAwesomeIcon icon={icon} className="size-4 text-[#061923]" />
        <input
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="min-w-0 flex-1 bg-transparent text-sm font-bold text-foreground outline-none placeholder:text-muted disabled:cursor-not-allowed"
          placeholder={placeholder}
          required={required}
        />
      </div>
    </label>
  );
}

function CalendarPicker({ availability, onSelectDay, page, selectedDay }) {
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[#061923]">Selecciona la fecha</p>
          <p className="mt-1 text-xs font-bold capitalize text-muted">
            {availability.month.label}
          </p>
        </div>
        <span className="grid size-10 place-items-center rounded-md bg-white text-[#061923] shadow-card">
          <FontAwesomeIcon icon={faCalendarDays} className="size-4" />
        </span>
      </div>

      <div className="mt-3 rounded-card border border-line bg-white p-4 shadow-card">
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-muted">
          {calendarDays.map((day) => (
            <span key={day} className="py-2">
              {day}
            </span>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-2">
          {availability.month.cells.map((cell, index) => {
            const isSelected = cell.dayNumber === selectedDay;
            const isDisabled = !cell.isAvailable || !cell.dayNumber;

            return (
              <button
                key={`${cell.dayNumber ?? "empty"}-${index}`}
                type="button"
                disabled={isDisabled}
                onClick={() => onSelectDay(cell.dayNumber)}
                className={
                  !cell.dayNumber
                    ? "aspect-square rounded-md text-transparent"
                    : isSelected
                      ? "aspect-square rounded-md text-sm font-bold text-white shadow-card"
                      : cell.isAvailable
                        ? "aspect-square rounded-md bg-[#eef7f4] text-sm font-bold text-[#0d6655] transition hover:ring-2 hover:ring-[#0d6655]/20"
                        : "aspect-square rounded-md bg-surface-muted text-sm font-bold text-muted"
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
    </div>
  );
}

function StepCard({ accentColor, children, eyebrow, icon, title }) {
  return (
    <section className="rounded-card border border-line bg-white/82 p-5 shadow-soft backdrop-blur">
      <div className="mb-5 flex items-center gap-3">
        <span
          className="grid size-11 place-items-center rounded-md"
          style={{
            backgroundColor: `color-mix(in srgb, ${accentColor} 12%, white)`,
            color: accentColor,
          }}
        >
          <FontAwesomeIcon icon={icon} className="size-5" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
            {eyebrow}
          </p>
          <h3 className="text-xl font-bold text-[#061923]">{title}</h3>
        </div>
      </div>
      {children}
    </section>
  );
}

function getCurrentStep({ hasSelectedDay, hasSelectedService, selectedTime }) {
  if (selectedTime) return 4;
  if (hasSelectedDay) return 3;
  if (hasSelectedService) return 2;
  return 1;
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
