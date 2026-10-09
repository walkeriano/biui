import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function StatCard({ icon, tone, value, label }) {
  const toneClassName = {
    green: "bg-success-soft text-success",
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-500",
    purple: "bg-violet-50 text-violet-600",
  };

  return (
    <article className="flex min-h-[7.5rem] items-center justify-center rounded-card border border-line bg-surface p-4 shadow-card">
      <div className="flex items-center justify-center gap-4">
        <span
          className={`grid size-11 shrink-0 place-items-center rounded-md ${toneClassName[tone]}`}
        >
          <FontAwesomeIcon icon={icon} className="size-5" />
        </span>
        <div className="min-w-0 text-center">
          <p className="text-3xl font-bold leading-none text-foreground">{value}</p>
          <p className="mt-1 text-sm text-muted">{label}</p>
        </div>
      </div>
    </article>
  );
}
