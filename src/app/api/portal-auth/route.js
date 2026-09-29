// =============================================================================
// PORTAL AUTH — server-side password check
// =============================================================================
// The portal password lives ONLY on the server (env var PORTAL_PASSWORD), so it
// is never shipped in the client bundle. The client posts the entered password
// here and gets back { ok: true/false }. On success the client sets a local
// session flag — we never store or return the actual password.
//
// Set the password in Vercel:  Project → Settings → Environment Variables
//   PORTAL_PASSWORD = your-secret
// If unset, a default is used so the portal still works out of the box.
// =============================================================================

export const runtime = "nodejs";

const DEFAULT_PASSWORD = "nycbyma"; // override with PORTAL_PASSWORD in Vercel

export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const expected = process.env.PORTAL_PASSWORD || DEFAULT_PASSWORD;
  const provided = typeof body.password === "string" ? body.password : "";

  // Constant-ish comparison (length check first avoids a trivial timing leak).
  const ok = provided.length === expected.length && provided === expected;

  return Response.json(
    { ok, usingDefault: !process.env.PORTAL_PASSWORD },
    { status: ok ? 200 : 401 }
  );
}
