"use client";

import { useState } from "react";
import { getCategoryMeta } from "@/data/categories";

// Renders a recommendation photo over an always-present branded placeholder.
//
// The gradient "Photo coming soon" placeholder is the BASE layer and is always
// drawn. If a real photo exists it fades in on top; if the file is missing or
// fails to load, the <img> is removed and the placeholder simply remains —
// so the UI NEVER shows a broken image, even for a split second.
//
// Drop real photos into /public/recommendation-photos/ to replace placeholders.
export default function RecImage({ rec, className = "" }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const meta = getCategoryMeta(rec.category);
  const showImg = Boolean(rec.image) && !errored;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Branded placeholder (base layer, always present) */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center"
        style={{
          background: `radial-gradient(120% 120% at 0% 0%, ${meta.color}33, transparent 60%), radial-gradient(120% 120% at 100% 100%, #FFF1B855, transparent 55%), #FDEDF1`,
        }}
        role={showImg && loaded ? "presentation" : "img"}
        aria-label={showImg && loaded ? undefined : `${rec.name} — photo coming soon`}
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.10]" aria-hidden="true">
          <div className="absolute -right-6 -top-6 text-[8rem] leading-none">{meta.emoji}</div>
        </div>
        <div className="relative z-10 px-5">
          <div className="mb-2 text-3xl" aria-hidden="true">
            {meta.emoji}
          </div>
          <h3 className="font-serif text-lg font-bold leading-tight text-ink">{rec.name}</h3>
          <p className="mt-0.5 text-sm text-ink-soft">{rec.neighborhood}</p>
          <span className="mt-3 inline-block rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
            {meta.label}
          </span>
        </div>
        <span className="absolute bottom-3 left-3 whitespace-nowrap rounded-full bg-white/80 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-ink-soft">
          📷 Photo coming soon
        </span>
      </div>

      {/* Real photo (fades in on top once it loads) */}
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={rec.image}
          alt={`${rec.name} in ${rec.neighborhood}`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
          style={{ opacity: loaded ? 1 : 0 }}
        />
      ) : null}
    </div>
  );
}
