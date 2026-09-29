"use client";

import { useRef, useState } from "react";
import ScaledSlide from "./ScaledSlide";
import { slideImages } from "./SlideCard";
import { fileToScaledDataUrl } from "@/lib/imageResize";
import { cx } from "@/lib/utils";

// -----------------------------------------------------------------------------
// SLIDE EDITOR — full-screen editor with a LARGE live preview + all controls
// -----------------------------------------------------------------------------
// Type-aware: location slides get name/neighborhood/caption + photo manager +
// text position; cover slides get eyebrow/title/subtitle + photos; end slides
// get heading/handle/message + an auto QR code (no photos). Everything updates
// the preview live.
// -----------------------------------------------------------------------------

export default function SlideEditor({ location, theme, index, total, studio, onClose }) {
  const loc = location;
  const type = loc.type || "location";
  const images = slideImages(loc);
  const fileRef = useRef(null);
  const [adding, setAdding] = useState(false);
  const [showPull, setShowPull] = useState(false);

  // Every photo used on OTHER slides, de-duplicated — so this slide (e.g. a
  // cover collage) can reuse them without re-uploading.
  const currentSet = new Set(images);
  const otherImages = [
    ...new Set(
      (studio.locations || []).flatMap((l) => (l.id === loc.id ? [] : slideImages(l)))
    ),
  ];
  const pullable = otherImages.filter((src) => !currentSet.has(src));

  const set = (patch) => studio.updateLocation(loc.id, patch);

  const onAddPhotos = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setAdding(true);
    try {
      const urls = [];
      for (const f of files) {
        try {
          urls.push(await fileToScaledDataUrl(f));
        } catch {
          /* skip bad file */
        }
      }
      if (urls.length) studio.addImages(loc.id, urls);
    } finally {
      setAdding(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const field =
    "w-full rounded-xl border border-ink/12 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/70 focus:border-pink/50 focus:outline-none";
  const labelCls = "mb-1 block text-xs font-semibold text-ink";

  const typeLabel = type === "cover" ? "Cover slide" : type === "end" ? "End slide" : "Location slide";

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/70 backdrop-blur-sm">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-white">
        <span className="text-sm font-semibold">
          {typeLabel} · {index + 1} / {total}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-ink transition hover:bg-blush-soft"
        >
          Done
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-6 lg:flex-row lg:gap-6">
        {/* Large preview */}
        <div className="flex justify-center lg:w-[42%] lg:justify-end">
          <div className="w-full max-w-[360px] lg:sticky lg:top-2">
            <ScaledSlide
              theme={theme}
              location={loc}
              index={index}
              total={total}
              className="overflow-hidden rounded-2xl shadow-card ring-1 ring-white/20"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="lg:w-[58%]">
          <div className="mx-auto max-w-md space-y-5 rounded-2xl bg-cream p-4 sm:p-5">
            {/* Text fields (type-aware) */}
            {type === "cover" ? (
              <>
                <Text label="Eyebrow (small top line)" value={loc.eyebrow} onChange={(v) => set({ eyebrow: v })} placeholder="NYC by MA" field={field} labelCls={labelCls} />
                <Text label="Title" value={loc.name} onChange={(v) => set({ name: v })} placeholder="May Recs" field={field} labelCls={labelCls} />
                <Area label="Subtitle" value={loc.caption} onChange={(v) => set({ caption: v })} placeholder="This month's favorite spots" field={field} labelCls={labelCls} />
              </>
            ) : type === "end" ? (
              <>
                <Text label="Heading" value={loc.name} onChange={(v) => set({ name: v })} placeholder="Follow along" field={field} labelCls={labelCls} />
                <Text label="Instagram handle" value={loc.handle} onChange={(v) => set({ handle: v })} placeholder="@NYC_BY_MA" field={field} labelCls={labelCls} />
                <Area label="Message" value={loc.caption} onChange={(v) => set({ caption: v })} placeholder="For more NYC recs, follow along." field={field} labelCls={labelCls} />
                <p className="rounded-xl bg-blush-soft px-3 py-2 text-xs text-ink-soft">
                  The QR code is generated automatically from the handle — scanning it opens your Instagram.
                </p>
              </>
            ) : (
              <>
                <Text label="Name" value={loc.name} onChange={(v) => set({ name: v })} placeholder="Levain Bakery" field={field} labelCls={labelCls} />
                <Text label="Neighborhood / area" value={loc.neighborhood} onChange={(v) => set({ neighborhood: v })} placeholder="Upper West Side" field={field} labelCls={labelCls} />
                <Area label="Caption" value={loc.caption} onChange={(v) => set({ caption: v })} placeholder="What makes it special…" field={field} labelCls={labelCls} />
              </>
            )}

            {/* Text position (location + cover) */}
            {type !== "end" ? (
              <Segmented
                label="Text position"
                value={loc.textPosition || "top"}
                options={[
                  { value: "top", label: "Top" },
                  { value: "bottom", label: "Bottom" },
                ]}
                onChange={(v) => set({ textPosition: v })}
              />
            ) : null}

            {/* Photos (not on end slide) */}
            {type !== "end" ? (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className={labelCls + " mb-0"}>Photos ({images.length})</span>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={adding}
                    className="rounded-full bg-pink px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-pink-deep disabled:opacity-50"
                  >
                    {adding ? "Adding…" : "＋ Add photos"}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" multiple onChange={onAddPhotos} className="hidden" />
                </div>

                {/* Pull photos from other slides */}
                {pullable.length ? (
                  <div className="mb-2">
                    <button
                      type="button"
                      onClick={() => setShowPull((s) => !s)}
                      aria-expanded={showPull}
                      className="flex w-full items-center justify-between rounded-xl border border-ink/12 bg-white px-3 py-2 text-xs font-semibold text-ink transition hover:border-pink/40"
                    >
                      <span>Pull from other slides ({pullable.length})</span>
                      <span className={cx("text-ink-soft transition-transform", showPull && "rotate-180")} aria-hidden="true">▾</span>
                    </button>
                    {showPull ? (
                      <div className="mt-2 grid grid-cols-4 gap-2 rounded-xl bg-blush-soft/50 p-2">
                        {pullable.map((src, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => studio.addImages(loc.id, [src])}
                            className="group relative overflow-hidden rounded-lg ring-1 ring-ink/10 transition hover:ring-2 hover:ring-pink"
                            aria-label="Add this photo to the slide"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt="" className="h-16 w-full object-cover" />
                            <span className="absolute inset-0 flex items-center justify-center bg-pink/0 text-lg font-bold text-white opacity-0 transition group-hover:bg-pink/45 group-hover:opacity-100">
                              ＋
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {images.length ? (
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((src, i) => (
                      <div key={i} className="group relative overflow-hidden rounded-lg ring-1 ring-ink/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" className="h-20 w-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/45 px-1 py-0.5">
                          <button
                            type="button"
                            aria-label="Move left"
                            disabled={i === 0}
                            onClick={() => studio.moveImage(loc.id, i, "left")}
                            className="px-1 text-xs text-white disabled:opacity-30"
                          >
                            ‹
                          </button>
                          <button
                            type="button"
                            aria-label="Remove photo"
                            onClick={() => studio.removeImage(loc.id, i)}
                            className="px-1 text-xs text-white"
                          >
                            ✕
                          </button>
                          <button
                            type="button"
                            aria-label="Move right"
                            disabled={i === images.length - 1}
                            onClick={() => studio.moveImage(loc.id, i, "right")}
                            className="px-1 text-xs text-white disabled:opacity-30"
                          >
                            ›
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-ink/15 px-3 py-4 text-center text-xs text-ink-soft">
                    No photos yet. Add one or more — they arrange into a collage.
                  </p>
                )}

                {/* Photo layout — only meaningful with 2+ photos */}
                {images.length > 1 ? (
                  <div className="mt-3">
                    <Segmented
                      label="Photo arrangement"
                      value={loc.photoLayout || "auto"}
                      options={[
                        { value: "auto", label: "Auto" },
                        { value: "grid", label: "Grid" },
                        { value: "row", label: "Row" },
                        { value: "column", label: "Stack" },
                      ]}
                      onChange={(v) => set({ photoLayout: v })}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Danger zone */}
            <div className="border-t border-line pt-4">
              <button
                type="button"
                onClick={() => {
                  studio.removeLocation(loc.id);
                  onClose();
                }}
                className="w-full rounded-full border border-heart/30 bg-white py-2.5 text-sm font-semibold text-heart transition hover:bg-heart hover:text-white"
              >
                Delete this slide
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Text({ label, value, onChange, placeholder, field, labelCls }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={field} />
    </div>
  );
}

function Area({ label, value, onChange, placeholder, field, labelCls }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} rows={3} placeholder={placeholder} className={`${field} resize-none`} />
    </div>
  );
}

function Segmented({ label, value, options, onChange }) {
  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold text-ink">{label}</span>
      <div className="flex rounded-full bg-blush-soft p-1">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cx(
              "flex-1 rounded-full px-2 py-1.5 text-xs font-semibold transition",
              value === o.value ? "bg-white text-pink-deep shadow-soft" : "text-ink-soft hover:text-ink"
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
