"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { getCategoryMeta, CATEGORY_META } from "@/data/categories";
import { getGoogleMapsUrl, getVisitUrl, cx } from "@/lib/utils";

// IMPORTANT: dynamic import with ssr:false guarantees Leaflet only loads in the
// browser. This is what prevents Next.js hydration errors with the map.
const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-blush-soft">
      <div className="text-center text-ink-soft">
        <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-pink border-t-transparent" />
        <p className="text-sm">Loading map…</p>
      </div>
    </div>
  ),
});

// Interactive explorer: a scrollable results sidebar beside the live map.
// Both are driven by the same filtered `recs`, so search/filters update the
// list and the pins together. Clicking a result focuses its pin; "View Details"
// on a pin highlights and scrolls to the matching result.
export default function MapSection({ recs, isSaved, onToggleSave, savedOnly, onReset }) {
  const [focusId, setFocusId] = useState(null);
  const [highlightedId, setHighlightedId] = useState(null);
  const listRef = useRef(null);

  const handleViewDetails = useCallback((rec) => {
    setHighlightedId(rec.id);
    const el = document.getElementById(`side-${rec.id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    setTimeout(() => setHighlightedId(null), 2400);
  }, []);

  return (
    <section id="map" className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 text-center">
        <p className="eyebrow">The whole city</p>
        <h2 className="mt-2 font-serif text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Explore the <span className="italic text-pink">map</span>
        </h2>
        <div className="gold-rule mt-4" />
        <p className="mx-auto mt-4 max-w-xl text-sm text-ink-soft">
          Filter and search to update the list and the pins together. Tap a result
          to find it on the map, or a pin for details and directions.
        </p>
      </div>

      <div className="surface overflow-hidden p-1.5">
        <div className="grid grid-cols-1 gap-1.5 lg:grid-cols-[340px_minmax(0,1fr)]">
          {/* Results sidebar */}
          <div className="order-2 flex flex-col lg:order-1">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gold">
                {recs.length} {recs.length === 1 ? "result" : "results"}
              </span>
            </div>
            <div
              ref={listRef}
              className="no-scrollbar space-y-2 overflow-y-auto px-2 pb-2 lg:h-[564px]"
            >
              {recs.length === 0 ? (
                <div className="px-3 py-10 text-center">
                  <div className="text-3xl">{savedOnly ? "♡" : "🫥"}</div>
                  <p className="mt-2 text-sm font-semibold text-ink">
                    {savedOnly ? "No saved spots yet" : "No spots match"}
                  </p>
                  <p className="mt-1 text-xs text-ink-soft">
                    {savedOnly
                      ? "Tap the heart on any spot to save it."
                      : "Try a different search or filter."}
                  </p>
                  {!savedOnly && onReset && (
                    <button type="button" onClick={onReset} className="btn-secondary mt-4 px-4 py-2 text-xs">
                      Reset filters
                    </button>
                  )}
                </div>
              ) : (
                recs.map((rec) => (
                  <ResultCard
                    key={rec.id}
                    rec={rec}
                    isSaved={isSaved(rec.id)}
                    onToggleSave={onToggleSave}
                    onFocus={() => setFocusId(rec.id)}
                    highlighted={highlightedId === rec.id}
                  />
                ))
              )}
            </div>
          </div>

          {/* Map */}
          <div className="order-1 h-[420px] overflow-hidden rounded-[1.1rem] lg:order-2 lg:h-[600px]">
            <MapView recs={recs} onViewDetails={handleViewDetails} focusId={focusId} />
          </div>
        </div>
      </div>

      {/* Legend */}
      <ul className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2">
        {Object.entries(CATEGORY_META).map(([cat, meta]) => (
          <li key={cat} className="flex items-center gap-1.5 text-xs text-ink-soft">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ background: meta.color }}
              aria-hidden="true"
            />
            {meta.label}
          </li>
        ))}
      </ul>
    </section>
  );
}

// Compact result row for the sidebar.
function ResultCard({ rec, isSaved, onToggleSave, onFocus, highlighted }) {
  const meta = getCategoryMeta(rec.category);
  return (
    <div
      id={`side-${rec.id}`}
      className={cx(
        "rounded-2xl border bg-white p-2.5 transition",
        highlighted ? "border-pink shadow-glow" : "border-line hover:border-pink/40"
      )}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onFocus}
          aria-label={`Show ${rec.name} on the map`}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
          style={{ background: `linear-gradient(135deg, ${meta.color}22, #FDEDF1)` }}
        >
          <span aria-hidden="true">{meta.emoji}</span>
        </button>
        <button type="button" onClick={onFocus} className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-bold text-ink">{rec.name}</p>
          <p className="truncate text-xs text-ink-soft">
            <span className="font-semibold text-pink-deep">{meta.label}</span> · {rec.neighborhood}
          </p>
          {rec.price ? <p className="mt-0.5 truncate text-[11px] text-gold">{rec.price}</p> : null}
        </button>
        <button
          type="button"
          onClick={() => onToggleSave(rec.id)}
          aria-pressed={isSaved}
          aria-label={isSaved ? `Remove ${rec.name} from saved` : `Save ${rec.name}`}
          className={cx(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base transition",
            isSaved ? "bg-heart text-white" : "bg-blush-soft text-ink-soft hover:text-heart"
          )}
        >
          {isSaved ? "♥" : "♡"}
        </button>
      </div>
      <div className="mt-2 flex gap-2 pl-[3.75rem]">
        <a
          href={getVisitUrl(rec)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-chip flex-1 bg-pink py-1.5 text-white hover:bg-pink-deep"
        >
          Visit Now →
        </a>
        <a
          href={getGoogleMapsUrl(rec)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-chip flex-1 border border-line bg-white py-1.5 text-ink hover:bg-blush-soft"
        >
          📍 Maps
        </a>
      </div>
    </div>
  );
}
