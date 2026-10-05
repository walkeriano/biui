import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMobileScreenButton,
  faTabletScreenButton,
} from "@/lib/fontawesome";
import PreviewPage from "@/components/dashboard/MyPageView/components/preview/PreviewPage";

export default function PreviewPanel({
  availableDays,
  data,
  heroImage,
  profileImage,
  services,
}) {
  return (
    <aside className="self-start xl:sticky xl:top-4">
      <section className="rounded-card border border-line bg-surface p-4 shadow-card xl:max-h-[calc(100dvh-2rem)] xl:overflow-y-auto">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-bold text-foreground">Vista previa</h3>
          <div className="flex items-center gap-2">
            <button className="grid size-10 place-items-center rounded-md bg-primary text-white">
              <FontAwesomeIcon icon={faTabletScreenButton} />
            </button>
            <button className="grid size-10 place-items-center rounded-md border border-line text-muted">
              <FontAwesomeIcon icon={faMobileScreenButton} />
            </button>
            <select className="ml-2 h-10 rounded-md border border-line px-3 text-sm font-bold text-muted">
              <option>Escritorio (1280px)</option>
            </select>
          </div>
        </div>

        <PreviewPage
          availableDays={availableDays}
          data={data}
          heroImage={heroImage}
          profileImage={profileImage}
          services={services}
        />
      </section>
    </aside>
  );
}
