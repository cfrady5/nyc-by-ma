// =============================================================================
// BRAND LOGO LOCKUP — "MA ♥ NY"
// =============================================================================
// Recreates the brand mark: the "MA" monogram in an elegant script, a heart,
// and "NY" in a bold slab serif (a nod to the iconic I♥NY). It's pure text +
// CSS, so it's transparent, infinitely scalable, and recolorable.
//
//   variant="stacked"  → big hero lockup (MA ♥ on top, NY large below)
//   variant="inline"   → compact one-line lockup (header / footer)
//
//   tone="color"  → MA pink · heart red · NY ink   (default, full brand)
//   tone="ink"    → all near-black                  (subtle / monochrome)
//   tone="white"  → all white                       (for dark backdrops)
//
// To use your OWN exported logo image instead, see /src/components/Logo.js.
// =============================================================================

const TONES = {
  color: { ma: "text-pink", heart: "text-heart", ny: "text-ink" },
  ink: { ma: "text-ink", heart: "text-ink", ny: "text-ink" },
  white: { ma: "text-white", heart: "text-white", ny: "text-white" },
};

export default function BrandLogo({ variant = "inline", tone = "color", className = "" }) {
  const c = TONES[tone] || TONES.color;

  if (variant === "stacked") {
    return (
      <span
        className={`inline-flex flex-col items-center leading-none ${className}`}
        aria-label="NYC by MA"
        role="img"
      >
        <span className="flex items-end gap-2">
          <span className={`font-script ${c.ma} text-6xl sm:text-7xl`}>MA</span>
          <span className={`mb-1 text-4xl ${c.heart} sm:text-5xl`} aria-hidden="true">
            ♥
          </span>
        </span>
        <span className={`font-slab font-bold tracking-tight ${c.ny} text-7xl sm:text-8xl`}>
          NY
        </span>
      </span>
    );
  }

  // inline
  return (
    <span
      className={`inline-flex items-center gap-1.5 leading-none ${className}`}
      aria-label="NYC by MA"
      role="img"
    >
      <span className={`font-script ${c.ma} text-3xl sm:text-4xl`}>MA</span>
      <span className={`text-xl ${c.heart} sm:text-2xl`} aria-hidden="true">
        ♥
      </span>
      <span className={`font-slab font-bold tracking-tight ${c.ny} text-3xl sm:text-4xl`}>
        NY
      </span>
    </span>
  );
}
