# Brand assets

Drop your exported brand logo here to use it in the **header** and **footer**.

## Use your own "MA ♥ NY" logo

1. Export the logo as a **transparent** PNG or SVG (remove the solid
   background so only the artwork shows).
   - The site has a **light cream** background, so the logo artwork should be
     **dark / colored** to stay visible. A white-on-transparent logo would be
     invisible on cream.
2. Save it here as:

   ```
   /public/brand/logo.png      (or logo.svg)
   ```

3. Open `/src/components/Logo.js` and set:

   ```js
   const CUSTOM_LOGO = "/brand/logo.png";
   ```

That's it — the header and footer will use your image automatically. If the
file is ever missing, the UI falls back to the built-in CSS logo lockup, so
nothing breaks.

> Tip: a square or wide transparent logo around 480px tall exports cleanly and
> stays crisp on retina screens.
