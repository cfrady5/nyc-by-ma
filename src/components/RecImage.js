"use client";

import { useState } from "react";
import { getCategoryMeta } from "@/data/categories";

// Renders a recommendation photo, or — if the file is missing / fails to load —
// a beautiful gradient placeholder card with the place's details.
//
// This guarantees the UI NEVER breaks when a photo hasn't been added yet.
// Drop real photos into /public/recommendation-photos/ to replace placeholders.
export default function RecImage({ rec, className = "" }) {
  const [errored, setErrored] = useState(false);
  const meta = getCategoryMeta(rec.category);
  const showPlaceholder = !rec.image || errored;

  if (showPlaceholder) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center overflow-hidden text-center ${className}`}
        style={{
          background: `radial-gradient(120% 120% at 0% 0%, ${meta.color}33, transparent 60%), radial-gradient(120% 120% at 100% 100%, #EFCB6A40, transparent 55%), #FDEEF1`,
        }}
        role="img"
        aria-label={`${rec.name} — photo coming soon`}
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
    );
  }

  return (
    // Plain <img> (not next/image) keeps this fully static & Vercel-friendly,
    // and lets us catch load errors to show the placeholder above.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={rec.image}
      alt={`${rec.name} in ${rec.neighborhood}`}
      loading="lazy"
      onError={() => setErrored(true)}
      className={`object-cover ${className}`}
    />
  );
}
