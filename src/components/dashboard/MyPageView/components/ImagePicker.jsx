import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faTrash, faUpload } from "@/lib/fontawesome";
import { ghostButtonClassName } from "@/components/dashboard/MyPageView/data";

export default function ImagePicker({
  label,
  image,
  onChange,
  onClear,
  hint,
}) {
  return (
    <div>
      <p className="mb-2 text-[0.75rem] font-bold text-foreground">{label}</p>
      <div className="grid gap-3">
        <div className="h-36 overflow-hidden rounded-card border border-line bg-surface-muted">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-muted">
              <FontAwesomeIcon icon={faImage} className="size-7" />
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className={ghostButtonClassName}>
            <FontAwesomeIcon icon={faUpload} className="size-3.5" />
            Cambiar imagen
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={onChange}
            />
          </label>
          <button
            type="button"
            onClick={onClear}
            className="flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-surface px-3 text-[0.8125rem] font-bold text-danger transition hover:border-danger"
          >
            <FontAwesomeIcon icon={faTrash} className="size-3.5" />
            Eliminar
          </button>
        </div>
      </div>
      <p className="mt-2 text-[0.75rem] text-muted">{hint}</p>
    </div>
  );
}
