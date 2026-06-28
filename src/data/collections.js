// =============================================================================
// CURATED COLLECTIONS
// =============================================================================
// Each collection is a hand-picked list. A place belongs to a collection when
// its `collectionTags` array (in recommendations.js) contains the collection's
// `name`. Clicking a collection card filters the grid to its members.
//
// To add a NEW collection:
//   1. Add an entry here ({ name, title, subtitle, emoji }).
//   2. Add that exact `name` to the `collectionTags` of any matching places
//      in recommendations.js.
//
// `name` MUST match the string used in collectionTags exactly.
// =============================================================================

export const COLLECTIONS = [
  {
    name: "Upper West Side Favorites",
    title: "Upper West Side Favorites",
    subtitle: "The neighborhood go-tos.",
    emoji: "🏙️",
  },
  {
    name: "Free NYC Day",
    title: "Free NYC Day",
    subtitle: "Zero-dollar adventures.",
    emoji: "🎈",
  },
  {
    name: "Girls’ Day Shopping",
    title: "Girls’ Day Shopping",
    subtitle: "Boutiques, charms & finds.",
    emoji: "🛍️",
  },
  {
    name: "Date Night / Special Occasion",
    title: "Date Night",
    subtitle: "Worth getting dressed up for.",
    emoji: "💗",
  },
  {
    name: "Coffee + Sweet Treats",
    title: "Coffee + Sweet Treats",
    subtitle: "Caffeine and a little sugar.",
    emoji: "☕",
  },
  {
    name: "Culture Day",
    title: "Culture Day",
    subtitle: "Museums, theater & more.",
    emoji: "🎨",
  },
  {
    name: "Healthy Quick Stops",
    title: "Healthy Quick Stops",
    subtitle: "Bowls, smoothies & greens.",
    emoji: "🥗",
  },
  {
    name: "Budget-Friendly",
    title: "Budget-Friendly",
    subtitle: "Big flavor, small price.",
    emoji: "💸",
  },
  {
    name: "Best Sunset Spots",
    title: "Best Sunset Spots",
    subtitle: "Golden-hour magic.",
    emoji: "🌅",
  },
  {
    name: "Best Photo Spots",
    title: "Best Photo Spots",
    subtitle: "Made for the grid.",
    emoji: "📸",
  },
  {
    name: "Columbia / Morningside Heights Guide",
    title: "Columbia / Morningside Heights",
    subtitle: "Around campus.",
    emoji: "🎓",
  },
];

// NOTE: the dataset uses both "Date Night" and "Date Night / Special Occasion"
// as collection tags. We treat them as the same collection so nothing is lost.
const COLLECTION_ALIASES = {
  "Date Night / Special Occasion": ["Date Night / Special Occasion", "Date Night"],
};

// Does a recommendation belong to the given collection (by name)?
export function recInCollection(rec, collectionName) {
  const accepted = COLLECTION_ALIASES[collectionName] || [collectionName];
  return (rec.collectionTags || []).some((c) => accepted.includes(c));
}
