import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays } from "@/lib/fontawesome";
import {
  buildAvailability,
  calendarDays,
  formatSelectedDay,
} from "@/lib/availability";

export default function PreviewBooking({ availableDays, data }) {
  const availability = buildAvailability({
    days: availableDays,
    end: data.scheduleEnd,
    start: data.scheduleStart,
  });
  const selectedDay = availability.month.firstAvailableDay;
  const selectedDayLabel = formatSelectedDay(selectedDay);

  return (
    <section className="bg-[#f7fbf7] p-7">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
          Reserva tu cita
        </p>
        <h3
          className="mt-2 text-3xl font-bold text-foreground"
          style={{ fontFamily: data.titleFont }}
        >
          Elige un dia y horario disponible
        </h3>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted">
          Selecciona una fecha para continuar con la reserva. Esta seccion
          quedara conectada al calendario profesional.
        </p>
      </div>

      <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        <div className="rounded-card border border-line bg-surface p-4 shadow-card">
          <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-bold capitalize text-foreground">
                  {availability.month.label}
                </p>
            <FontAwesomeIcon
              icon={faCalendarDays}
              className="size-4"
              style={{ color: data.primaryColor }}
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
                  className={
                    !cell.dayNumber
                      ? "h-10 rounded-md text-transparent"
                      : isSelected
                        ? "h-10 rounded-md text-sm font-bold text-white"
                        : cell.isAvailable
                          ? "h-10 rounded-md bg-success-soft text-sm font-bold text-success"
                          : "h-10 rounded-md bg-surface-muted text-sm font-bold text-muted"
                  }
                  style={
                    isSelected ? { backgroundColor: data.primaryColor } : undefined
                  }
                >
                  {cell.dayNumber ?? ""}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-card border border-line bg-surface p-4 shadow-card">
          <p className="text-sm font-bold text-foreground">
            Horarios disponibles
          </p>
          <p className="mt-1 text-xs capitalize text-muted">
            {selectedDayLabel}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {availability.slots.length ? (
              availability.slots.map((time) => (
                <button
                  key={time}
                  type="button"
                  className="h-11 rounded-md border text-sm font-bold transition hover:bg-primary hover:text-white"
                  style={{
                    color: data.primaryColor,
                    borderColor: `${data.primaryColor}33`,
                  }}
                >
                  {time}
                </button>
              ))
            ) : (
              <p className="col-span-full rounded-md bg-surface-muted px-3 py-3 text-sm text-muted">
                Ajusta un rango horario valido para mostrar disponibilidad.
              </p>
            )}
          </div>

          <button
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-md text-sm font-bold text-white"
            style={{ backgroundColor: data.secondaryColor }}
          >
            Confirmar reserva
            <FontAwesomeIcon icon={faCalendarDays} className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
