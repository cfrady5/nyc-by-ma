"use client";

import { forwardRef } from "react";

// -----------------------------------------------------------------------------
// SLIDE CARD — one themed Instagram-story slide (fixed 1080×1350 design canvas)
// -----------------------------------------------------------------------------
// Rendered at a FIXED pixel size so the on-screen preview and the exported PNG
// are pixel-identical. Callers scale it down with a CSS transform for preview.
// Every color and font comes from `theme`, so the whole slide restyles at once.
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

const Sparkle = ({ color, size = 66 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 0c.6 5.4 2.4 8.1 6.9 9.2C14.4 10.3 12.6 13 12 18c-.6-5-2.4-7.7-6.9-8.8C9.6 8.1 11.4 5.4 12 0Z"
      fill={color}
    />
    <path d="M20 12c.3 2.4 1.2 3.6 3.4 4.1-2.2.5-3.1 1.7-3.4 4-.3-2.3-1.2-3.5-3.4-4 2.2-.5 3.1-1.7 3.4-4.1Z" fill={color} opacity="0.8" />
  </svg>
);

const SlideCard = forwardRef(function SlideCard({ theme, location, index, total }, ref) {
  const t = theme;
  const loc = location || {};

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
      {/* Header: title/neighborhood on the left, sparkle + caption on the right */}
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
            <p
              style={{
                fontFamily: t.titleFont,
                fontWeight: 800,
                fontSize: 40,
                lineHeight: 1.05,
                margin: "10px 0 0",
              }}
            >
              {loc.neighborhood}
            </p>
          ) : null}
        </div>

        <div style={{ flex: "1 1 45%", minWidth: 0, display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ flexShrink: 0, marginTop: 4 }}>
            <Sparkle color={t.accent} size={64} />
          </div>
          {loc.caption ? (
            <p
              style={{
                fontFamily: t.bodyFont,
                fontSize: 36,
                lineHeight: 1.28,
                margin: 0,
              }}
            >
              {loc.caption}
            </p>
          ) : null}
        </div>
      </div>

      {/* Photo frame */}
      <div
        style={{
          flex: 1,
          marginTop: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 0,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 12,
            border: `6px solid ${hexA(t.accent, 0.55)}`,
            boxShadow: `0 30px 60px ${hexA("#000000", 0.22)}`,
            overflow: "hidden",
            background: hexA("#000000", 0.05),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {loc.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={loc.image}
              alt={loc.name || "slide photo"}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            <div style={{ textAlign: "center", opacity: 0.7, fontFamily: t.bodyFont }}>
              <div style={{ fontSize: 90 }}>📷</div>
              <div style={{ fontSize: 34, marginTop: 8 }}>Add a photo</div>
            </div>
          )}
        </div>
      </div>

      {/* Footer index dots */}
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
                transition: "all .2s",
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
});

export default SlideCard;
