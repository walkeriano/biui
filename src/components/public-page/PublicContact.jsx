import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faClock,
  faMapLocationDot,
  faPhone,
  faTabletScreenButton,
} from "@/lib/fontawesome";
import {
  getButtonClassName,
  getButtonStyle,
  getSocialLinks,
} from "@/components/public-page/theme";
import SocialIcon from "@/components/public-page/SocialIcon";

export default function PublicContact({ page }) {
  const socialLinks = getSocialLinks(page.contact);
  const items = [
    [faMapLocationDot, "Ubicacion", page.contact.address || page.contact.city],
    [
      faClock,
      "Horario",
      `${page.availability.days.join(", ")} · ${page.availability.start} - ${page.availability.end}`,
    ],
    [faTabletScreenButton, "Modalidad", "Presencial, online o segun disponibilidad"],
  ];

  return (
    <footer
      id="contacto"
      className="px-4 py-9 text-white sm:px-6 lg:px-8"
      style={{
        backgroundColor: `color-mix(in srgb, ${page.theme.secondaryColor} 72%, #061923)`,
      }}
    >
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_1fr_1fr_0.4fr_auto] lg:items-center">
        {items.map(([icon, label, value]) => (
          <article key={label} className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-full border border-white/35 text-[#f7dfc9]">
              <FontAwesomeIcon icon={icon} className="size-5" />
            </span>
            <div>
              <p className="text-sm font-bold">{label}</p>
              <p className="mt-1 max-w-xs text-sm leading-6 text-white/82">
                {value}
              </p>
            </div>
          </article>
        ))}

        <div className="hidden h-px bg-white/35 lg:block" />

        {socialLinks.length ? (
          <div className="flex flex-wrap items-center gap-3 lg:col-span-full lg:row-start-2">
            {socialLinks.map(([key, label, , url]) => (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-3 py-2 text-xs font-bold text-white/86 transition hover:bg-white/10"
              >
                <span className="grid size-6 place-items-center rounded-full bg-white/12">
                  <SocialIcon platform={key} />
                </span>
                {label}
              </a>
            ))}
          </div>
        ) : null}

        <a
          href="#reservar"
          className={`inline-flex h-14 items-center justify-center gap-3 px-8 text-sm font-bold ${getButtonClassName(page.theme.buttonStyle, { pill: true })}`}
          style={getButtonStyle(page)}
        >
          Reservar cita ahora
          <FontAwesomeIcon icon={faArrowRight} className="size-3.5" />
        </a>

        {page.contact.phone ? (
          <a
            href={`tel:${page.contact.phone}`}
            className="inline-flex items-center gap-2 text-sm font-bold text-white/82"
          >
            <FontAwesomeIcon icon={faPhone} className="size-3.5" />
            {page.contact.phone}
          </a>
        ) : null}
      </div>
    </footer>
  );
}
