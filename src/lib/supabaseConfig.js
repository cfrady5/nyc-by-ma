// =============================================================================
// SUPABASE CONFIG
// =============================================================================
// The project URL and the publishable (anon) key are PUBLIC by design — the anon
// key is meant to ship to the browser and is gated by row-level security (the
// published_locations table only allows public SELECT). These are safe to embed.
//
// Writes never use these — they go through /api/publish-locations on the server
// with SUPABASE_SERVICE_ROLE_KEY (secret, server-only env var).
// =============================================================================

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://eoxxaabrzjxvfktsbvvv.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_QQ55qSX3MNgPhVeNfuWDVQ_W48iqWbz";

export const PUBLISHED_TABLE = "published_locations";
