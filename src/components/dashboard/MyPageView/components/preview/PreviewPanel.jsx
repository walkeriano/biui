"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMobileScreenButton,
  faTabletScreenButton,
} from "@/lib/fontawesome";
import PreviewPage from "@/components/dashboard/MyPageView/components/preview/PreviewPage";

const viewports = {
  desktop: {
    icon: faTabletScreenButton,
    label: "Escritorio",
    width: 1280,
  },
  mobile: {
    icon: faMobileScreenButton,
    label: "Movil",
    width: 390,
  },
};

export default function PreviewPanel({
  availableDays,
  data,
  heroImage,
  profileImage,
  services,
}) {
  const [viewport, setViewport] = useState("desktop");
  const selectedViewport = viewports[viewport];

  return (
    <aside className="min-w-0 self-start xl:sticky xl:top-4">
      <section className="min-w-0">
        <div className="mb-3 flex flex-col gap-3 rounded-card border border-line bg-surface px-3 py-2 shadow-card sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-bold text-foreground">Vista previa</h3>
          <div className="flex items-center gap-2">
            {Object.entries(viewports).map(([key, item]) => {
              const isActive = viewport === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setViewport(key)}
                  aria-label={item.label}
                  className={
                    isActive
                      ? "grid size-10 place-items-center rounded-md bg-primary text-white"
                      : "grid size-10 place-items-center rounded-md border border-line text-muted transition hover:border-primary hover:text-primary"
                  }
                >
                  <FontAwesomeIcon icon={item.icon} />
                </button>
              );
            })}
            <select
              value={viewport}
              onChange={(event) => setViewport(event.target.value)}
              className="ml-2 h-10 rounded-md border border-line px-3 text-sm font-bold text-muted"
            >
              {Object.entries(viewports).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label} ({item.width}px)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex h-[calc(100dvh-7.5rem)] min-h-[42rem] justify-center overflow-y-auto overflow-x-hidden">
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
