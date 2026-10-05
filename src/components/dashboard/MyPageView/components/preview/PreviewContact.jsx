import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faEnvelope, faMapLocationDot, faPhone } from "@/lib/fontawesome";

export default function PreviewContact({ availableDays, data }) {
  const items = [
    [faMapLocationDot, "Ubicacion", data.city],
    [faPhone, "Telefono", data.phone],
    [faEnvelope, "Email", data.email],
    [
      faClock,
      "Horario de atencion",
      `${availableDays.join(", ")} ${data.scheduleStart} - ${data.scheduleEnd}`,
    ],
  ];

  return (
    <section className="grid gap-3 p-5 md:grid-cols-4">
      {items.map(([icon, label, value]) => (
        <div key={label} className="rounded-card border border-line bg-surface p-4">
          <FontAwesomeIcon
            icon={icon}
            className="size-5"
            style={{ color: data.primaryColor }}
          />
          <p className="mt-3 text-xs font-bold text-muted">{label}</p>
          <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
        </div>
      ))}
    </section>
  );
}
