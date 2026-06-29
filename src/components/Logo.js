"use client";

// =============================================================================
// LOGO — header / footer brand mark
// =============================================================================
// Renders the brand "MA ♥ NY" logo. By default it uses the processed,
// TRANSPARENT, colorized image at /public/brand/logo.png (pink MA · red heart ·
// ink NY) — generated from the uploaded artwork.
//
// TO SWAP IN A DIFFERENT LOGO IMAGE:
//   1. Save a TRANSPARENT PNG/SVG to /public/brand/ (dark/colored artwork so
//      it's visible on the light cream background).
//   2. Update CUSTOM_LOGO below to its path.
//   • For dark backgrounds, /public/brand/logo-white.png is also available.
//
// If the image is missing or fails to load, it gracefully falls back to the
// CSS lockup (<BrandLogo>) so the UI never breaks.
// =============================================================================

import { useState } from "react";
import BrandLogo from "./BrandLogo";

// ▼▼▼ Path to the transparent logo asset (set to null to use the CSS lockup) ▼▼▼
const CUSTOM_LOGO = "/brand/logo.png";
// ▲▲▲ ------------------------------------------------------------------- ▲▲▲

export default function Logo({
  variant = "inline",
  tone = "color",
  className = "",
  imgClassName = "",
}) {
  const [errored, setErrored] = useState(false);

  if (CUSTOM_LOGO && !errored) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={CUSTOM_LOGO}
        alt="NYC by MA logo"
        onError={() => setErrored(true)}
        className={imgClassName || "h-12 w-auto"}
      />
    );
  }

  return <BrandLogo variant={variant} tone={tone} className={className} />;
}
