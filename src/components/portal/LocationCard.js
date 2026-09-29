"use client";

import { useRef, useState } from "react";
import ScaledSlide from "./ScaledSlide";
import { fileToScaledDataUrl } from "@/lib/imageResize";

// One saved location: a live mini slide preview plus reorder / edit / delete.
export default function LocationCard({
  location,
  theme,
  index,
  total,
  onUpdate,
  onRemove,
  onMove,
}) {
  const [editing, setEditing] = useState(false);
  const fileRef = useRef(null);

  const replacePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await fileToScaledDataUrl(file);
      onUpdate(location.id, { image: url });
    } catch {
      /* ignore bad file */
    }
  };

  const field =
    "w-full rounded-lg border border-ink/12 bg-white px-3 py-2 text-sm text-ink focus:border-pink/50 focus:outline-none";

  return (
    <div className="surface overflow-hidden p-3">
      <div className="flex gap-3">
        {/* Mini preview */}
        <div className="w-24 shrink-0 sm:w-28">
          <ScaledSlide
            theme={theme}
            location={location}
            index={index}
            total={total}
            className="overflow-hidden rounded-lg ring-1 ring-ink/10"
          />
        </div>

        {/* Meta + actions */}
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="space-y-2">
              <input
                value={location.name}
                onChange={(e) => onUpdate(location.id, { name: e.target.value })}
                placeholder="Name"
                className={field}
              />
              <input
                value={location.neighborhood}
                onChange={(e) => onUpdate(location.id, { neighborhood: e.target.value })}
                placeholder="Neighborhood"
                className={field}
              />
              <textarea
                value={location.caption}
                onChange={(e) => onUpdate(location.id, { caption: e.target.value })}
                rows={2}
                placeholder="Caption"
                className={`${field} resize-none`}
              />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="rounded-full border border-ink/12 bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-blush-soft"
                >
                  Replace photo
                </button>
                <input ref={fileRef} type="file" accept="image/*" onChange={replacePhoto} className="hidden" />
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-full bg-pink px-3 py-1.5 text-xs font-semibold text-white hover:bg-pink-deep"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="truncate font-serif text-base font-bold text-ink">{location.name}</p>
              {location.neighborhood ? (
                <p className="truncate text-xs text-ink-soft">{location.neighborhood}</p>
              ) : null}
              {location.caption ? (
                <p className="mt-1 line-clamp-3 text-xs text-ink-soft/90">{location.caption}</p>
              ) : null}
              {location.website ? (
                <a
                  href={location.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block max-w-full truncate text-[11px] font-semibold text-pink-deep hover:underline"
                >
                  🔗 {location.website.replace(/^https?:\/\//, "")}
                </a>
              ) : null}

              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <IconBtn label="Move up" disabled={index === 0} onClick={() => onMove(location.id, "up")}>
                  ▲
                </IconBtn>
                <IconBtn label="Move down" disabled={index === total - 1} onClick={() => onMove(location.id, "down")}>
                  ▼
                </IconBtn>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="rounded-full border border-ink/12 bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-blush-soft"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(location.id)}
                  className="rounded-full border border-heart/30 bg-white px-3 py-1.5 text-xs font-semibold text-heart hover:bg-heart hover:text-white"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function IconBtn({ children, label, onClick, disabled }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-7 w-7 items-center justify-center rounded-full border border-ink/12 bg-white text-xs text-ink transition hover:bg-blush-soft disabled:opacity-30"
    >
      {children}
    </button>
  );
}
