import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronRight } from "@/lib/fontawesome";

export default function SectionHeader({
  description,
  icon,
  isOpen,
  onToggle,
  title,
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="group flex w-full items-start gap-3 bg-black p-4 text-left transition hover:bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
      aria-expanded={isOpen}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-success-soft text-[0.8125rem] font-bold text-success">
        <FontAwesomeIcon icon={icon} className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-[0.95rem] font-bold text-white">{title}</h3>
        <p className="mt-1 text-[0.8125rem] leading-5 text-white/65">
          {description}
        </p>
      </div>
      <span className="grid size-8 shrink-0 place-items-center rounded-md bg-success-soft text-success transition group-hover:bg-success group-hover:text-white">
        <FontAwesomeIcon
          icon={isOpen ? faChevronDown : faChevronRight}
          className="size-3.5"
        />
      </span>
    </button>
  );
}
