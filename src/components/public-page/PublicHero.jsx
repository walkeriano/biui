import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@/lib/fontawesome";
import {
  getButtonClassName,
  getButtonStyle,
  getSocialLinks,
} from "@/components/public-page/theme";
import SocialIcon from "@/components/public-page/SocialIcon";

export default function PublicHero({ page, previewMode = false }) {
  const socialLinks = getSocialLinks(page.contact);
  const heroBackground = `linear-gradient(135deg, color-mix(in srgb, ${page.theme.primaryColor} 10%, white) 0%, color-mix(in srgb, ${page.theme.secondaryColor} 16%, white) 52%, color-mix(in srgb, ${page.theme.primaryColor} 16%, ${page.theme.secondaryColor}) 100%)`;
  const imageFallbackBackground = `linear-gradient(145deg, color-mix(in srgb, ${page.theme.primaryColor} 68%, black) 0%, color-mix(in srgb, ${page.theme.secondaryColor} 76%, white) 100%)`;
  const sectionClassName = previewMode
    ? "relative overflow-hidden pt-24 lg:h-[46rem] lg:pt-0"
    : "relative overflow-hidden pt-24 lg:h-[100svh] lg:min-h-[46rem] lg:pt-0";
  const contentClassName = previewMode
    ? "relative mx-auto px-4 py-14 sm:px-6 lg:absolute lg:inset-0 lg:flex lg:max-w-none lg:items-center lg:px-0 lg:py-0"
    : "relative mx-auto px-4 py-14 sm:px-6 lg:absolute lg:inset-0 lg:flex lg:max-w-none lg:items-center lg:px-0 lg:py-0";

  return (
    <section
      id="inicio"
      className={sectionClassName}
      style={{ background: heroBackground }}
    >
      <div
        className="relative h-80 w-full overflow-hidden sm:h-96 lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:w-[40vw]"
        style={{
          background: imageFallbackBackground,
        }}
      >
        {page.hero.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={page.hero.image}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `linear-gradient(145deg, color-mix(in srgb, ${page.theme.primaryColor} 82%, black) 0%, color-mix(in srgb, ${page.theme.secondaryColor} 74%, white) 100%)`,
            }}
          />
        )}
      </div>

      <div className={contentClassName}>
        <div className="mx-auto w-full max-w-7xl px-0 lg:px-8 lg:pr-[44vw]">
          <div className="w-full max-w-3xl">
            {page.hero.label ? (
              <p
                className="inline-flex rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] backdrop-blur"
                style={{
                  backgroundColor: "rgba(255,255,255,0.5)",
                  borderColor: `color-mix(in srgb, ${page.theme.secondaryColor} 24%, white)`,
                  color: page.theme.secondaryColor,
                }}
              >
                {page.hero.label}
              </p>
            ) : null}
            <h1
              className="mt-6 text-4xl font-bold leading-[1.02] sm:text-5xl lg:text-7xl"
              style={{
                color: page.theme.primaryColor,
                fontFamily: page.theme.titleFont,
              }}
            >
              {page.hero.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#24363f] sm:text-xl">
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
              className={`mt-8 inline-flex h-14 items-center justify-center gap-4 px-8 text-sm font-bold shadow-card ${getButtonClassName(page.theme.buttonStyle, { pill: true })}`}
              style={getButtonStyle(page)}
            >
              Reservar mi primera cita
              <FontAwesomeIcon icon={faArrowRight} className="size-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
