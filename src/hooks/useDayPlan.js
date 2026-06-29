"use client";

import { useCallback, useEffect, useState } from "react";
import { recommendations } from "@/data/recommendations";
import { defaultDurationFor } from "@/lib/itinerary";

const STORAGE_KEY = "nyc_by_ma_dayplan_v1";
const byId = new Map(recommendations.map((r) => [r.id, r]));

// Persists the user's "Build Your Day" plan: an ORDERED list of
// { id, minutes }. Hydrated from localStorage on the client only.
export function useDayPlan() {
  const [stops, setStops] = useState([]); // [{ id, minutes }]
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setStops(JSON.parse(raw).filter((s) => byId.has(s.id)));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stops));
    } catch {
      /* ignore */
    }
  }, [stops, hydrated]);

  const has = useCallback((id) => stops.some((s) => s.id === id), [stops]);

  const add = useCallback((id) => {
    const rec = byId.get(id);
    if (!rec) return;
    setStops((prev) =>
      prev.some((s) => s.id === id)
        ? prev
        : [...prev, { id, minutes: defaultDurationFor(rec) }]
    );
  }, []);

  const remove = useCallback((id) => {
    setStops((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const toggle = useCallback((id) => {
    setStops((prev) => {
      if (prev.some((s) => s.id === id)) return prev.filter((s) => s.id !== id);
      const rec = byId.get(id);
      return rec ? [...prev, { id, minutes: defaultDurationFor(rec) }] : prev;
    });
  }, []);

  const setMinutes = useCallback((id, minutes) => {
    setStops((prev) =>
      prev.map((s) => (s.id === id ? { ...s, minutes: Math.max(5, minutes | 0) } : s))
    );
  }, []);

  const move = useCallback((id, dir) => {
    setStops((prev) => {
      const i = prev.findIndex((s) => s.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }, []);

  // Replace order with an array of ids (used by Optimize Route).
  const setOrder = useCallback((idsInOrder) => {
    setStops((prev) => {
      const map = new Map(prev.map((s) => [s.id, s]));
      return idsInOrder.map((id) => map.get(id)).filter(Boolean);
    });
  }, []);

  const clear = useCallback(() => setStops([]), []);

  // Replace the whole plan (used when loading a shared ?plan= link).
  const replaceAll = useCallback((next) => {
    setStops((next || []).filter((s) => byId.has(s.id)).map((s) => ({ id: s.id, minutes: Math.max(5, s.minutes | 0) || defaultDurationFor(byId.get(s.id)) })));
  }, []);

  return { stops, hydrated, has, add, remove, toggle, setMinutes, move, setOrder, clear, replaceAll, count: stops.length };
}
