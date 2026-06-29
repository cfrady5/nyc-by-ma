// =============================================================================
// CATEGORY METADATA
// =============================================================================
// Every recommendation has a `category`. This file maps each category to a
// color, emoji, and short label used for:
//   - the colored map pins
//   - the category badge on each card
//
// To add a NEW category: add an entry here keyed by the exact `category`
// string you use in recommendations.js. If a category is missing here, the UI
// falls back to a neutral pink style (see DEFAULT_CATEGORY below).
// =============================================================================

// Colors are tuned to the NYC by MA palette while staying distinct enough to
// read as different pins on the light map.
//
// `image` is a category-level stock cover used on every card in that category
// (until a place gets its own photo). Files live in /public/categories/.
// To add a category cover: drop /public/categories/<slug>.jpg and set `image`
// below. Leave `image` undefined to fall back to the branded placeholder
// (this avoids 404s for categories without a cover yet).
export const CATEGORY_META = {
  "Food & Drink": { emoji: "🍽️", color: "#D81B79", label: "Food & Drink", image: "/categories/food-drink.jpg" }, // rose
  Coffee: { emoji: "☕", color: "#8B5E3C", label: "Coffee", image: "/categories/coffee.jpg" }, // mocha
  Dessert: { emoji: "🍰", color: "#E0709F", label: "Dessert", image: "/categories/dessert.jpg" }, // pink
  Brunch: { emoji: "🥞", color: "#E0A100", label: "Brunch", image: "/categories/brunch.jpg" }, // amber/butter
  Healthy: { emoji: "🥗", color: "#5E9E6F", label: "Healthy", image: "/categories/healthy.jpg" }, // sage
  Shopping: { emoji: "🛍️", color: "#9B7BD4", label: "Shopping" }, // lavender — add /categories/shopping.jpg
  "Free Activity": { emoji: "🎈", color: "#2FA3A3", label: "Free Activity", image: "/categories/free-activity.jpg" }, // teal
  Culture: { emoji: "🎨", color: "#8E4B8B", label: "Culture", image: "/categories/culture.jpg" }, // plum
  "Theater & Music": { emoji: "🎭", color: "#E4002B", label: "Theater & Music", image: "/categories/theater-music.jpg" }, // red
  "Landmark / Experience": { emoji: "📍", color: "#BC9A56", label: "Landmark" }, // gold — add /categories/landmark.jpg
};

// Fallback used when a category isn't found in the map above.
export const DEFAULT_CATEGORY = { emoji: "✨", color: "#D81B79", label: "Recommendation" };

export function getCategoryMeta(category) {
  return CATEGORY_META[category] || DEFAULT_CATEGORY;
}

// Category-level cover image (or null if that category has no cover yet).
export function getCategoryImage(category) {
  const meta = CATEGORY_META[category];
  return meta && meta.image ? meta.image : null;
}
