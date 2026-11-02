"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PublicPage from "@/components/public-page/PublicPage";
import { buildTimeSlots } from "@/lib/availability";
import { sanitizeSlug } from "@/lib/slug";
import { useAuth } from "@/context/AuthContext";

// Screen bounds are measured against the original PNG dimensions.
const deviceFrames = {
  desktop: {
    image: "/mock-laptop.png",
    width: 1643,
    height: 961,
    screen: { left: 223, top: 88, width: 1197, height: 746, radius: 0 },
  },
  mobile: {
    image: "/mock-movil.png",
    width: 855,
    height: 1635,
    screen: { left: 88, top: 72, width: 687, height: 1487, radius: 90 },
  },
};

export default function PreviewPage({
  availableDays,
  data,
  heroImage,
  profileImage,
  services,
  viewport,
}) {
  const { user } = useAuth();
  const professionalName = user?.user_metadata?.full_name || user?.user_metadata?.name || "Profesional";
  const page = useMemo(
    () => ({
      about: {
        description: data.profileDescription,
        image: profileImage,
        subtitle: data.profileSubtitle,
        title: data.profileTitle,
      },
      availability: {
        days: availableDays,
        end: data.scheduleEnd,
        start: data.scheduleStart,
        times: buildTimeSlots(data.scheduleStart, data.scheduleEnd),
      },
      contact: {
        address: data.address,
        city: data.city,
        email: data.email,
        phone: data.phone,
        socialFacebook: data.socialFacebook,
        socialInstagram: data.socialInstagram,
        socialYoutube: data.socialYoutube,
      },
      hero: {
        businessName: data.businessName,
        image: heroImage,
        label: data.heroLabel,
        text: data.heroText,
        title: data.heroTitle,
      },
      professional: {
        avatarInitials: professionalName.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
        logoImage: data.logoImage,
        name: professionalName,
        title: data.profileSubtitle || "",
      },
      services,
      slug: sanitizeSlug(data.publicSlug) || "vista-previa",
      theme: {
        buttonStyle: data.buttonStyle,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        textFont: data.textFont,
        titleFont: data.titleFont,
      },
    }),
    [availableDays, data, heroImage, profileImage, services, professionalName],
  );
  const previewWidth = viewport?.width ?? 1280;
  const isMobile = previewWidth < 600;
  const device = deviceFrames[isMobile ? "mobile" : "desktop"];
  const { screen } = device;
  const [availableSize, setAvailableSize] = useState({ width: 0, height: 0 });
  const deviceScale = Math.min(
    availableSize.width / device.width,
    availableSize.height / device.height,
    isMobile ? 360 / device.width : 1,
  );
  const screenScale = (screen.width * deviceScale) / previewWidth;
  const previewHeight = (previewWidth * screen.height) / screen.width;
  const [frameDocument, setFrameDocument] = useState(null);
  const [frameRoot, setFrameRoot] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const updateSize = () => setAvailableSize({
      width: container.clientWidth,
      height: container.clientHeight,
    });
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);
    updateSize();

    return () => observer.disconnect();
  }, []);

  const handleFrameLoad = (event) => {
    const nextDocument = event.currentTarget.contentDocument;
    const nextRoot = nextDocument?.getElementById("preview-root");

    if (!nextDocument || !nextRoot) {
      setFrameDocument(null);
      setFrameRoot(null);
      return;
    }

    copyDocumentStyles(nextDocument);
    setFrameDocument(nextDocument);
    setFrameRoot(nextRoot);
  };

  return (
    <div ref={containerRef} className="flex h-full w-full min-w-0 items-start justify-center">
      <div
        className="relative shrink-0"
        style={{
          width: device.width * deviceScale,
          height: device.height * deviceScale,
          visibility: deviceScale > 0 ? "visible" : "hidden",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={device.image}
          alt=""
          aria-hidden="true"
          draggable={false}
          width={device.width}
          height={device.height}
          className="pointer-events-none absolute inset-0 h-full w-full select-none"
        />
        <div
          className="absolute overflow-hidden bg-white"
          style={{
            left: `${(screen.left / device.width) * 100}%`,
            top: `${(screen.top / device.height) * 100}%`,
            width: `${(screen.width / device.width) * 100}%`,
            height: `${(screen.height / device.height) * 100}%`,
            borderRadius: `${(screen.radius / screen.width) * 100}% / ${(screen.radius / screen.height) * 100}%`,
          }}
        >
          {!frameRoot ? (
            <div className="absolute inset-0 grid place-items-center bg-white text-xs font-bold text-muted">
              Cargando vista previa...
            </div>
          ) : null}
          <iframe
            key={previewWidth}
            title={`Vista previa de página pública en ${isMobile ? "móvil" : "portátil"}`}
            srcDoc={getPreviewDocument()}
            onLoad={handleFrameLoad}
            className="absolute left-0 top-0 block origin-top-left border-0 bg-white"
            style={{
              height: previewHeight,
              width: previewWidth,
              transform: `scale(${screenScale})`,
            }}
          />
        </div>
        {frameRoot && frameDocument
          ? createPortal(
              <PublicPage page={page} previewMode />,
              frameRoot,
            )
          : null}
      </div>
    </div>
  );
}

function getPreviewDocument() {
  return `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <base target="_self" />
        <style>
          html, body, #preview-root {
            margin: 0;
            min-height: 100%;
            width: 100%;
            background: white;
          }

          html {
            overflow-x: hidden;
            overflow-y: auto;
            overscroll-behavior-y: contain;
            scrollbar-width: thin;
          }
        </style>
      </head>
      <body>
        <div id="preview-root"></div>
      </body>
    </html>
  `;
}

function copyDocumentStyles(frameDocument) {
  if (frameDocument.head.dataset.stylesCopied === "true") {
    return;
  }

  document
    .querySelectorAll('link[rel="stylesheet"], style')
    .forEach((node) => {
      frameDocument.head.appendChild(node.cloneNode(true));
    });

  frameDocument.head.dataset.stylesCopied = "true";
}
