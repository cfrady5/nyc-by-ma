// =============================================================================
// POST /api/transit-route  — server-side transit directions
// =============================================================================
// Keeps any API key on the SERVER (never shipped to the client). If
// GOOGLE_MAPS_API_KEY is set, it queries the Google Directions API in transit
// mode and returns a sanitized route. If not, it returns a clearly-flagged
// Haversine fallback so the itinerary builder still works end-to-end.
//
// To enable real subway directions on Vercel:
//   Project → Settings → Environment Variables → GOOGLE_MAPS_API_KEY = <key>
// (Directions API enabled). No client changes needed.
// =============================================================================

export const runtime = "nodejs";

const R = 3958.8;
const toRad = (d) => (d * Math.PI) / 180;
function haversineMiles(a, b) {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function estimateTravelMinutes(miles) {
  if (miles < 0.4) return Math.max(3, Math.round((miles / 3) * 60));
  return Math.round(8 + (miles / 12) * 60);
}

function fallbackRoute(origin, destination) {
  const miles = haversineMiles(origin, destination);
  const min = estimateTravelMinutes(miles);
  return {
    fallback: true,
    distanceText: `${miles.toFixed(1)} mi`,
    distanceMiles: Number(miles.toFixed(2)),
    durationMinutes: min,
    durationText: `${min} min`,
    routeSummary: "Route details require transit API setup.",
    steps: [],
  };
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { origin, destination } = body || {};
  const valid = (p) => p && Number.isFinite(p.lat) && Number.isFinite(p.lng);
  if (!valid(origin) || !valid(destination)) {
    return Response.json({ error: "origin and destination {lat,lng} required" }, { status: 400 });
  }

  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    return Response.json(fallbackRoute(origin, destination));
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/directions/json");
    url.searchParams.set("origin", `${origin.lat},${origin.lng}`);
    url.searchParams.set("destination", `${destination.lat},${destination.lng}`);
    url.searchParams.set("mode", "transit");
    url.searchParams.set("transit_mode", "subway|bus");
    url.searchParams.set("key", key);

    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    const leg = data?.routes?.[0]?.legs?.[0];
    if (data.status !== "OK" || !leg) {
      return Response.json(fallbackRoute(origin, destination));
    }

    // Sanitize: surface only what the UI needs (no raw API payload).
    const steps = (leg.steps || []).map((s) => {
      if (s.travel_mode === "TRANSIT") {
        const td = s.transit_details || {};
        return {
          type: "subway",
          line: td.line?.short_name || td.line?.name || "",
          from: td.departure_stop?.name || "",
          to: td.arrival_stop?.name || "",
          durationText: s.duration?.text || "",
        };
      }
      return {
        type: "walk",
        instruction: (s.html_instructions || "Walk").replace(/<[^>]+>/g, ""),
        durationText: s.duration?.text || "",
      };
    });
    const transitLines = steps.filter((s) => s.type === "subway").map((s) => s.line).filter(Boolean);

    return Response.json({
      fallback: false,
      distanceText: leg.distance?.text || "",
      distanceMiles: leg.distance?.value ? Number((leg.distance.value / 1609.34).toFixed(2)) : null,
      durationMinutes: leg.duration?.value ? Math.round(leg.duration.value / 60) : null,
      durationText: leg.duration?.text || "",
      routeSummary: transitLines.length
        ? `Take the ${transitLines.join(" → ")}`
        : "Walking route",
      steps,
    });
  } catch {
    return Response.json(fallbackRoute(origin, destination));
  }
}
