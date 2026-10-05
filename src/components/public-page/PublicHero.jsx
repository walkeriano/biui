import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@/lib/fontawesome";
import {
  getButtonClassName,
  getButtonStyle,
  getSocialLinks,
} from "@/components/public-page/theme";
import SocialIcon from "@/components/public-page/SocialIcon";

export default function PublicHero({ page }) {
  const socialLinks = getSocialLinks(page.contact);

  return (
    <section
      id="inicio"
      className="relative min-h-[42rem] overflow-hidden pt-24 lg:min-h-[46rem]"
      style={{
        backgroundColor: `color-mix(in srgb, ${page.theme.secondaryColor} 12%, white)`,
      }}
    >
      {page.hero.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={page.hero.image}
          alt=""
          className="absolute inset-y-0 right-0 h-full w-full object-cover lg:w-[64%]"
        />
      ) : (
        <div
          className="absolute inset-y-0 right-0 w-full lg:w-[64%]"
          style={{
            background: `radial-gradient(circle at 72% 45%, rgba(255,255,255,0.92), transparent 22rem), linear-gradient(115deg, color-mix(in srgb, ${page.theme.secondaryColor} 8%, white) 0%, color-mix(in srgb, ${page.theme.secondaryColor} 20%, white) 48%, color-mix(in srgb, ${page.theme.secondaryColor} 34%, white) 100%)`,
          }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(90deg, color-mix(in srgb, ${page.theme.secondaryColor} 10%, white) 0%, color-mix(in srgb, ${page.theme.secondaryColor} 10%, white) 34%, color-mix(in srgb, ${page.theme.secondaryColor} 8%, transparent) 58%, transparent 78%)`,
        }}
      />

      <div className="relative mx-auto grid max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-20 lg:pt-20">
        <div className="max-w-2xl">
          {page.hero.label ? (
            <p
              className="inline-flex rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em]"
              style={{
                backgroundColor: `color-mix(in srgb, ${page.theme.secondaryColor} 18%, white)`,
                color: page.theme.secondaryColor,
              }}
            >
              {page.hero.label}
            </p>
          ) : null}
          <h1
            className="mt-6 text-4xl font-bold leading-[1.04] tracking-tight text-[#061923] sm:text-5xl lg:text-6xl"
            style={{ fontFamily: page.theme.titleFont }}
          >
            {page.hero.title}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#2d3f49]">
            {page.hero.text}
          </p>
          {socialLinks.length ? (
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {socialLinks.map(([key, label, , url]) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="inline-flex size-10 items-center justify-center rounded-full border bg-white/78 text-sm font-bold shadow-card backdrop-blur transition hover:-translate-y-0.5"
                  style={{
                    borderColor: `color-mix(in srgb, ${page.theme.secondaryColor} 28%, white)`,
                    color: page.theme.primaryColor,
                  }}
                >
                  <SocialIcon platform={key} />
                </a>
              ))}
            </div>
          ) : null}
          <a
            href="#reservar"
            className={`mt-7 inline-flex h-14 items-center justify-center gap-4 px-8 text-sm font-bold shadow-card ${getButtonClassName(page.theme.buttonStyle, { pill: true })}`}
            style={getButtonStyle(page)}
          >
            Reservar mi primera cita
            <FontAwesomeIcon icon={faArrowRight} className="size-3.5" />
          </a>
        </div>

      </div>
    </section>
  );
}
