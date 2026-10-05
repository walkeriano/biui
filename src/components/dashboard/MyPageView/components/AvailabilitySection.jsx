import {
  inputClassName,
  weekDays,
} from "@/components/dashboard/MyPageView/data";
import Field from "@/components/dashboard/MyPageView/components/Field";
import SectionHeader from "@/components/dashboard/MyPageView/components/SectionHeader";

export default function AvailabilitySection({
  availableDays,
  data,
  toggleAvailableDay,
  updateData,
}) {
  return (
    <article className="rounded-card border border-line bg-surface p-4 shadow-card">
      <SectionHeader
        number="6"
        title="Disponibilidad"
        description="Configura los dias y horarios visibles en el calendario."
      />

      <div className="grid gap-4">
        <Field label="Dias disponibles">
          <div className="grid grid-cols-4 gap-2">
            {weekDays.map((day) => {
              const isActive = availableDays.includes(day);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleAvailableDay(day)}
                  className={
                    isActive
                      ? "h-10 rounded-md bg-success-soft text-[0.8125rem] font-bold text-success"
                      : "h-10 rounded-md border border-line text-[0.8125rem] font-bold text-muted"
                  }
                >
                  {day}
                </button>
              );
            })}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Desde">
            <input
              type="time"
              value={data.scheduleStart}
              onChange={(event) =>
                updateData("scheduleStart", event.target.value)
              }
              className={inputClassName}
            />
          </Field>
          <Field label="Hasta">
            <input
              type="time"
              value={data.scheduleEnd}
              onChange={(event) =>
                updateData("scheduleEnd", event.target.value)
              }
              className={inputClassName}
            />
          </Field>
        </div>

        <p className="rounded-card bg-surface-muted px-3 py-3 text-[0.75rem] leading-5 text-muted">
          Estos valores alimentan el calendario publico de reservas y generan
          los horarios visibles para tus clientes.
        </p>
      </div>
    </article>
  );
}
