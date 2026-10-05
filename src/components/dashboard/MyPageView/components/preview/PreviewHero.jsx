export default function PreviewHero({ data, heroImage }) {
  const buttonClassName =
    data.buttonStyle === "square"
      ? "px-5 py-3 text-sm font-bold text-white"
      : data.buttonStyle === "minimal"
        ? "border-b-2 px-2 py-2 text-sm font-bold"
        : "rounded-md px-5 py-3 text-sm font-bold text-white";

  return (
    <section
      className="relative min-h-[28rem] overflow-hidden p-7"
      style={{
        background:
          "linear-gradient(105deg,#fff8ed 0%,#ffffff 48%,#e7f8d9 100%)",
        fontFamily: data.textFont,
      }}
    >
      {heroImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={heroImage}
          alt=""
          className="absolute right-0 top-0 h-full w-2/5 object-cover opacity-90"
        />
      ) : (
        <div className="absolute right-8 top-12 h-72 w-56 rounded-[1.25rem] bg-primary" />
      )}

      <div className="relative z-10 flex items-center justify-between gap-4 text-xs font-bold text-foreground">
        <div>
          <p className="text-base font-bold">Laura Martin</p>
          <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted">
            Psicologa
          </p>
        </div>
        <nav className="hidden gap-5 lg:flex">
          <span>Inicio</span>
          <span>Sobre mi</span>
          <span>Servicios</span>
          <span>Preguntas frecuentes</span>
        </nav>
        <button
          className={buttonClassName}
          style={{
            backgroundColor:
              data.buttonStyle === "minimal" ? "transparent" : data.secondaryColor,
            borderColor: data.primaryColor,
            color: data.buttonStyle === "minimal" ? data.secondaryColor : "#ffffff",
          }}
        >
          Reservar cita →
        </button>
      </div>

      <div className="relative z-10 mt-14 max-w-lg">
        <p className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-orange-700">
          {data.heroLabel}
        </p>
        <h2
          className="mt-4 text-4xl font-bold leading-tight text-foreground"
          style={{ fontFamily: data.titleFont }}
        >
          <HighlightedTitle title={data.heroTitle} color={data.primaryColor} />
        </h2>
        <p className="mt-4 text-sm leading-6 text-muted">{data.heroText}</p>

        <button
          className="mt-7 rounded-md px-6 py-3 text-sm font-bold text-white"
          style={{ backgroundColor: data.secondaryColor }}
        >
          Reservar mi primera cita →
        </button>
      </div>
    </section>
  );
}

function HighlightedTitle({ color, title }) {
  if (!title.includes("vida")) {
    return title;
  }

  const [before, ...after] = title.split("vida");

  return (
    <>
      {before}vida <span style={{ color }}>{after.join("vida")}</span>
    </>
  );
}
