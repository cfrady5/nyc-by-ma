"use client";

import { useEffect, useRef, useState } from "react";
import { getCategoryMeta, getCategoryImage } from "@/data/categories";

// Card cover image. We use a CATEGORY-level stock photo (one per category, in
// /public/categories/) layered over an always-present branded placeholder.
//
// The placeholder is the BASE layer and is always drawn; the cover photo fades
// in on top once it loads. If a category has no cover yet, or the file fails to
// load, the placeholder simply remains — so the UI never shows a broken image.
export default function RecImage({ rec, className = "" }) {
  const meta = getCategoryMeta(rec.category);
  // Per-place override wins if provided; otherwise the category cover.
  const coverSrc = rec.imageOverride || getCategoryImage(rec.category);

  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const imgRef = useRef(null);
  const showImg = Boolean(coverSrc) && !errored;

  // Catch images that finished loading (e.g. cached) before React attached the
  // onLoad handler — otherwise the fade-in would never trigger.
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth > 0) setLoaded(true);
  }, [coverSrc]);

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
        <div className="relative px-5">
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

      {/* Category cover photo (decorative — the place identity is in the card text) */}
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={coverSrc}
          alt=""
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
          style={{ opacity: loaded ? 1 : 0 }}
        />
      ) : null}
    </div>
  );
}
