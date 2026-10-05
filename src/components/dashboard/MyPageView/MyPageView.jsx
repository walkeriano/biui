"use client";

import EditorPanel from "@/components/dashboard/MyPageView/components/EditorPanel";
import PreviewPanel from "@/components/dashboard/MyPageView/components/preview/PreviewPanel";
import usePageEditor from "@/components/dashboard/MyPageView/hooks/usePageEditor";

export default function MyPageView() {
  const editor = usePageEditor();

  return (
    <div className="grid gap-5">
      <section className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Mi pagina</h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Edita tu pagina publica y guarda los cambios en Supabase.
          </p>
          {editor.error ? (
            <p className="mt-2 text-sm font-bold text-danger">{editor.error}</p>
          ) : null}
          {editor.feedback ? (
            <p className="mt-2 text-sm font-bold text-muted">
              {editor.feedback}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {editor.isLoading ? (
            <span className="text-sm font-bold text-muted">Cargando...</span>
          ) : null}
          {editor.isUploading ? (
            <span className="text-sm font-bold text-muted">Subiendo imagen...</span>
          ) : null}
          {editor.isSaving ? (
            <span className="text-sm font-bold text-primary">Publicando...</span>
          ) : null}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[24rem_minmax(0,1fr)]">
        <EditorPanel {...editor} />
        <PreviewPanel
          availableDays={editor.availableDays}
          data={editor.data}
          heroImage={editor.heroImage}
          profileImage={editor.profileImage}
          services={editor.services}
        />
      </div>
    </div>
  );
}
