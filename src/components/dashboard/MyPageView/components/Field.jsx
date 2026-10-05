export default function Field({ label, children, counter }) {
  return (
    <label className="block space-y-2">
      <span className="flex items-center justify-between gap-3 text-[0.75rem] font-bold text-foreground">
        {label}
        {counter ? (
          <span className="text-[0.75rem] font-medium text-muted">
            {counter}
          </span>
        ) : null}
      </span>
      {children}
    </label>
  );
}
