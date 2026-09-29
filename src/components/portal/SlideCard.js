"use client";

import { forwardRef } from "react";
import QRCode from "./QRCode";

// -----------------------------------------------------------------------------
// SLIDE CARD — one themed Instagram-story slide (fixed 1080×1350 design canvas)
// -----------------------------------------------------------------------------
// Rendered at a FIXED pixel size so the on-screen preview and the exported PNG
// are pixel-identical. Callers scale it down with a CSS transform for preview.
// Every color and font comes from `theme`. Layout is arrangeable per slide:
//   - textPosition: "top" | "bottom"  (where the title/caption block sits)
//   - photoLayout:  "auto" | "grid" | "row" | "column"  (how photos are placed)
// Photos come from location.images[] (falls back to a legacy single image).
// -----------------------------------------------------------------------------

export const SLIDE_W = 1080;
export const SLIDE_H = 1350;

// A soft watercolor-style wash built from the theme colors (no image assets).
function textureBackground(theme) {
  if (!theme.texture) return theme.bg;
  return [
    `radial-gradient(60% 55% at 18% 12%, ${hexA(theme.accent, 0.14)}, transparent 60%)`,
    `radial-gradient(65% 60% at 88% 8%, ${hexA("#ffffff", 0.22)}, transparent 55%)`,
    `radial-gradient(80% 70% at 80% 100%, ${hexA(theme.accent, 0.1)}, transparent 60%)`,
    `radial-gradient(90% 80% at 0% 100%, ${hexA("#000000", 0.06)}, transparent 60%)`,
    theme.bg,
  ].join(", ");
}

// hex (#rrggbb) + alpha → rgba() string. Falls back gracefully.
function hexA(hex, a) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

// Read the photo list (supports the legacy single `image` field).
export function slideImages(loc) {
  if (loc?.images?.length) return loc.images.filter(Boolean);
  if (loc?.image) return [loc.image];
  return [];
}

const Sparkle = ({ color, size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 0c.6 5.4 2.4 8.1 6.9 9.2C14.4 10.3 12.6 13 12 18c-.6-5-2.4-7.7-6.9-8.8C9.6 8.1 11.4 5.4 12 0Z"
      fill={color}
    />
    <path d="M20 12c.3 2.4 1.2 3.6 3.4 4.1-2.2.5-3.1 1.7-3.4 4-.3-2.3-1.2-3.5-3.4-4 2.2-.5 3.1-1.7 3.4-4.1Z" fill={color} opacity="0.8" />
  </svg>
);

// Grid template for the photo collage based on count + chosen layout.
function gridTemplate(count, layout) {
  if (layout === "row") return { gridTemplateColumns: `repeat(${count}, 1fr)`, spanFirst: false };
  if (layout === "column") return { gridTemplateRows: `repeat(${count}, 1fr)`, spanFirst: false };
  if (layout === "grid") return { gridTemplateColumns: "1fr 1fr", spanFirst: false };
  // auto
  if (count <= 1) return { spanFirst: false };
  if (count === 2) return { gridTemplateRows: "1fr 1fr", spanFirst: false };
  if (count === 3) return { gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1.3fr 1fr", spanFirst: true };
  return { gridTemplateColumns: "1fr 1fr", spanFirst: false }; // 4+
}

// Convert a photoScale (0.8–1.3, 1 = default) into a "bleed" — how far the photo
// block extends toward the slide edges to eat up negative space. `protect` names
// the side next to text so we never overlap it.
export function photoBleed(scale = 1, protect = "none") {
  const b = Math.max(-46, Math.min(56, Math.round(((scale || 1) - 1) * 190)));
  const m = -b;
  const s = { marginTop: m, marginBottom: m, marginLeft: m, marginRight: m };
  if (protect === "top") s.marginTop = 0;
  else if (protect === "bottom") s.marginBottom = 0;
  else if (protect === "left") s.marginLeft = 0;
  else if (protect === "right") s.marginRight = 0;
  return { style: s, gap: Math.max(3, 8 - Math.round(b / 6)) };
}

function PhotoArea({ theme, images, layout, scale = 1, protect = "none" }) {
  const t = theme;
  const bleed = photoBleed(scale, protect);
  const frame = {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    border: `6px solid ${hexA(t.accent, 0.55)}`,
    boxShadow: `0 30px 60px ${hexA("#000000", 0.22)}`,
    overflow: "hidden",
    background: hexA("#000000", 0.05),
    ...bleed.style,
  };

  if (images.length === 0) {
    return (
      <div style={{ ...frame, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", opacity: 0.7, fontFamily: t.bodyFont }}>
          <div style={{ fontSize: 90 }}>📷</div>
          <div style={{ fontSize: 34, marginTop: 8 }}>Add a photo</div>
        </div>
      </div>
    );
  }

  const { spanFirst, ...tmpl } = gridTemplate(images.length, layout);

  if (images.length === 1) {
    return (
      <div style={frame}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    );
  }

  return (
    <div style={frame}>
      <div style={{ display: "grid", gap: bleed.gap, width: "100%", height: "100%", ...tmpl }}>
        {images.map((src, i) => (
          <div
            key={i}
            style={{
              overflow: "hidden",
              borderRadius: 6,
              gridColumn: spanFirst && i === 0 ? "1 / -1" : undefined,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function TextBlock({ theme, loc }) {
  const t = theme;
  return (
    <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
      <div style={{ flex: "1 1 55%", minWidth: 0 }}>
        <h1
          style={{
            fontFamily: t.titleFont,
            fontWeight: 800,
            fontSize: 66,
            lineHeight: 1.02,
            letterSpacing: "-0.5px",
            margin: 0,
          }}
        >
          {loc.name || "New location"}
        </h1>
        {loc.neighborhood ? (
          <p style={{ fontFamily: t.titleFont, fontWeight: 800, fontSize: 40, lineHeight: 1.05, margin: "10px 0 0" }}>
            {loc.neighborhood}
          </p>
        ) : null}
      </div>

      <div style={{ flex: "1 1 45%", minWidth: 0, display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{ flexShrink: 0, marginTop: 4 }}>
          <Sparkle color={t.accent} size={64} />
        </div>
        {loc.caption ? (
          <p style={{ fontFamily: t.bodyFont, fontSize: 36, lineHeight: 1.28, margin: 0 }}>{loc.caption}</p>
        ) : null}
      </div>
    </div>
  );
}

// Instagram handle → full URL (accepts "@name", "name", or a full URL).
export function instagramUrl(handle) {
  const h = (handle || "").trim();
  if (!h) return "https://www.instagram.com/NYC_BY_MA/";
  if (/^https?:\/\//i.test(h)) return h;
  return `https://www.instagram.com/${h.replace(/^@/, "")}/`;
}

// ---- COVER SLIDE ------------------------------------------------------------
// Cover collage templates offered in the editor (key + friendly label + the
// number of photo slots each one is designed around).
export const COVER_TEMPLATES = [
  { key: "classic", label: "Classic", slots: 3 },
  { key: "moodboard", label: "Moodboard 3×3", slots: 8 },
  { key: "polaroid", label: "Polaroid scatter", slots: 8 },
  { key: "filmstrip", label: "Big title + strip", slots: 4 },
  { key: "sidebar", label: "Title + collage", slots: 4 },
];

// A single photo cell; empty slots render a soft accent-tinted block so the
// collage keeps its shape even before every spot is filled.
function PhotoCell({ src, theme, radius = 8, style }) {
  return (
    <div style={{ overflow: "hidden", borderRadius: radius, background: hexA(theme.accent, 0.12), ...style }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      ) : null}
    </div>
  );
}

// Shared cover title block. `align` and sizes let each template place it.
function CoverTitle({ theme, loc, align = "center", titleSize = 110, eyebrowSize = 34, subSize = 40, sparkle = true }) {
  const t = theme;
  return (
    <div style={{ textAlign: align }}>
      <p
        style={{
          fontFamily: t.bodyFont,
          fontSize: eyebrowSize,
          letterSpacing: "6px",
          textTransform: "uppercase",
          margin: 0,
          opacity: 0.85,
        }}
      >
        {loc.eyebrow || "NYC by MA"}
      </p>
      {sparkle ? (
        <div style={{ display: "flex", justifyContent: align === "left" ? "flex-start" : "center", margin: "14px 0 4px" }}>
          <Sparkle color={t.accent} size={56} />
        </div>
      ) : null}
      <h1
        style={{
          fontFamily: t.titleFont,
          fontWeight: 800,
          fontSize: titleSize,
          lineHeight: 1.0,
          letterSpacing: "-1px",
          margin: "6px 0 0",
        }}
      >
        {loc.name || "Your title"}
      </h1>
      {loc.caption ? (
        <p
          style={{
            fontFamily: t.bodyFont,
            fontSize: subSize,
            lineHeight: 1.3,
            margin: align === "left" ? "20px 0 0" : "20px auto 0",
            maxWidth: 780,
          }}
        >
          {loc.caption}
        </p>
      ) : null}
    </div>
  );
}

// Scatter positions for the polaroid template: [left%, top%, rotateDeg].
const POLAROID_SLOTS = [
  [2, 3, -8],
  [37, 1, 5],
  [70, 5, 9],
  [1, 35, -5],
  [72, 37, 7],
  [6, 66, 7],
  [40, 70, -5],
  [70, 66, 9],
];

function CoverSlide({ theme, loc }) {
  const t = theme;
  const images = slideImages(loc);
  const template = loc.coverTemplate || "classic";

  // ---- Moodboard 3×3 (center cell = title) ----
  if (template === "moodboard") {
    let p = 0;
    const mb = photoBleed(loc.photoScale, "none");
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "1fr 1fr 1fr", gap: mb.gap + 4, width: "100%", height: "100%", ...mb.style }}>
        {Array.from({ length: 9 }).map((_, i) => {
          if (i === 4) {
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: 16,
                  border: `2px solid ${hexA(t.accent, 0.5)}`,
                  borderRadius: 8,
                }}
              >
                <p style={{ fontFamily: t.bodyFont, fontSize: 20, letterSpacing: "3px", textTransform: "uppercase", margin: 0, opacity: 0.8 }}>
                  {loc.eyebrow || "NYC by MA"}
                </p>
                <h1 style={{ fontFamily: t.titleFont, fontWeight: 800, fontSize: 46, lineHeight: 1.02, letterSpacing: "-0.5px", margin: "8px 0 0" }}>
                  {loc.name || "Your title"}
                </h1>
                {loc.caption ? (
                  <p style={{ fontFamily: t.bodyFont, fontSize: 20, lineHeight: 1.25, margin: "8px 0 0" }}>{loc.caption}</p>
                ) : null}
              </div>
            );
          }
          const src = images[p++];
          return <PhotoCell key={i} src={src} theme={t} />;
        })}
      </div>
    );
  }

  // ---- Polaroid scatter ----
  if (template === "polaroid") {
    const ps = Math.max(0.8, Math.min(1.3, loc.photoScale || 1));
    return (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {POLAROID_SLOTS.map(([left, top, rot], i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${left}%`,
              top: `${top}%`,
              width: `${27 * ps}%`,
              transform: `rotate(${rot}deg)`,
              background: "#fff",
              padding: "10px 10px 34px",
              borderRadius: 4,
              boxShadow: `0 18px 34px ${hexA("#000000", 0.28)}`,
            }}
          >
            <PhotoCell src={images[i]} theme={t} radius={2} style={{ height: 220 * ps, background: hexA("#000000", 0.06) }} />
          </div>
        ))}
        {/* Title card on top */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%) rotate(-2deg)",
            width: "56%",
            background: "#fff",
            padding: "26px 24px 30px",
            borderRadius: 6,
            boxShadow: `0 26px 50px ${hexA("#000000", 0.34)}`,
            textAlign: "center",
            color: "#241F21",
          }}
        >
          <p style={{ fontFamily: t.bodyFont, fontSize: 22, letterSpacing: "3px", textTransform: "uppercase", margin: 0, opacity: 0.7 }}>
            {loc.eyebrow || "NYC by MA"}
          </p>
          <h1 style={{ fontFamily: t.titleFont, fontWeight: 800, fontSize: 60, lineHeight: 1.0, margin: "8px 0 0" }}>
            {loc.name || "Your title"}
          </h1>
          {loc.caption ? <p style={{ fontFamily: t.bodyFont, fontSize: 24, margin: "10px 0 0" }}>{loc.caption}</p> : null}
        </div>
      </div>
    );
  }

  // ---- Big title + bottom film strip ----
  if (template === "filmstrip") {
    const strip = images.slice(0, 5);
    const fb = photoBleed(loc.photoScale, "top");
    const stripH = Math.max(28, Math.min(52, Math.round(34 + ((loc.photoScale || 1) - 1) * 60)));
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <CoverTitle theme={t} loc={loc} align="left" titleSize={132} subSize={40} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(strip.length, 1)}, 1fr)`, gap: fb.gap + 2, height: `${stripH}%`, ...fb.style }}>
          {(strip.length ? strip : [undefined, undefined, undefined]).map((src, i) => (
            <PhotoCell key={i} src={src} theme={t} radius={10} />
          ))}
        </div>
      </div>
    );
  }

  // ---- Title + collage sidebar ----
  if (template === "sidebar") {
    return (
      <div style={{ display: "flex", height: "100%", gap: 28 }}>
        <div style={{ flex: "1 1 44%", display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0 }}>
          <CoverTitle theme={t} loc={loc} align="left" titleSize={96} subSize={36} />
        </div>
        <div style={{ flex: "1 1 56%", minWidth: 0, display: "flex" }}>
          <PhotoArea theme={t} images={images} layout={loc.photoLayout || "auto"} scale={loc.photoScale} protect="left" />
        </div>
      </div>
    );
  }

  // ---- Classic (centered title + optional collage) ----
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 40 }}>
      <CoverTitle theme={t} loc={loc} align="center" titleSize={118} />
      {images.length ? (
        <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
          <PhotoArea theme={t} images={images} layout={loc.photoLayout || "auto"} scale={loc.photoScale} protect="top" />
        </div>
      ) : (
        <div style={{ flex: 1 }} />
      )}
    </div>
  );
}

// ---- END SLIDE (follow us + QR) --------------------------------------------
function EndSlide({ theme, loc }) {
  const t = theme;
  const url = instagramUrl(loc.handle);
  const handleText = loc.handle
    ? loc.handle.startsWith("@") || /^https?:/i.test(loc.handle)
      ? loc.handle.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "@").replace(/\/$/, "")
      : `@${loc.handle}`
    : "@NYC_BY_MA";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 30 }}>
      <Sparkle color={t.accent} size={80} />
      <h1 style={{ fontFamily: t.titleFont, fontWeight: 800, fontSize: 96, lineHeight: 1.02, margin: 0 }}>
        {loc.name || "Follow along"}
      </h1>
      {loc.caption ? (
        <p style={{ fontFamily: t.bodyFont, fontSize: 40, lineHeight: 1.3, margin: 0, maxWidth: 760 }}>{loc.caption}</p>
      ) : null}

      {/* QR card */}
      <div
        style={{
          marginTop: 8,
          padding: 28,
          borderRadius: 28,
          background: "#ffffff",
          boxShadow: `0 30px 60px ${hexA("#000000", 0.22)}`,
          border: `6px solid ${hexA(t.accent, 0.55)}`,
        }}
      >
        <QRCode value={url} size={360} fg="#1b1205" bg="#ffffff" />
      </div>

      <p style={{ fontFamily: t.titleFont, fontWeight: 800, fontSize: 56, margin: "8px 0 0", color: t.accent }}>
        {handleText}
      </p>
      <p style={{ fontFamily: t.bodyFont, fontSize: 30, opacity: 0.8, margin: 0 }}>Scan to follow on Instagram</p>
    </div>
  );
}

// ---- LOCATION SLIDE (default) ----------------------------------------------
function LocationSlide({ theme, loc }) {
  const t = theme;
  const images = slideImages(loc);
  const textPosition = loc.textPosition === "bottom" ? "bottom" : "top";
  const text = <TextBlock theme={t} loc={loc} />;
  const photos = (
    <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
      <PhotoArea
        theme={t}
        images={images}
        layout={loc.photoLayout || "auto"}
        scale={loc.photoScale}
        protect={textPosition === "top" ? "top" : "bottom"}
      />
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 40 }}>
      {textPosition === "top" ? (
        <>
          {text}
          {photos}
        </>
      ) : (
        <>
          {photos}
          {text}
        </>
      )}
    </div>
  );
}

const SlideCard = forwardRef(function SlideCard({ theme, location, index, total }, ref) {
  const t = theme;
  const loc = location || {};
  const type = loc.type || "location";

  return (
    <div
      ref={ref}
      style={{
        width: SLIDE_W,
        height: SLIDE_H,
        background: textureBackground(t),
        color: t.text,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        padding: 60,
        boxSizing: "border-box",
      }}
    >
      <div style={{ flex: 1, minHeight: 0 }}>
        {type === "cover" ? (
          <CoverSlide theme={t} loc={loc} />
        ) : type === "end" ? (
          <EndSlide theme={t} loc={loc} />
        ) : (
          <LocationSlide theme={t} loc={loc} />
        )}
      </div>

      {total > 1 ? (
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 34 }}>
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              style={{
                width: i === index ? 30 : 12,
                height: 12,
                borderRadius: 999,
                background: i === index ? t.accent : hexA(t.text, 0.25),
                display: "inline-block",
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
});

export default SlideCard;
