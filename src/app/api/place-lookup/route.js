// =============================================================================
// POST /api/place-lookup  — turn an address / business name into a real place
// =============================================================================
// Given a free-text query (e.g. "Levain Bakery UWS" or "351 Amsterdam Ave"),
// returns the matched name, formatted address, coordinates, neighborhood, and —
// crucially — the business's OFFICIAL WEBSITE.
//
// Uses the Google Places API when GOOGLE_MAPS_API_KEY is set (the same key the
// transit route already uses; it stays on the server). Falls back to free
// OpenStreetMap/Nominatim geocoding (coordinates only, no website) so the portal
// still resolves addresses without a key.
//
// To enable website matching on Vercel:
//   Settings → Environment Variables → GOOGLE_MAPS_API_KEY = <key>
//   (Places API enabled)
// =============================================================================

export const runtime = "nodejs";

// Bias results toward New York City.
const NYC_BIAS = { lat: 40.7549, lng: -73.984, radius: 24000 };

function pickNeighborhood(components = []) {
  const byType = (type) => components.find((c) => (c.types || []).includes(type))?.long_name;
  return (
    byType("neighborhood") ||
    byType("sublocality_level_1") ||
    byType("sublocality") ||
    byType("political") ||
    ""
  );
}

async function googleLookup(query, key) {
  // 1) Find the place → place_id
  const findUrl = new URL("https://maps.googleapis.com/maps/api/place/findplacefromtext/json");
  findUrl.searchParams.set("input", query);
  findUrl.searchParams.set("inputtype", "textquery");
  findUrl.searchParams.set("fields", "place_id,name,geometry");
  findUrl.searchParams.set("locationbias", `circle:${NYC_BIAS.radius}@${NYC_BIAS.lat},${NYC_BIAS.lng}`);
  findUrl.searchParams.set("key", key);

  const findRes = await fetch(findUrl, { cache: "no-store" });
  const findData = await findRes.json();
  const candidate = findData?.candidates?.[0];
  if (findData.status !== "OK" || !candidate?.place_id) return null;

  // 2) Place details → website + address + components
  const detUrl = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  detUrl.searchParams.set("place_id", candidate.place_id);
  detUrl.searchParams.set(
    "fields",
    "name,formatted_address,website,url,geometry,address_component"
  );
  detUrl.searchParams.set("key", key);

  const detRes = await fetch(detUrl, { cache: "no-store" });
  const detData = await detRes.json();
  const r = detData?.result;
  if (detData.status !== "OK" || !r?.geometry?.location) return null;

  return {
    source: "google",
    name: r.name || candidate.name || "",
    address: r.formatted_address || "",
    website: r.website || "",
    mapsUrl: r.url || "",
    neighborhood: pickNeighborhood(r.address_components),
    lat: r.geometry.location.lat,
    lng: r.geometry.location.lng,
  };
}

async function osmLookup(query) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "us");

  const res = await fetch(url, {
    cache: "no-store",
    headers: { "User-Agent": "nyc-by-ma-portal/1.0 (https://nyc-by-ma.com)" },
  });
  const data = await res.json();
  const hit = Array.isArray(data) ? data[0] : null;
  if (!hit) return null;

  const a = hit.address || {};
  return {
    source: "osm",
    name: hit.name || (hit.display_name || "").split(",")[0] || "",
    address: hit.display_name || "",
    website: "", // OSM has no reliable website field
    mapsUrl: "",
    neighborhood: a.neighbourhood || a.suburb || a.quarter || a.city_district || "",
    lat: Number(hit.lat),
    lng: Number(hit.lon),
  };
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const query = typeof body?.query === "string" ? body.query.trim() : "";
  if (!query) {
    return Response.json({ error: "query required" }, { status: 400 });
  }

  const key = process.env.GOOGLE_MAPS_API_KEY;

  try {
    let result = null;
    if (key) result = await googleLookup(query, key);
    // Fall back to OSM if there's no key or Google found nothing.
    if (!result) result = await osmLookup(query);

    if (!result) {
      return Response.json({ found: false, message: "No match found. Try adding the city or a nearby cross-street." });
    }
    return Response.json({ found: true, ...result, websiteMatched: Boolean(result.website) });
  } catch {
    return Response.json({ found: false, message: "Lookup failed. Please try again." }, { status: 200 });
  }
}
