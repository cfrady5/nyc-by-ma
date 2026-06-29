"use client";

import { useEffect, useRef, useState } from "react";
import { getCategoryMeta } from "@/data/categories";

// Card cover. Until a business has its OWN real photo, we show a clean,
// premium category ICON (not a stock photo) so cards read as intentional
// placeholders rather than misleading imagery.
//
// To use a real business photo later, set `imageOverride` on the recommendation
// to a path under /public (e.g. "/recommendation-photos/levain.jpg"). When set,
// it fades in over the icon; if it ever fails to load, the icon remains — so
// there are never broken images.
export default function RecImage({ rec, className = "" }) {
  const meta = getCategoryMeta(rec.category);
  const photo = rec.imageOverride || null; // real per-business photo only

  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const imgRef = useRef(null);
  const showImg = Boolean(photo) && !errored;

  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth > 0) setLoaded(true);
  }, [photo]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Category icon placeholder (base layer) */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-2"
        style={{ background: `linear-gradient(135deg, ${meta.color}1F, #FDEDF1)` }}
        role={showImg && loaded ? "presentation" : "img"}
        aria-label={showImg && loaded ? undefined : `${rec.name} — ${meta.label}`}
      >
        <span
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white/85 text-3xl shadow-soft"
          aria-hidden="true"
        >
          {meta.emoji}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
          {meta.label}
        </span>
      </div>

      {/* Real business photo (only when provided) */}
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={photo}
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
