"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PublicPage from "@/components/public-page/PublicPage";
import { buildTimeSlots } from "@/lib/availability";
import { sanitizeSlug } from "@/lib/slug";

export default function PreviewPage({
  availableDays,
  data,
  heroImage,
  profileImage,
  services,
  viewport,
}) {
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
        image: heroImage,
        label: data.heroLabel,
        text: data.heroText,
        title: data.heroTitle,
      },
      professional: {
        avatarInitials: "LM",
        logoImage: data.logoImage,
        name: "Laura Martin",
        title: "Psicologa",
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
    [availableDays, data, heroImage, profileImage, services],
  );
  const previewWidth = viewport?.width ?? 1280;
  const previewZoom = previewWidth < 600 ? 0.92 : 0.56;
  const [frameDocument, setFrameDocument] = useState(null);
  const [frameRoot, setFrameRoot] = useState(null);
  const [frameHeight, setFrameHeight] = useState(900);
  const iframeRef = useRef(null);

  const handleFrameLoad = (event) => {
    const nextDocument = event.currentTarget.contentDocument;
    const nextRoot = nextDocument?.getElementById("preview-root");

    if (!nextDocument || !nextRoot) {
      setFrameDocument(null);
      setFrameRoot(null);
      return;
    }

    copyDocumentStyles(nextDocument);
    setFrameHeight(900);
    setFrameDocument(nextDocument);
    setFrameRoot(nextRoot);
  };

  useEffect(() => {
    if (!frameDocument) {
      return undefined;
    }

    const updateHeight = () => {
      setFrameHeight(
        Math.max(
          900,
          frameDocument.documentElement.scrollHeight,
          frameDocument.body.scrollHeight,
          frameRoot?.scrollHeight ?? 0,
        ),
      );
    };
    const observer = new ResizeObserver(updateHeight);
    observer.observe(frameDocument.body);
    if (frameRoot) {
      observer.observe(frameRoot);
    }
    updateHeight();

    return () => observer.disconnect();
  }, [frameDocument, frameRoot, page]);

  return (
    <div
      className="relative origin-top bg-white"
      style={{
        minWidth: `${previewWidth}px`,
        width: `${previewWidth}px`,
        zoom: previewZoom,
      }}
    >
      {!frameRoot ? (
        <div className="absolute inset-x-0 top-0 z-10 grid h-80 place-items-center bg-white text-sm font-bold text-muted">
          Cargando vista previa...
        </div>
      ) : null}
      <iframe
        key={previewWidth}
        ref={iframeRef}
        title="Vista previa de pagina publica"
        srcDoc={getPreviewDocument()}
        onLoad={handleFrameLoad}
        className="block border-0 bg-white"
        style={{
          height: `${frameHeight}px`,
          width: `${previewWidth}px`,
        }}
      />
      {frameRoot && frameDocument
        ? createPortal(
            <PublicPage page={page} previewMode />,
            frameRoot,
          )
        : null}
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
        <base target="_parent" />
        <style>
          html, body, #preview-root {
            margin: 0;
            min-height: 100%;
            width: 100%;
            background: white;
          }

          body {
            overflow: hidden;
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
