import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@/lib/fontawesome";

export default function AppointmentsWidget({ appointments = [] }) {
  return (
    <section className="rounded-card border border-line bg-surface p-4 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-foreground">
          Proximas citas de hoy
        </h2>
        <button type="button" className="text-sm font-bold text-accent underline">
          Ver todas
        </button>
      </div>

      {appointments.length ? (
        <div className="overflow-hidden rounded-card border border-line">
          {appointments.map((appointment) => {
            const isPending = appointment.status === "Pendiente";

            return (
              <div
                key={appointment.id}
                className="grid gap-2 border-b border-line px-4 py-3 text-sm last:border-b-0 sm:grid-cols-[5rem_minmax(10rem,1fr)_minmax(9rem,1fr)_auto_1.5rem] sm:items-center sm:gap-3"
              >
                <p className="text-xs font-bold text-muted sm:text-sm sm:text-foreground">
                  {appointment.time}
                </p>
                <p className="font-bold text-foreground">{appointment.client}</p>
                <p className="text-sm leading-5 text-muted">
                  {appointment.service}
                </p>
                <span
                  className={
                    isPending
                      ? "w-fit rounded-md bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-500"
                      : "w-fit rounded-md bg-success-soft px-3 py-1.5 text-xs font-bold text-success"
                  }
                >
                  {appointment.status}
                </span>
                <FontAwesomeIcon icon={faChevronRight} className="hidden size-3 text-muted sm:block" />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-card border border-dashed border-line bg-surface-muted px-4 py-8 text-center">
          <p className="text-sm font-bold text-foreground">Sin citas para hoy</p>
          <p className="mt-1 text-sm leading-6 text-muted">
            Cuando recibas reservas, apareceran aqui automaticamente.
          </p>
        </div>
      )}
    </section>
  );
}
