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
export const CATEGORY_META = {
  "Food & Drink": { emoji: "🍽️", color: "#D81B79", label: "Food & Drink" }, // rose
  Coffee: { emoji: "☕", color: "#8B5E3C", label: "Coffee" }, // mocha
  Dessert: { emoji: "🍰", color: "#E0709F", label: "Dessert" }, // pink
  Brunch: { emoji: "🥞", color: "#E0A100", label: "Brunch" }, // amber/butter
  Healthy: { emoji: "🥗", color: "#5E9E6F", label: "Healthy" }, // sage
  Shopping: { emoji: "🛍️", color: "#9B7BD4", label: "Shopping" }, // lavender
  "Free Activity": { emoji: "🎈", color: "#2FA3A3", label: "Free Activity" }, // teal
  Culture: { emoji: "🎨", color: "#8E4B8B", label: "Culture" }, // plum
  "Theater & Music": { emoji: "🎭", color: "#E4002B", label: "Theater & Music" }, // red
  "Landmark / Experience": { emoji: "📍", color: "#BC9A56", label: "Landmark" }, // gold
};

// Fallback used when a category isn't found in the map above.
export const DEFAULT_CATEGORY = { emoji: "✨", color: "#D81B79", label: "Recommendation" };

export function getCategoryMeta(category) {
  return CATEGORY_META[category] || DEFAULT_CATEGORY;
}
