import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faClock,
  faHouse,
  faUpRightFromSquare,
  faXmark,
} from "@/lib/fontawesome";

export default function PublishStatusModal({ onClose, onGoHome, status }) {
  if (!status || status.state === "idle") {
    return null;
  }

  const isPublishing = status.state === "publishing";
  const isSuccess = status.state === "success";
  const pageHref = status.href || "";

  const handleGoHome = () => {
    onClose?.();
    onGoHome?.();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-primary/40 px-4 backdrop-blur-sm">
      <section className="w-full max-w-md rounded-card border border-line bg-surface p-5 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <span
            className={
              isSuccess
                ? "grid size-11 place-items-center rounded-full bg-success-soft text-success"
                : isPublishing
                  ? "grid size-11 place-items-center rounded-full bg-blue-50 text-blue-600"
                  : "grid size-11 place-items-center rounded-full bg-danger-soft text-danger"
            }
          >
            <FontAwesomeIcon
              icon={isSuccess ? faCheck : isPublishing ? faClock : faXmark}
              className={isPublishing ? "size-4 animate-pulse" : "size-4"}
            />
          </span>

          {!isPublishing ? (
            <button
              type="button"
              onClick={onClose}
              className="grid size-9 place-items-center rounded-md text-muted transition hover:bg-surface-muted hover:text-foreground"
              aria-label="Cerrar"
            >
              <FontAwesomeIcon icon={faXmark} className="size-4" />
            </button>
          ) : null}
        </div>

        <h3 className="mt-4 text-lg font-bold text-foreground">
          {isSuccess
            ? "Pagina publicada"
            : isPublishing
              ? "Publicando cambios"
              : "No se pudo publicar"}
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted">{status.message}</p>

        {isPublishing ? (
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-surface-muted">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-accent" />
          </div>
        ) : isSuccess ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleGoHome}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-surface px-4 text-sm font-bold text-foreground transition hover:border-accent hover:text-accent"
            >
              <FontAwesomeIcon icon={faHouse} className="size-3.5" />
              Ir al inicio
            </button>
            <a
              href={pageHref || "#"}
              target="_blank"
              rel="noreferrer"
              onClick={!pageHref ? (event) => event.preventDefault() : undefined}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary-hover"
            >
              Abrir pagina
              <FontAwesomeIcon icon={faUpRightFromSquare} className="size-3.5" />
            </a>
          </div>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="mt-5 h-11 w-full rounded-md bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary-hover"
          >
            Entendido
          </button>
        )}
      </section>
    </div>
  );
}
