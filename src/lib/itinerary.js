// =============================================================================
// BUILD YOUR DAY — itinerary helpers (client-safe, no API keys here)
// =============================================================================

// Default minutes to spend at a stop, by category. Used when a rec has no
// explicit estimatedTimeMinutes. Editable per-stop in the UI.
export const CATEGORY_DURATIONS = {
  Coffee: 30,
  Dessert: 30,
  "Food & Drink": 75,
  Brunch: 90,
  Shopping: 75,
  Healthy: 60,
  Culture: 105,
  "Theater & Music": 150,
  "Landmark / Experience": 60,
  "Free Activity": 60,
};

export function defaultDurationFor(rec) {
  if (Number.isFinite(rec?.estimatedTimeMinutes)) return rec.estimatedTimeMinutes;
  return CATEGORY_DURATIONS[rec?.category] ?? 60;
}

// "Vibes" map to the categories / collection tags they pull from.
export const VIBES = [
  { id: "food", label: "Food day", emoji: "🍝", categories: ["Food & Drink", "Brunch"] },
  { id: "shopping", label: "Shopping day", emoji: "🛍️", categories: ["Shopping"] },
  { id: "coffee-dessert", label: "Coffee + dessert", emoji: "🍰", categories: ["Coffee", "Dessert"] },
  { id: "date-night", label: "Date night", emoji: "💗", collections: ["Date Night / Special Occasion", "Date Night"] },
  { id: "culture", label: "Culture day", emoji: "🎨", categories: ["Culture", "Theater & Music", "Landmark / Experience"] },
  { id: "free", label: "Free activities", emoji: "🎈", categories: ["Free Activity"] },
  { id: "first-time", label: "First-time NYC", emoji: "🗽", categories: ["Landmark / Experience", "Culture", "Free Activity"] },
  { id: "custom", label: "Custom", emoji: "✨", categories: null },
];

// Haversine great-circle distance in miles.
export function haversineMiles(a, b) {
  if (!a || !b || !Number.isFinite(a.lat) || !Number.isFinite(b.lat)) return null;
  const R = 3958.8; // earth radius, miles
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Conservative travel-time estimate (minutes) when no transit API is available:
// short hops are walked (~3mph); longer hops approximate subway (~12mph door to
// door incl. waiting/walking) with a small fixed overhead.
export function estimateTravelMinutes(miles) {
  if (miles == null) return null;
  if (miles < 0.4) return Math.max(3, Math.round((miles / 3) * 60)); // walk
  return Math.round(8 + (miles / 12) * 60); // subway-ish
}

// Nearest-neighbour route optimization from lat/lng (fallback when there's no
// routing API). Returns a NEW ordered array of the input stops.
export function optimizeOrder(stops) {
  const routable = stops.filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng));
  const rest = stops.filter((s) => !(Number.isFinite(s.lat) && Number.isFinite(s.lng)));
  if (routable.length <= 2) return [...routable, ...rest];

  const remaining = [...routable];
  const ordered = [remaining.shift()]; // keep first stop as the start
  while (remaining.length) {
    const last = ordered[ordered.length - 1];
    let bestIdx = 0;
    let bestDist = Infinity;
    remaining.forEach((s, i) => {
      const d = haversineMiles(last, s) ?? Infinity;
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    });
    ordered.push(remaining.splice(bestIdx, 1)[0]);
  }
  return [...ordered, ...rest]; // un-routable stops appended at the end
}

// Fetch a transit route between two stops from our serverless endpoint.
// Always resolves (never throws) — returns { ok, fallback, ...routeData }.
export async function fetchTransitRoute(origin, destination) {
  const straightMiles = haversineMiles(origin, destination);
  const fallback = {
    ok: true,
    fallback: true,
    distanceText: straightMiles != null ? `${straightMiles.toFixed(1)} mi` : "—",
    distanceMiles: straightMiles,
    durationMinutes: estimateTravelMinutes(straightMiles),
    durationText:
      estimateTravelMinutes(straightMiles) != null
        ? `${estimateTravelMinutes(straightMiles)} min`
        : "—",
    routeSummary: "Route details require transit API setup.",
    steps: [],
  };

  try {
    const res = await fetch("/api/transit-route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin, destination, mode: "transit", transitPreference: "subway" }),
    });
    if (!res.ok) return fallback;
    const data = await res.json();
    if (data?.fallback) return { ...fallback, ...data, fallback: true };
    return { ok: true, fallback: false, ...data };
  } catch {
    return fallback;
  }
}

export function minutesToText(min) {
  if (min == null) return "—";
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h && m) return `${h} hr ${m} min`;
  if (h) return `${h} hr`;
  return `${m} min`;
}

// ---------------------------------------------------------------------------
// EXPORT helpers (all client-side, no API keys)
// ---------------------------------------------------------------------------

const ll = (s) => `${s.lat},${s.lng}`;
const hasLL = (s) => s && Number.isFinite(s.lat) && Number.isFinite(s.lng);

// Google Maps allows ~9 waypoints between origin & destination on the free URL
// scheme, i.e. up to ~11 total stops per link. Beyond that we split into links.
export const GOOGLE_MAX_STOPS = 11;

// Build one or more Google Maps directions URLs (transit) for the ordered stops.
// Returns { links: [{label,url}], split: bool }.
export function buildGoogleMapsLinks(stops) {
  const pts = stops.filter(hasLL);
  if (pts.length < 2) return { links: [], split: false };

  const makeUrl = (chunk) => {
    const origin = ll(chunk[0]);
    const destination = ll(chunk[chunk.length - 1]);
    const mid = chunk.slice(1, -1).map(ll).join("|");
    const u = new URL("https://www.google.com/maps/dir/");
    u.searchParams.set("api", "1");
    u.searchParams.set("origin", origin);
    u.searchParams.set("destination", destination);
    if (mid) u.searchParams.set("waypoints", mid);
    u.searchParams.set("travelmode", "transit");
    return u.toString();
  };

  if (pts.length <= GOOGLE_MAX_STOPS) {
    return { links: [{ label: "Open in Google Maps", url: makeUrl(pts) }], split: false };
  }
  // Split into overlapping chunks so each leg connects to the next.
  const links = [];
  for (let i = 0; i < pts.length - 1; i += GOOGLE_MAX_STOPS - 1) {
    const chunk = pts.slice(i, i + GOOGLE_MAX_STOPS);
    if (chunk.length >= 2) links.push({ label: `Part ${links.length + 1}`, url: makeUrl(chunk) });
  }
  return { links, split: true };
}

// Apple Maps: a single point-to-point link, plus per-leg links (more reliable
// for multi-stop on Apple). dirflg=r → transit.
export function buildAppleMapsLinks(stops) {
  const pts = stops.filter(hasLL);
  if (pts.length < 2) return { single: null, legs: [] };
  const url = (a, b) =>
    `https://maps.apple.com/?saddr=${ll(a)}&daddr=${ll(b)}&dirflg=r`;
  const single = url(pts[0], pts[pts.length - 1]);
  const legs = [];
  for (let i = 0; i < pts.length - 1; i++) {
    legs.push({ label: `${pts[i].name} → ${pts[i + 1].name}`, url: url(pts[i], pts[i + 1]) });
  }
  return { single, legs };
}

// Plain-text itinerary (works with or without the transit API).
export function buildItineraryText(stops, segments = {}) {
  const lines = ["My NYC by MA day", ""];
  let activity = 0;
  let travel = 0;
  stops.forEach((s, i) => {
    activity += s.minutes || 0;
    lines.push(`${i + 1}. ${s.name} — ${s.category}`);
    lines.push(`   ${[s.neighborhood, s.borough].filter(Boolean).join(", ")} · ${s.minutes} min`);
    const seg = segments[`${s.id}->${stops[i + 1]?.id}`];
    if (seg) {
      travel += seg.durationMinutes || 0;
      lines.push(`   ↓ ${seg.durationText} · ${seg.distanceText}${seg.routeSummary ? ` · ${seg.routeSummary}` : ""}`);
    }
  });
  lines.push("");
  lines.push(
    `${stops.length} stops · ${minutesToText(activity)} exploring · ${minutesToText(travel)} travel · ${minutesToText(activity + travel)} total`
  );
  lines.push("Planned with nyc-by-ma.vercel.app");
  return lines.join("\n");
}

// Serialize a plan into a shareable querystring: ?plan=id~min,id~min
export function encodePlan(stops) {
  return stops.map((s) => `${s.id}~${s.minutes}`).join(",");
}
export function decodePlan(str) {
  if (!str) return [];
  return str
    .split(",")
    .map((tok) => {
      const [id, min] = tok.split("~");
      return id ? { id, minutes: Math.max(5, parseInt(min, 10) || 60) } : null;
    })
    .filter(Boolean);
}
