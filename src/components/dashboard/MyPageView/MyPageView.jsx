"use client";

import EditorPanel from "@/components/dashboard/MyPageView/components/EditorPanel";
import PublishStatusModal from "@/components/dashboard/MyPageView/components/PublishStatusModal";
import PreviewPanel from "@/components/dashboard/MyPageView/components/preview/PreviewPanel";
import usePageEditor from "@/components/dashboard/MyPageView/hooks/usePageEditor";

export default function MyPageView({ onViewChange }) {
  const editor = usePageEditor();

  return (
    <div className="grid gap-5">
      <PublishStatusModal
        onClose={editor.closePublishStatus}
        onGoHome={() => onViewChange?.("home")}
        status={editor.publishStatus}
      />

      {editor.error || editor.feedback || editor.isLoading || editor.isUploading || editor.isSaving ? (
        <div className="flex flex-wrap items-center gap-3 text-sm font-bold">
          {editor.error ? (
            <span className="text-danger">{editor.error}</span>
          ) : null}
          {editor.feedback ? (
            <span className="text-muted">{editor.feedback}</span>
          ) : null}
          {editor.isLoading ? (
            <span className="text-muted">Cargando...</span>
          ) : null}
          {editor.isUploading ? (
            <span className="text-muted">Subiendo imagen...</span>
          ) : null}
          {editor.isSaving ? (
            <span className="text-primary">Publicando...</span>
          ) : null}
        </div>
      ) : null}

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
