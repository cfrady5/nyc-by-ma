"use client";

import { useEffect, useState } from "react";
import { SUPABASE_URL, SUPABASE_ANON_KEY, PUBLISHED_TABLE } from "@/lib/supabaseConfig";

// Fetches locations published from the creator portal (Supabase) and maps them
// into the same shape the map/cards/filters use. Fails safe: on any error it
// returns an empty list, so the site still shows the built-in recommendations.
export function usePublishedRecs() {
  const [recs, setRecs] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/${PUBLISHED_TABLE}?select=*&order=updated_at.desc`,
          { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !Array.isArray(data)) return;
        setRecs(
          data
            .filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng))
            .map((r) => ({
              id: r.id,
              name: r.name,
              neighborhood: r.neighborhood || "",
              borough: r.borough || "Manhattan",
              category: r.category || "Food & Drink",
              lat: r.lat,
              lng: r.lng,
              website: r.website || "",
              recommendation: r.recommendation || "",
              price: "",
              tags: [],
              collectionTags: [],
              image: "",
              published: true,
            }))
        );
      } catch {
        /* offline / not configured — ignore, keep built-in recs */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return recs;
}
