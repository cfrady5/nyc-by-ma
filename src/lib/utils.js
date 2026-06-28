// =============================================================================
// SHARED HELPERS
// =============================================================================

// Build a Google Maps search URL for a recommendation.
// Used by every "Open in Maps" button (and as the fallback for "Visit Now").
export function getGoogleMapsUrl(rec) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${rec.name} ${rec.address || rec.neighborhood + " NYC"}`
  )}`;
}

// Where the "Visit Now" button sends the user:
//   - the official website if we have one
//   - otherwise a Google Maps search so the button is never a dead end
export function getVisitUrl(rec) {
  return rec.website || getGoogleMapsUrl(rec);
}

// Search across every meaningful field. Returns true if the query matches.
export function matchesQuery(rec, rawQuery) {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return true;

  const haystack = [
    rec.name,
    rec.neighborhood,
    rec.borough,
    rec.category,
    rec.subcategory,
    rec.recommendation,
    rec.address,
    ...(rec.tags || []),
    ...(rec.collectionTags || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  // Match on every whitespace-separated term (so "uws coffee" narrows results).
  return q.split(/\s+/).every((term) => haystack.includes(term));
}

// Tiny className combiner so we can conditionally compose Tailwind classes.
export function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}
