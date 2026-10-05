export default function PreviewAbout({ data, profileImage }) {
  return (
    <section className="grid gap-6 bg-[#fbf7ef] p-7 lg:grid-cols-[14rem_1fr]">
      <div className="min-h-48 overflow-hidden rounded-card bg-primary">
        {profileImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profileImage} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
          Sobre mi
        </p>
        <h3
          className="mt-2 text-3xl font-bold text-foreground"
          style={{ fontFamily: data.titleFont }}
        >
          {data.profileTitle}
        </h3>
        <p className="mt-1 text-sm font-bold" style={{ color: data.primaryColor }}>
          {data.profileSubtitle}
        </p>
        <p className="mt-4 text-sm leading-6 text-muted">
          {data.profileDescription}
        </p>
      </div>
    </section>
  );
}
