import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faUserGroup } from "@/lib/fontawesome";

export default function RecentClientsWidget({ clients = [] }) {
  return (
    <section className="flex h-full min-h-[28rem] flex-col rounded-card border border-line bg-surface p-4 shadow-card">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-md bg-blue-50 text-blue-600">
          <FontAwesomeIcon icon={faUserGroup} className="size-[1.125rem]" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
            Clientes
          </p>
          <h2 className="text-xl font-bold text-foreground">
            Clientes recientes
          </h2>
        </div>
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
                <span className="grid size-9 place-items-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
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
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="relative flex flex-1 flex-col overflow-hidden rounded-card">
          <div className="relative z-10 mx-auto mt-32 max-w-sm px-4 text-center">
            <p className="text-sm font-bold text-foreground">
              Sin clientes recientes
            </p>
            <p className="mt-1 text-sm leading-6 text-muted">
              Tus clientes apareceran cuando empiecen a reservar.
            </p>
          </div>

          <div className="absolute inset-x-0 top-0 grid gap-3 px-4 pt-4">
            <GhostClientRow opacity="opacity-80" />
            <GhostClientRow opacity="opacity-60" />
            <GhostClientRow opacity="opacity-40" />
            <GhostClientRow opacity="opacity-25" />
            <GhostClientRow opacity="opacity-10" />
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-surface" />
        </div>
      )}
    </section>
  );
}

function GhostClientRow({ opacity }) {
  return (
    <div
      className={`grid gap-3 rounded-md border border-line bg-white/80 px-3 py-3 shadow-card sm:grid-cols-[2.5rem_minmax(0,1fr)_6rem] sm:items-center ${opacity}`}
    >
      <span className="grid size-9 place-items-center rounded-full bg-blue-50 text-blue-200">
        <FontAwesomeIcon icon={faUser} className="size-3.5" />
      </span>
      <div className="grid gap-2">
        <span className="h-3 w-2/3 rounded-full bg-line" />
        <span className="h-3 w-1/2 rounded-full bg-line" />
      </div>
      <span className="h-7 rounded-md bg-success-soft" />
    </div>
  );
}
