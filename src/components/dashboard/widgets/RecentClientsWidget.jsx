import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@/lib/fontawesome";

export default function RecentClientsWidget({ clients = [] }) {
  return (
    <section className="rounded-card border border-line bg-surface p-4 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-foreground">
          Clientes recientes
        </h2>
        <button type="button" className="text-sm font-bold text-accent underline">
          Ver todos
        </button>
      </div>

      {clients.length ? (
        <div className="overflow-hidden rounded-card border border-line">
          {clients.map((client) => {
            const isNew = client.status === "Nueva";

            return (
              <div
                key={`${client.name}-${client.date}`}
                className="grid gap-3 border-b border-line px-4 py-3 text-sm last:border-b-0 sm:grid-cols-[2.75rem_minmax(0,1fr)_auto] sm:items-center"
              >
                <span className="grid size-9 place-items-center rounded-full bg-violet-50 text-xs font-bold text-violet-600">
                  {client.initials}
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-foreground">{client.name}</p>
                  <p className="text-xs text-muted">
                    {client.service} · {client.date}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <span
                    className={
                      isNew
                        ? "rounded-md bg-success-soft px-3 py-1.5 text-xs font-bold text-success"
                        : "rounded-md bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600"
                    }
                  >
                    {client.status}
                  </span>
                  <FontAwesomeIcon icon={faChevronRight} className="size-3 text-muted" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-card border border-dashed border-line bg-surface-muted px-4 py-8 text-center">
          <p className="text-sm font-bold text-foreground">
            Sin clientes recientes
          </p>
          <p className="mt-1 text-sm leading-6 text-muted">
            Tus clientes apareceran cuando empiecen a reservar.
          </p>
        </div>
      )}
    </section>
  );
}
