"use client";

import { useState, useSyncExternalStore } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMobileScreenButton,
  faLaptop,
} from "@/lib/fontawesome";
import PreviewPage from "@/components/dashboard/MyPageView/components/preview/PreviewPage";

const viewports = {
  desktop: {
    icon: faLaptop,
    label: "Escritorio",
    width: 1280,
  },
  mobile: {
    icon: faMobileScreenButton,
    label: "Móvil",
    width: 390,
  },
};

const mobileScreenQuery = "(max-width: 767px)";

function subscribeToScreenSize(onChange) {
  const media = window.matchMedia(mobileScreenQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function isMobileScreen() {
  return window.matchMedia(mobileScreenQuery).matches;
}

function getServerScreenSnapshot() {
  return false;
}

export default function PreviewPanel({
  availableDays,
  data,
  heroImage,
  profileImage,
  services,
}) {
  const isMobile = useSyncExternalStore(
    subscribeToScreenSize,
    isMobileScreen,
    getServerScreenSnapshot,
  );
  const [selectedDevice, setSelectedDevice] = useState(null);
  const viewport = selectedDevice ?? (isMobile ? "mobile" : "desktop");
  const selectedViewport = viewports[viewport];

  return (
    <aside className="min-w-0 self-start max-md:order-1 xl:sticky xl:top-4">
      <section className="min-w-0">
        <div className="mb-1 flex flex-wrap items-center justify-center gap-3 py-1 text-center">
          <h3 className="shrink-0 text-base font-bold text-foreground">Vista previa</h3>
          <div className="flex min-w-0 flex-wrap items-center justify-center gap-2">
            {Object.entries(viewports).map(([key, item]) => {
              const isActive = viewport === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDevice(key)}
                  aria-label={item.label}
                  aria-pressed={isActive}
                  className={
                    isActive
                      ? "grid size-10 place-items-center rounded-full bg-primary text-white"
                      : "grid size-10 place-items-center rounded-full border border-line text-muted transition hover:border-primary hover:text-primary"
                  }
                >
                  <FontAwesomeIcon icon={item.icon} />
                </button>
              );
            })}
            <span
              aria-live="polite"
              aria-atomic="true"
              className="text-sm text-muted"
            >
              {selectedViewport.label} ({selectedViewport.width}px)
            </span>
          </div>
        </div>

        <div className="h-[calc(100dvh-10rem)] min-h-[28rem] max-h-[52rem] overflow-hidden max-md:h-[46dvh] max-md:min-h-[16rem] max-md:max-h-[26rem]">
          <PreviewPage
            availableDays={availableDays}
            data={data}
            heroImage={heroImage}
            profileImage={profileImage}
            services={services}
            viewport={selectedViewport}
          />
        </div>
      </section>
    </aside>
  );
}
