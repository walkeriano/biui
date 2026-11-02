"use client";

import { useId, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Field from "@/components/dashboard/MyPageView/components/Field";
import SectionHeader from "@/components/dashboard/MyPageView/components/SectionHeader";
import { faCheck, faCopy, faLink } from "@/lib/fontawesome";
import { isReservedSlug, sanitizeSlug } from "@/lib/slug";

export default function PublicLinkSection({ data, isOpen, onToggle, updateData }) {
  const helpId = useId();
  const errorId = useId();
  const slug = sanitizeSlug(data.publicSlug);
  const isReserved = isReservedSlug(slug);
  const [copyResult, setCopyResult] = useState(null);
  const copyStatus = copyResult?.slug === slug ? copyResult.status : "idle";
  const publicUrl = `https://biui.es/${slug}`;

  const copyLink = async () => {
    if (!slug || isReserved) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopyResult({ slug, status: "success" });
    } catch {
      setCopyResult({ slug, status: "error" });
    }
  };

  return (
    <article className="overflow-hidden rounded-card border border-black bg-black shadow-card">
      <SectionHeader
        icon={faLink}
        isOpen={isOpen}
        onToggle={onToggle}
        title="Enlace público"
        description="Empieza aquí: elige la dirección que compartirás con tus clientes."
      />

      {isOpen ? (
        <div className="page-editor-content grid gap-4 bg-black p-4">
          <Field label="Nombre de tu enlace">
            <div className="flex overflow-hidden rounded-md border border-line bg-surface focus-within:border-accent focus-within:ring-4 focus-within:ring-accent-soft">
              <span className="grid shrink-0 place-items-center border-r border-line bg-surface-muted px-3 text-sm font-bold text-muted">
                /
              </span>
              <input
                value={data.publicSlug}
                onChange={(event) => updateData("publicSlug", sanitizeSlug(event.target.value))}
                placeholder="mi-negocio"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={64}
                aria-invalid={isReserved}
                aria-describedby={isReserved ? `${helpId} ${errorId}` : helpId}
                className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm font-medium text-foreground outline-none placeholder:text-muted"
              />
            </div>
          </Field>
          <p id={helpId} className="text-xs leading-5 text-muted">
            Usa el nombre de tu empresa con letras, números y guiones. Se añadirá
            después del dominio de la plataforma.
          </p>
          {isReserved ? (
            <p id={errorId} className="text-xs leading-5 text-danger">
              Este nombre está reservado. Elige otro para tu página.
            </p>
          ) : null}
          <div className="rounded-card border border-line bg-surface-muted p-3">
            <p className="text-xs font-bold text-muted">Así quedará tu enlace</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <p className="min-w-0 flex-1 break-all text-sm font-bold text-foreground" aria-live="polite">
                biui.es/{slug || "mi-negocio"}
              </p>
              <button
                type="button"
                onClick={copyLink}
                disabled={!slug || isReserved}
                className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-line bg-surface px-3 text-xs font-bold text-success transition hover:border-success focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FontAwesomeIcon icon={copyStatus === "success" ? faCheck : faCopy} className="size-3.5" />
                {copyStatus === "success" ? "Copiado" : "Copiar"}
              </button>
            </div>
            <p role="status" className="mt-2 text-xs leading-5 text-muted">
              {copyStatus === "success"
                ? "Enlace copiado al portapapeles."
                : copyStatus === "error"
                  ? "No se pudo copiar. Selecciona el enlace y cópialo manualmente."
                  : !slug ? "Elige un nombre para poder copiar tu enlace." : ""}
            </p>
          </div>
          <p className="text-xs leading-5 text-muted">
            El enlace se guarda al publicar los cambios de tu página. Si cambias
            uno ya publicado, comparte la nueva dirección con tus clientes.
          </p>
        </div>
      ) : null}
    </article>
  );
}
