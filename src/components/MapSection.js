"use client";

import dynamic from "next/dynamic";
import { CATEGORY_META } from "@/data/categories";

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

// Categories to show in the map legend (mirrors the pin colors).
const LEGEND = Object.entries(CATEGORY_META);

export default function MapSection({ recs, onViewDetails }) {
  return (
    <section id="map" className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 text-center">
        <p className="eyebrow">The whole city</p>
        <h2 className="mt-2 font-serif text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Explore the <span className="italic text-pink">map</span>
        </h2>
        <div className="gold-rule mt-4" />
        <p className="mx-auto mt-4 max-w-xl text-sm text-ink-soft">
          Pins update live as you search and filter. Tap a pin for details, the
          official site, or directions.
        </p>
      </div>

      {/* Responsive map height: 420px mobile, 600px desktop. */}
      <div className="surface overflow-hidden p-1.5">
        <div className="h-[420px] w-full overflow-hidden rounded-[1.25rem] sm:h-[600px]">
          <MapView recs={recs} onViewDetails={onViewDetails} />
        </div>
      </div>

      {/* Legend */}
      <ul className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2">
        {LEGEND.map(([cat, meta]) => (
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
