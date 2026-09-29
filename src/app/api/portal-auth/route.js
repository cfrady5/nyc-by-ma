// =============================================================================
// PORTAL AUTH — server-side password check
// =============================================================================
// The portal credentials live ONLY on the server (env vars), so they are never
// shipped in the client bundle. The client posts the entered username +
// password here and gets back { ok: true/false }. On success the client sets a
// local session flag — we never store or return the actual credentials.
//
// Set them in Vercel:  Project → Settings → Environment Variables
//   PORTAL_USERNAME = your-username
//   PORTAL_PASSWORD = your-secret
// If unset, the defaults below are used so the portal works out of the box.
// NOTE: these defaults are visible in the source — set the env vars in Vercel
// for real privacy.
// =============================================================================

export const runtime = "nodejs";

const DEFAULT_USERNAME = "MAS"; // override with PORTAL_USERNAME in Vercel
const DEFAULT_PASSWORD = "CalebLovesMeMore"; // override with PORTAL_PASSWORD in Vercel

// Constant-ish comparison (length check first avoids a trivial timing leak).
const matches = (provided, expected) =>
  typeof provided === "string" && provided.length === expected.length && provided === expected;

export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const expectedUser = process.env.PORTAL_USERNAME || DEFAULT_USERNAME;
  const expectedPass = process.env.PORTAL_PASSWORD || DEFAULT_PASSWORD;

  // Username is case-insensitive for convenience; password is exact.
  const userOk = matches((body.username || "").trim().toLowerCase(), expectedUser.toLowerCase());
  const passOk = matches(body.password, expectedPass);
  const ok = userOk && passOk;

  return Response.json(
    { ok, usingDefault: !process.env.PORTAL_PASSWORD },
    { status: ok ? 200 : 401 }
  );
}
