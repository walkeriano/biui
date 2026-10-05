export default function SectionHeader({ number, title, description }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-success-soft text-[0.8125rem] font-bold text-success">
        {number}
      </span>
      <div>
        <h3 className="text-[0.95rem] font-bold text-foreground">{title}</h3>
        <p className="mt-1 text-[0.8125rem] leading-5 text-muted">
          {description}
        </p>
      </div>
    </div>
  );
}
