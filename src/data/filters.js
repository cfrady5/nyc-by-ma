// =============================================================================
// FILTER PILLS
// =============================================================================
// The sticky pill bar. Each filter has a `label` (shown on the pill) and a
// `test(rec)` predicate that returns true when a recommendation matches.
//
// "All" is special-cased in the UI (it matches everything), so it's not in
// this list. To add a new filter pill, just add an object with a label and a
// test function.
// =============================================================================

// Small helper: does any of the rec's text fields loosely include `needle`?
const hasTag = (rec, needle) =>
  (rec.tags || []).some((t) => t.toLowerCase().includes(needle.toLowerCase()));

const inNeighborhood = (rec, needle) =>
  (rec.neighborhood || "").toLowerCase().includes(needle.toLowerCase());

export const FILTERS = [
  // ---- Categories ----------------------------------------------------------
  { label: "Food & Drink", group: "category", test: (r) => r.category === "Food & Drink" },
  { label: "Coffee", group: "category", test: (r) => r.category === "Coffee" },
  { label: "Dessert", group: "category", test: (r) => r.category === "Dessert" },
  { label: "Brunch", group: "category", test: (r) => r.category === "Brunch" },
  { label: "Healthy", group: "category", test: (r) => r.category === "Healthy" },
  { label: "Shopping", group: "category", test: (r) => r.category === "Shopping" },
  { label: "Free Activities", group: "category", test: (r) => r.category === "Free Activity" },
  { label: "Culture", group: "category", test: (r) => r.category === "Culture" },
  { label: "Theater & Music", group: "category", test: (r) => r.category === "Theater & Music" },

  // ---- Vibe / occasion -----------------------------------------------------
  {
    label: "Date Night",
    group: "vibe",
    test: (r) =>
      (r.collectionTags || []).some((c) => c.toLowerCase().includes("date night")) ||
      hasTag(r, "date night"),
  },
  {
    label: "Budget-Friendly",
    group: "vibe",
    test: (r) =>
      (r.collectionTags || []).includes("Budget-Friendly") ||
      hasTag(r, "budget") ||
      (typeof r.price === "string" && /budget|\$0|\$12|\$\s?1?\d\b/i.test(r.price)),
  },

  // ---- Neighborhoods -------------------------------------------------------
  { label: "UWS", group: "neighborhood", test: (r) => inNeighborhood(r, "Upper West") || hasTag(r, "UWS") },
  { label: "UES", group: "neighborhood", test: (r) => inNeighborhood(r, "Upper East") || hasTag(r, "UES") },
  {
    label: "West Village",
    group: "neighborhood",
    test: (r) => inNeighborhood(r, "West Village") || hasTag(r, "West Village"),
  },
  { label: "Soho", group: "neighborhood", test: (r) => inNeighborhood(r, "Soho") || hasTag(r, "Soho") },
  { label: "Midtown", group: "neighborhood", test: (r) => inNeighborhood(r, "Midtown") || hasTag(r, "Midtown") },
  {
    label: "Central Park",
    group: "neighborhood",
    test: (r) => inNeighborhood(r, "Central Park") || hasTag(r, "Central Park"),
  },
];

// Look up a filter object by its label.
export function getFilter(label) {
  return FILTERS.find((f) => f.label === label) || null;
}
