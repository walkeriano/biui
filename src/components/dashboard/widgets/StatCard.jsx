import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function StatCard({ icon, tone, value, label }) {
  const toneClassName = {
    green: "bg-success-soft text-success",
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-500",
    purple: "bg-violet-50 text-violet-600",
  };

  return (
    <article className="flex min-h-[9.5rem] min-w-0 flex-col items-center justify-center gap-3 rounded-card border border-line bg-surface p-4 text-center shadow-card">
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-md ${toneClassName[tone]}`}
      >
        <FontAwesomeIcon icon={icon} className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="break-all text-3xl font-bold leading-none tabular-nums text-foreground">{value}</p>
        <p className="mt-2 text-sm leading-5 text-muted">{label}</p>
      </div>
    </article>
  );
}
