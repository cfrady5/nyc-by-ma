// =============================================================================
// POST /api/publish-locations  — publish the portal's location slides to the site
// =============================================================================
// Auth-gated by the portal credentials (same PORTAL_USERNAME / PORTAL_PASSWORD).
// Writes to Supabase with the SERVICE-ROLE key (server-only, bypasses RLS). Does
// a FULL SYNC: upserts the locations sent and deletes any published rows no
// longer present, so the live map always mirrors the portal.
//
// Required Vercel env var (Settings → Environment Variables):
//   SUPABASE_SERVICE_ROLE_KEY = <service_role secret from Supabase dashboard>
// (SUPABASE URL + anon key are public and already baked in.)
// =============================================================================

import { SUPABASE_URL, PUBLISHED_TABLE } from "@/lib/supabaseConfig";

export const runtime = "nodejs";

const DEFAULT_USERNAME = "MAS";
const DEFAULT_PASSWORD = "CalebLovesMeMore";

const BOROUGHS = ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"];

// Infer a borough from a free-text address when one isn't set explicitly.
function inferBorough(address = "", fallback = "Manhattan") {
  const a = address.toLowerCase();
  for (const b of BOROUGHS) if (a.includes(b.toLowerCase())) return b;
  return fallback;
}

export async function POST(request) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    return Response.json(
      { ok: false, error: "Publishing isn't configured yet. Add SUPABASE_SERVICE_ROLE_KEY in Vercel." },
      { status: 503 }
    );
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  // Auth
  const expectedUser = process.env.PORTAL_USERNAME || DEFAULT_USERNAME;
  const expectedPass = process.env.PORTAL_PASSWORD || DEFAULT_PASSWORD;
  const userOk = (body.username || "").trim().toLowerCase() === expectedUser.toLowerCase();
  const passOk = body.password === expectedPass;
  if (!userOk || !passOk) {
    return Response.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

  const incoming = Array.isArray(body.locations) ? body.locations : [];

  // Keep only rows with real coordinates (needed for the map) and a name.
  const rows = incoming
    .filter((l) => l && l.name && Number.isFinite(l.lat) && Number.isFinite(l.lng))
    .map((l) => ({
      id: String(l.id),
      name: String(l.name).slice(0, 200),
      neighborhood: String(l.neighborhood || "").slice(0, 200),
      borough: BOROUGHS.includes(l.borough) ? l.borough : inferBorough(l.address, "Manhattan"),
      category: String(l.category || "Food & Drink").slice(0, 80),
      website: String(l.website || "").slice(0, 500),
      address: String(l.address || "").slice(0, 400),
      recommendation: String(l.caption || l.recommendation || "").slice(0, 1000),
      lat: l.lat,
      lng: l.lng,
      updated_at: new Date().toISOString(),
    }));

  const skipped = incoming.length - rows.length;

  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
  const base = `${SUPABASE_URL}/rest/v1/${PUBLISHED_TABLE}`;

  try {
    // 1) Upsert the incoming rows (merge on primary key).
    if (rows.length) {
      const up = await fetch(`${base}?on_conflict=id`, {
        method: "POST",
        headers: { ...headers, Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify(rows),
        cache: "no-store",
      });
      if (!up.ok) {
        const text = await up.text();
        return Response.json({ ok: false, error: `Upsert failed: ${text.slice(0, 300)}` }, { status: 502 });
      }
    }

    // 2) Delete published rows that are no longer in the portal (full sync).
    const keepIds = rows.map((r) => r.id);
    const delUrl = keepIds.length
      ? `${base}?id=not.in.(${keepIds.map((id) => `"${id}"`).join(",")})`
      : base; // nothing kept → clear all
    const del = await fetch(delUrl, {
      method: "DELETE",
      headers: { ...headers, Prefer: "return=minimal" },
      cache: "no-store",
    });
    if (!del.ok) {
      const text = await del.text();
      return Response.json({ ok: false, error: `Cleanup failed: ${text.slice(0, 300)}` }, { status: 502 });
    }

    return Response.json({ ok: true, published: rows.length, skipped });
  } catch (e) {
    return Response.json({ ok: false, error: "Could not reach the database." }, { status: 502 });
  }
}
