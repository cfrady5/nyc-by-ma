"use client";

import RecImage from "./RecImage";
import { getCategoryMeta } from "@/data/categories";
import { getGoogleMapsUrl, getVisitUrl, cx } from "@/lib/utils";

// A single editorial-style recommendation card.
export default function RecommendationCard({ rec, isSaved, onToggleSave, highlighted }) {
  const meta = getCategoryMeta(rec.category);

  return (
    <article
      id={`rec-${rec.id}`}
      className={cx(
        "surface group flex animate-fade-up flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-glow scroll-mt-40",
        highlighted && "ring-2 ring-pink shadow-glow"
      )}
    >
      {/* Image / placeholder */}
      <div className="relative">
        <RecImage rec={rec} className="h-44 w-full sm:h-48" />

        {/* Category badge — neutral white chip with a colored dot (always legible) */}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-ink shadow-soft backdrop-blur">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: meta.color }}
            aria-hidden="true"
          />
          {meta.emoji} {meta.label}
        </span>

        {/* Save button */}
        <button
          type="button"
          onClick={() => onToggleSave(rec.id)}
          aria-pressed={isSaved}
          aria-label={isSaved ? `Remove ${rec.name} from saved` : `Save ${rec.name}`}
          className={cx(
            "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-lg shadow-soft backdrop-blur transition active:scale-90",
            isSaved
              ? "animate-pulse-heart bg-heart text-white"
              : "bg-white/90 text-ink-soft hover:bg-white hover:text-heart"
          )}
        >
          {isSaved ? "♥" : "♡"}
        </button>

        {/* Price label */}
        {rec.price ? (
          <span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-gold shadow-soft backdrop-blur">
            {rec.price}
          </span>
        ) : null}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-serif text-lg font-bold leading-tight text-ink">{rec.name}</h3>
        <p className="mt-0.5 text-xs font-semibold text-pink-deep">
          {rec.neighborhood}
          {rec.subcategory ? <span className="text-ink-soft"> · {rec.subcategory}</span> : null}
        </p>

        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft">
          {rec.recommendation}
        </p>

        {/* Tags */}
        {rec.tags?.length ? (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {rec.tags.slice(0, 4).map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-blush-soft px-2.5 py-0.5 text-[11px] text-pink-deep"
              >
                #{tag.replace(/\s+/g, "")}
              </li>
            ))}
          </ul>
        ) : null}

        {/* Actions */}
        <div className="mt-4 flex flex-wrap gap-2 pt-1">
          <a
            href={getVisitUrl(rec)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-chip flex-1 bg-pink text-white shadow-glow hover:bg-pink-deep"
          >
            Visit Now →
          </a>
          <a
            href={getGoogleMapsUrl(rec)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-chip flex-1 border border-ink/15 bg-white text-ink hover:bg-blush-soft"
          >
            📍 Open in Maps
          </a>
        </div>
      </div>
    </article>
  );
}
