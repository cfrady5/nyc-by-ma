"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import SlideCard, { SLIDE_W, SLIDE_H } from "./SlideCard";
import ScaledSlide from "./ScaledSlide";

// -----------------------------------------------------------------------------
// SLIDESHOW — fullscreen themed viewer with keyboard nav + PNG export
// -----------------------------------------------------------------------------
// The visible slide is a ScaledSlide (fits the screen). A hidden, full-size
// SlideCard (1080×1350) is what we actually capture for downloads, so exported
// images are always crisp regardless of screen size.
// -----------------------------------------------------------------------------

const slugify = (s) =>
  (s || "slide").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "slide";

export default function Slideshow({ theme, locations, startIndex = 0, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const [exportLoc, setExportLoc] = useState(null); // location currently in the hidden capture node
  const [busy, setBusy] = useState(false);
  const hiddenRef = useRef(null);

  const total = locations.length;
  const current = locations[index];

  const go = useCallback(
    (dir) => setIndex((i) => (i + dir + total) % total),
    [total]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  // Capture the hidden full-size node for a given location → PNG data URL.
  const captureLocation = useCallback(async (loc) => {
    setExportLoc(loc);
    // Wait two frames so the hidden node re-renders with the new location.
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const node = hiddenRef.current;
    if (!node) return null;
    return toPng(node, {
      width: SLIDE_W,
      height: SLIDE_H,
      pixelRatio: 1,
      cacheBust: true,
      style: { transform: "none" },
    });
  }, []);

  const triggerDownload = (dataUrl, filename) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const downloadCurrent = useCallback(async () => {
    if (!current) return;
    setBusy(true);
    try {
      const url = await captureLocation(current);
      if (url) triggerDownload(url, `${String(index + 1).padStart(2, "0")}-${slugify(current.name)}.png`);
    } catch (e) {
      console.error("Slide export failed", e);
      alert("Sorry — that slide couldn't be exported. Try again.");
    } finally {
      setExportLoc(null);
      setBusy(false);
    }
  }, [current, index, captureLocation]);

  const downloadAll = useCallback(async () => {
    setBusy(true);
    try {
      for (let i = 0; i < locations.length; i++) {
        const url = await captureLocation(locations[i]);
        if (url) triggerDownload(url, `${String(i + 1).padStart(2, "0")}-${slugify(locations[i].name)}.png`);
        await new Promise((r) => setTimeout(r, 250)); // let each download start
      }
    } catch (e) {
      console.error("Bulk export failed", e);
      alert("Some slides couldn't be exported. Try downloading them one at a time.");
    } finally {
      setExportLoc(null);
      setBusy(false);
    }
  }, [locations, captureLocation]);

  if (!current) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/80 backdrop-blur-sm">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-white">
        <span className="text-sm font-medium tabular-nums">
          {index + 1} / {total}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={downloadCurrent}
            disabled={busy}
            className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-ink transition hover:bg-blush-soft disabled:opacity-50"
          >
            ⬇ Download slide
          </button>
          <button
            type="button"
            onClick={downloadAll}
            disabled={busy}
            className="rounded-full bg-pink px-4 py-2 text-xs font-semibold text-white transition hover:bg-pink-deep disabled:opacity-50"
          >
            ⬇ Download all
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close slideshow"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-lg text-white transition hover:bg-white/25"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Stage */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-6">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous slide"
          className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-ink shadow-soft transition hover:bg-white sm:left-6"
        >
          ‹
        </button>

        <div className="w-full max-w-[min(92vw,440px)]">
          <ScaledSlide
            theme={theme}
            location={current}
            index={index}
            total={total}
            className="overflow-hidden rounded-2xl shadow-card"
          />
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next slide"
          className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-ink shadow-soft transition hover:bg-white sm:right-6"
        >
          ›
        </button>

        {busy ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-medium text-white">
            Exporting…
          </div>
        ) : null}
      </div>

      {/* Hidden full-size capture node (off-screen) */}
      <div style={{ position: "fixed", left: -100000, top: 0, pointerEvents: "none", opacity: 0 }} aria-hidden="true">
        <SlideCard
          ref={hiddenRef}
          theme={theme}
          location={exportLoc || current}
          index={index}
          total={total}
        />
      </div>
    </div>
  );
}
