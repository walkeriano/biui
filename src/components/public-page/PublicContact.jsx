import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faEnvelope,
  faMapLocationDot,
  faPhone,
} from "@/lib/fontawesome";

export default function PublicContact({ page }) {
  const items = [
    [faMapLocationDot, "Ubicacion", page.contact.city],
    [faPhone, "Telefono", page.contact.phone],
    [faEnvelope, "Email", page.contact.email],
    [
      faClock,
      "Horario de atencion",
      `${page.availability.days.join(", ")} ${page.availability.start} - ${page.availability.end}`,
    ],
  ];

  return (
    <section id="contacto" className="bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-4">
        {items.map(([icon, label, value]) => (
          <article
            key={label}
            className="rounded-card border border-line bg-surface p-5 shadow-card"
          >
            <FontAwesomeIcon
              icon={icon}
              className="size-5"
              style={{ color: page.theme.primaryColor }}
            />
            <p className="mt-3 text-xs font-bold text-muted">{label}</p>
            <p className="mt-1 text-sm font-bold leading-5 text-foreground">
              {value}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
