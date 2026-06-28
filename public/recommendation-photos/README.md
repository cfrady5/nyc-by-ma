# Recommendation Photos

Drop place photos here.

## How to add a photo

1. Save the image in **this** folder (`/public/recommendation-photos/`).
2. Name it to match the place's `id` in `/src/data/recommendations.js`
   (e.g. the place with `id: "willets-corner"` → `willets-corner.jpg`).
3. Make sure the recommendation's `image` field points to it:

   ```js
   image: "/recommendation-photos/willets-corner.jpg"
   ```

That's it. The photo will show on the card and nowhere else needs changing.

## Recommended specs

- **Format:** `.jpg` or `.webp` (`.png` also fine)
- **Aspect ratio:** roughly 4:3 or 3:2 (cards crop to a landscape area)
- **Size:** ~1200px wide is plenty; keep files under ~400KB for fast loads

## Missing a photo?

No problem — if a file is missing or fails to load, the card automatically
shows a branded **"Photo coming soon"** placeholder. Nothing breaks.
