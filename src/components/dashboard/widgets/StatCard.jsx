import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@/lib/fontawesome";

export default function StatCard({ icon, tone, value, label }) {
  const toneClassName = {
    green: "bg-success-soft text-success",
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-500",
    purple: "bg-violet-50 text-violet-600",
  };

  return (
    <article className="rounded-card border border-line bg-surface p-4 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <span
          className={`grid size-10 place-items-center rounded-md ${toneClassName[tone]}`}
        >
          <FontAwesomeIcon icon={icon} className="size-5" />
        </span>
        <button
          type="button"
          className="grid size-8 place-items-center rounded-full border border-line text-muted transition hover:border-accent hover:text-accent"
          aria-label={`Ver detalle de ${label}`}
        >
          <FontAwesomeIcon icon={faChevronRight} className="size-3" />
        </button>
      </div>
      <p className="mt-4 text-3xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </article>
  );
}
