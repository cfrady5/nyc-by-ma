"use client";

import { useCallback, useEffect, useState } from "react";

// localStorage key — bump the version suffix if the shape ever changes.
const STORAGE_KEY = "nyc_by_ma_saved_v1";

// Hook that persists the user's saved recommendations to localStorage.
// Returns the set of saved ids plus helpers to toggle / check membership.
export function useSavedRecs() {
  const [saved, setSaved] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  // Load once on mount (client only — avoids SSR/localStorage mismatch).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setSaved(JSON.parse(raw));
    } catch {
      // Ignore corrupt/unavailable storage — saving simply won't persist.
    }
    setHydrated(true);
  }, []);

  // Persist whenever the list changes (after the initial load).
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      // Storage full or blocked — fail silently.
    }
  }, [saved, hydrated]);

  const toggleSaved = useCallback((id) => {
    setSaved((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const isSaved = useCallback((id) => saved.includes(id), [saved]);

  return { saved, isSaved, toggleSaved, hydrated, savedCount: saved.length };
}
