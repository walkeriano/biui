import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faChevronRight,
  faImage,
  faLink,
  faPenToSquare,
} from "@/lib/fontawesome";

const actions = [
  {
    title: "Gestionar horarios",
    description: "Bloquea o anade disponibilidad.",
    icon: faCalendarDays,
    color: "text-success bg-success-soft",
  },
  {
    title: "Editar servicios",
    description: "Modifica precios, duracion y descripcion.",
    icon: faPenToSquare,
    color: "text-violet-600 bg-violet-50",
  },
  {
    title: "Personalizar portada",
    description: "Cambia la imagen y texto principal.",
    icon: faImage,
    color: "text-orange-500 bg-orange-50",
  },
  {
    title: "Ver mi pagina",
    description: "Abre tu pagina publica en una nueva pestana.",
    icon: faLink,
    color: "text-blue-600 bg-blue-50",
  },
];

export default function QuickActionsWidget({ onViewChange }) {
  return (
    <section className="rounded-card border border-line bg-surface p-4 shadow-card">
      <h2 className="mb-4 text-xl font-bold text-foreground">
        Acciones rapidas
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {actions.map((action) => (
          <button
            key={action.title}
            type="button"
            onClick={() => action.title === "Ver mi pagina" && onViewChange("page")}
            className="rounded-card border border-line bg-surface p-3 text-left transition hover:border-accent hover:shadow-card"
          >
            <div className="flex items-start gap-3">
              <span className={`grid size-10 shrink-0 place-items-center rounded-md ${action.color}`}>
                <FontAwesomeIcon icon={action.icon} className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground">{action.title}</p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  {action.description}
                </p>
                <span className="mt-3 grid size-7 place-items-center rounded-full bg-surface-muted text-muted">
                  <FontAwesomeIcon icon={faChevronRight} className="size-3" />
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
