"use client";

// =============================================================================
// LOGO — header / footer brand mark
// =============================================================================
// By default this renders the on-brand CSS lockup (<BrandLogo>), which is
// transparent and looks crisp at any size.
//
// TO USE YOUR OWN EXPORTED LOGO IMAGE (the "MA ♥ NY" file):
//   1. Export it as a TRANSPARENT PNG or SVG (background removed).
//      • On the light cream site, the artwork should be dark/colored so it's
//        visible. (A white-on-transparent logo would be invisible on cream —
//        use it only with tone-based dark variants or set a dark backdrop.)
//   2. Save it to:  /public/brand/logo.png   (or logo.svg)
//   3. Set CUSTOM_LOGO below to its path, e.g. "/brand/logo.png".
//
// If the file is missing or fails to load, it gracefully falls back to the
// CSS lockup so the UI never breaks.
// =============================================================================

import { useState } from "react";
import BrandLogo from "./BrandLogo";

// ▼▼▼ Set this to your transparent logo path to use the real asset ▼▼▼
const CUSTOM_LOGO = null; // e.g. "/brand/logo.png"
// ▲▲▲ ----------------------------------------------------------- ▲▲▲

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
        alt="NYC by MA"
        onError={() => setErrored(true)}
        className={imgClassName || "h-12 w-auto"}
      />
    );
  }

  return <BrandLogo variant={variant} tone={tone} className={className} />;
}
