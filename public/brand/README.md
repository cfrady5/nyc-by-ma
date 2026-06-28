# Brand assets

The "MA ♥ NY" logo used in the **header** and **footer**.

## Files

- `download.webp` — the original uploaded artwork (white on solid black).
- `logo.png` — **the one the site uses.** Transparent + colorized to the brand
  board (pink **MA** · red **heart** · ink **NY**), auto-cropped. Generated
  from `download.webp`.
- `logo-white.png` — white artwork on transparent, for **dark** backgrounds.
- `logo-ink.png` — solid near-black artwork on transparent (monochrome option).

Which file the site uses is set in **`/src/components/Logo.js`** via
`CUSTOM_LOGO` (currently `"/brand/logo.png"`).

## Swapping in a different logo

1. Export a **transparent** PNG/SVG (dark/colored artwork so it stays visible
   on the light cream background — a white-on-transparent logo would vanish).
2. Save it here, e.g. `/public/brand/logo.png`.
3. Point `CUSTOM_LOGO` in `/src/components/Logo.js` at it.

If the file is ever missing, the UI falls back to the built-in CSS logo lockup,
so nothing breaks.

> Tip: a transparent logo around 480–1200px tall exports cleanly and stays
> crisp on retina screens.
