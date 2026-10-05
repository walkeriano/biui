import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faQuoteLeft } from "@/lib/fontawesome";
import { getButtonClassName, getButtonStyle } from "@/components/public-page/theme";

export default function PublicAbout({ page }) {
  return (
    <section id="sobre-mi" className="bg-[#fffdf8] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[28rem_minmax(0,1fr)_13rem] lg:items-center">
        <div
          className="min-h-[18rem] overflow-hidden rounded-card shadow-card lg:min-h-[19rem]"
          style={{
            backgroundColor: `color-mix(in srgb, ${page.theme.secondaryColor} 16%, white)`,
          }}
        >
          {page.about.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={page.about.image}
              alt=""
              className="h-full min-h-[18rem] w-full object-cover lg:min-h-[19rem]"
            />
          ) : (
            <div
              className="grid h-full min-h-[18rem] place-items-center text-5xl font-bold lg:min-h-[19rem]"
              style={{ color: page.theme.secondaryColor }}
            >
              {page.professional.avatarInitials}
            </div>
          )}
        </div>

        <div>
          <p
            className="text-xs font-bold uppercase tracking-[0.24em]"
            style={{ color: page.theme.secondaryColor }}
          >
            Sobre mi
          </p>
          <h2
            className="mt-3 text-4xl font-bold leading-tight text-[#061923] sm:text-5xl"
            style={{ fontFamily: page.theme.titleFont }}
          >
            {page.about.title}
          </h2>
          <p className="mt-2 text-lg font-bold" style={{ color: page.theme.primaryColor }}>
            {page.about.subtitle}
          </p>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-muted">
            {page.about.description}
          </p>
          <a
            href="#reservar"
            className={`mt-8 inline-flex h-12 items-center justify-center gap-3 px-7 text-sm font-bold shadow-card ${getButtonClassName(page.theme.buttonStyle)}`}
            style={getButtonStyle(page)}
          >
            Conocer mas sobre mi
            <FontAwesomeIcon icon={faArrowRight} className="size-3.5" />
          </a>
        </div>

        <aside
          className="rounded-card p-6 shadow-card"
          style={{
            backgroundColor: `color-mix(in srgb, ${page.theme.secondaryColor} 10%, white)`,
          }}
        >
          <FontAwesomeIcon
            icon={faQuoteLeft}
            className="size-7"
            style={{ color: page.theme.secondaryColor }}
          />
          <p
            className="mt-4 text-lg font-bold leading-8 text-[#061923]"
            style={{ fontFamily: page.theme.titleFont }}
          >
            Cada proceso es unico, y por eso cada paso tambien lo es.
          </p>
        </aside>
      </div>
    </section>
  );
}
