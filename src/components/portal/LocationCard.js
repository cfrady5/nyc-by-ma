"use client";

import ScaledSlide from "./ScaledSlide";
import { slideImages } from "./SlideCard";

const TYPE_BADGE = {
  cover: { label: "Cover", cls: "bg-butter text-ink" },
  end: { label: "End · QR", cls: "bg-lavender text-ink" },
  location: { label: "Location", cls: "bg-blush text-pink-deep" },
};

// One slide in the deck: a live preview (click to open the full editor) plus
// reorder / edit / delete. Works for cover, location, and end slides.
export default function LocationCard({ location, theme, index, total, onEdit, onRemove, onMove }) {
  const type = location.type || "location";
  const badge = TYPE_BADGE[type] || TYPE_BADGE.location;
  const imgCount = slideImages(location).length;

  const title =
    location.name || (type === "cover" ? "Cover" : type === "end" ? "Follow along" : "Untitled");

  return (
    <div className="surface overflow-hidden p-3">
      <div className="flex gap-3">
        {/* Preview (click to edit) */}
        <button
          type="button"
          onClick={() => onEdit(location.id)}
          className="w-28 shrink-0 sm:w-32"
          aria-label={`Edit ${title}`}
        >
          <ScaledSlide
            theme={theme}
            location={location}
            index={index}
            total={total}
            className="overflow-hidden rounded-lg ring-1 ring-ink/10 transition hover:ring-pink/50"
          />
        </button>

        {/* Meta + actions */}
        <div className="min-w-0 flex-1">
          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badge.cls}`}>
            {badge.label}
          </span>
          <p className="mt-1.5 truncate font-serif text-base font-bold text-ink">{title}</p>
          {type === "location" && location.neighborhood ? (
            <p className="truncate text-xs text-ink-soft">{location.neighborhood}</p>
          ) : null}
          {type === "end" ? (
            <p className="truncate text-xs text-ink-soft">{location.handle || "@NYC_BY_MA"}</p>
          ) : null}
          {type !== "end" ? (
            <p className="mt-0.5 text-[11px] text-ink-soft/80">
              {imgCount} {imgCount === 1 ? "photo" : "photos"}
            </p>
          ) : null}
          {location.website ? (
            <a
              href={location.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-block max-w-full truncate text-[11px] font-semibold text-pink-deep hover:underline"
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
              onClick={() => onEdit(location.id)}
              className="rounded-full bg-pink px-3 py-1.5 text-xs font-semibold text-white hover:bg-pink-deep"
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
