"use client";

import { useCallback, useEffect, useState } from "react";

// -----------------------------------------------------------------------------
// PORTAL STUDIO STATE
// -----------------------------------------------------------------------------
// Persists everything the slideshow builder needs to localStorage: the list of
// slide "locations" (name, neighborhood, caption, photo) and the current theme
// (colors + fonts). This is browser-local — it's a content-creation tool, so
// each creator's draft lives on their own device.
// -----------------------------------------------------------------------------

const STORAGE_KEY = "nyc_by_ma_portal_v1";

// Preset themes. `preset: "custom"` means the individual colors/fonts below win.
export const THEME_PRESETS = {
  sunshine: { label: "Sunshine", bg: "#FDB913", text: "#1B1205", accent: "#E0409B" },
  blush: { label: "Blush", bg: "#F7D6DE", text: "#3A1226", accent: "#DF1B7D" },
  cream: { label: "Cream", bg: "#FCF4EC", text: "#241F21", accent: "#C99A3D" },
  lavender: { label: "Lavender", bg: "#D9C6E8", text: "#2A1B3D", accent: "#8E4BC9" },
  midnight: { label: "Midnight", bg: "#241F21", text: "#FCF4EC", accent: "#F2A6C6" },
  mint: { label: "Mint", bg: "#CDE9D9", text: "#123024", accent: "#1E9E6A" },
};

export const FONT_OPTIONS = [
  { value: "var(--font-serif), Georgia, serif", label: "Editorial serif" },
  { value: "'Georgia', 'Times New Roman', serif", label: "Classic serif" },
  { value: "var(--font-sans), system-ui, sans-serif", label: "Clean sans" },
  { value: "'Poppins', var(--font-sans), sans-serif", label: "Rounded sans" },
  { value: "var(--font-script), cursive", label: "Handwritten script" },
  { value: "'Courier New', monospace", label: "Typewriter" },
];

export const DEFAULT_THEME = {
  preset: "sunshine",
  bg: "#FDB913",
  text: "#1B1205",
  accent: "#E0409B",
  titleFont: "var(--font-serif), Georgia, serif",
  bodyFont: "'Georgia', 'Times New Roman', serif",
  texture: true, // soft watercolor wash behind the slide
};

const uid = () =>
  `loc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

function loadInitial() {
  if (typeof window === "undefined") return { theme: DEFAULT_THEME, locations: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { theme: DEFAULT_THEME, locations: [] };
    const parsed = JSON.parse(raw);
    return {
      theme: { ...DEFAULT_THEME, ...(parsed.theme || {}) },
      locations: Array.isArray(parsed.locations) ? parsed.locations : [],
    };
  } catch {
    return { theme: DEFAULT_THEME, locations: [] };
  }
}

export function usePortalStudio() {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [locations, setLocations] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const initial = loadInitial();
    setTheme(initial.theme);
    setLocations(initial.locations);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme, locations }));
    } catch {
      // Storage full (photos are heavy) or blocked — fail quietly.
    }
  }, [theme, locations, hydrated]);

  // ---- Theme -------------------------------------------------------------
  const updateTheme = useCallback((patch) => {
    setTheme((prev) => ({ ...prev, ...patch }));
  }, []);

  const applyPreset = useCallback((key) => {
    const p = THEME_PRESETS[key];
    if (!p) return;
    setTheme((prev) => ({ ...prev, preset: key, bg: p.bg, text: p.text, accent: p.accent }));
  }, []);

  // ---- Locations ---------------------------------------------------------
  const addLocation = useCallback((loc) => {
    const item = {
      id: uid(),
      name: loc.name?.trim() || "Untitled spot",
      neighborhood: loc.neighborhood?.trim() || "",
      caption: loc.caption?.trim() || "",
      image: loc.image || "",
      address: loc.address?.trim() || "",
      website: loc.website?.trim() || "",
      lat: Number.isFinite(loc.lat) ? loc.lat : null,
      lng: Number.isFinite(loc.lng) ? loc.lng : null,
    };
    setLocations((prev) => [...prev, item]);
    return item.id;
  }, []);

  const updateLocation = useCallback((id, patch) => {
    setLocations((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }, []);

  const removeLocation = useCallback((id) => {
    setLocations((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const moveLocation = useCallback((id, dir) => {
    setLocations((prev) => {
      const i = prev.findIndex((l) => l.id === id);
      if (i < 0) return prev;
      const j = dir === "up" ? i - 1 : i + 1;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }, []);

  return {
    hydrated,
    theme,
    updateTheme,
    applyPreset,
    locations,
    addLocation,
    updateLocation,
    removeLocation,
    moveLocation,
  };
}
