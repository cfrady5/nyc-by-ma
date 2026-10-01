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

// Normalize an item to the current shape (adds type, images[], layout fields;
// migrates a legacy single `image` to images[]).
function normalize(item) {
  const images = Array.isArray(item.images)
    ? item.images.filter(Boolean)
    : item.image
    ? [item.image]
    : [];
  return {
    id: item.id || uid(),
    type: item.type || "location",
    name: item.name || "",
    neighborhood: item.neighborhood || "",
    caption: item.caption || "",
    eyebrow: item.eyebrow || "",
    handle: item.handle || "",
    category: item.category || "Food & Drink",
    borough: item.borough || "Manhattan",
    images,
    textPosition: item.textPosition === "bottom" ? "bottom" : "top",
    photoLayout: item.photoLayout || "auto",
    photoScale: Number.isFinite(item.photoScale) ? item.photoScale : 1,
    textScale: Number.isFinite(item.textScale) ? item.textScale : 1,
    textColor: item.textColor || "",
    coverTemplate: item.coverTemplate || "classic",
    address: item.address || "",
    website: item.website || "",
    lat: Number.isFinite(item.lat) ? item.lat : null,
    lng: Number.isFinite(item.lng) ? item.lng : null,
  };
}

const STORAGE_KEY_V2 = "nyc_by_ma_portal_drafts_v1";

const draftUid = () => `draft_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

function newDraftObj(name) {
  return {
    id: draftUid(),
    name: name || "Untitled slideshow",
    updatedAt: Date.now(),
    theme: DEFAULT_THEME,
    locations: [],
  };
}

function reviveDraft(dr) {
  return {
    id: dr.id || draftUid(),
    name: dr.name || "Untitled slideshow",
    updatedAt: dr.updatedAt || Date.now(),
    theme: { ...DEFAULT_THEME, ...(dr.theme || {}) },
    locations: Array.isArray(dr.locations) ? dr.locations.map(normalize) : [],
  };
}

// Load the multi-draft store, migrating the old single-draft key if present.
function loadData() {
  if (typeof window === "undefined") return { activeId: null, drafts: [] };
  try {
    const rawV2 = window.localStorage.getItem(STORAGE_KEY_V2);
    if (rawV2) {
      const d = JSON.parse(rawV2);
      if (d && Array.isArray(d.drafts) && d.drafts.length) {
        const drafts = d.drafts.map(reviveDraft);
        const activeId = drafts.some((x) => x.id === d.activeId) ? d.activeId : drafts[0].id;
        return { activeId, drafts };
      }
    }
    // Migrate the legacy single draft → first named draft.
    const rawV1 = window.localStorage.getItem(STORAGE_KEY);
    if (rawV1) {
      const p = JSON.parse(rawV1);
      const draft = reviveDraft({ name: "My first slideshow", theme: p.theme, locations: p.locations });
      return { activeId: draft.id, drafts: [draft] };
    }
  } catch {
    /* fall through to a fresh draft */
  }
  const d = newDraftObj("My first slideshow");
  return { activeId: d.id, drafts: [d] };
}

export function usePortalStudio() {
  const [data, setData] = useState({ activeId: null, drafts: [] });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setData(loadData());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(data));
    } catch {
      // Storage full (photos are heavy) or blocked — fail quietly.
    }
  }, [data, hydrated]);

  const active = data.drafts.find((d) => d.id === data.activeId) || data.drafts[0] || null;
  const theme = active?.theme || DEFAULT_THEME;
  const locations = active?.locations || [];

  // Apply a mutation to the ACTIVE draft (functional update → no stale state).
  const mutateActive = useCallback((fn) => {
    setData((prev) => {
      const activeId = prev.activeId || prev.drafts[0]?.id;
      return {
        ...prev,
        drafts: prev.drafts.map((d) => (d.id === activeId ? { ...fn(d), updatedAt: Date.now() } : d)),
      };
    });
  }, []);

  // ---- Theme -------------------------------------------------------------
  const updateTheme = useCallback(
    (patch) => mutateActive((d) => ({ ...d, theme: { ...d.theme, ...patch } })),
    [mutateActive]
  );

  const applyPreset = useCallback(
    (key) => {
      const p = THEME_PRESETS[key];
      if (!p) return;
      mutateActive((d) => ({ ...d, theme: { ...d.theme, preset: key, bg: p.bg, text: p.text, accent: p.accent } }));
    },
    [mutateActive]
  );

  // ---- Slides ------------------------------------------------------------
  const addLocation = useCallback(
    (loc) => {
      const images = Array.isArray(loc.images) ? loc.images.filter(Boolean) : loc.image ? [loc.image] : [];
      const item = normalize({
        type: "location",
        name: loc.name?.trim() || "Untitled spot",
        neighborhood: loc.neighborhood?.trim() || "",
        caption: loc.caption?.trim() || "",
        category: loc.category || "Food & Drink",
        borough: loc.borough || "Manhattan",
        images,
        address: loc.address?.trim() || "",
        website: loc.website?.trim() || "",
        lat: loc.lat,
        lng: loc.lng,
      });
      mutateActive((d) => ({ ...d, locations: [...d.locations, item] }));
      return item.id;
    },
    [mutateActive]
  );

  const addCover = useCallback(() => {
    const item = normalize({ type: "cover", name: "May Recs", eyebrow: "NYC by MA", caption: "", coverTemplate: "moodboard" });
    mutateActive((d) => ({ ...d, locations: [item, ...d.locations] }));
    return item.id;
  }, [mutateActive]);

  const addEnd = useCallback(() => {
    const item = normalize({
      type: "end",
      name: "Follow along",
      handle: "@NYC_BY_MA",
      caption: "For more NYC recs, follow along.",
    });
    mutateActive((d) => ({ ...d, locations: [...d.locations, item] }));
    return item.id;
  }, [mutateActive]);

  const updateLocation = useCallback(
    (id, patch) => mutateActive((d) => ({ ...d, locations: d.locations.map((l) => (l.id === id ? { ...l, ...patch } : l)) })),
    [mutateActive]
  );

  const removeLocation = useCallback(
    (id) => mutateActive((d) => ({ ...d, locations: d.locations.filter((l) => l.id !== id) })),
    [mutateActive]
  );

  const moveLocation = useCallback(
    (id, dir) =>
      mutateActive((d) => {
        const i = d.locations.findIndex((l) => l.id === id);
        if (i < 0) return d;
        const j = dir === "up" ? i - 1 : i + 1;
        if (j < 0 || j >= d.locations.length) return d;
        const next = [...d.locations];
        [next[i], next[j]] = [next[j], next[i]];
        return { ...d, locations: next };
      }),
    [mutateActive]
  );

  // ---- Per-slide image helpers ------------------------------------------
  const addImages = useCallback(
    (id, urls) => {
      const list = (Array.isArray(urls) ? urls : [urls]).filter(Boolean);
      if (!list.length) return;
      mutateActive((d) => ({
        ...d,
        locations: d.locations.map((l) => (l.id === id ? { ...l, images: [...(l.images || []), ...list] } : l)),
      }));
    },
    [mutateActive]
  );

  const removeImage = useCallback(
    (id, idx) =>
      mutateActive((d) => ({
        ...d,
        locations: d.locations.map((l) => (l.id === id ? { ...l, images: (l.images || []).filter((_, i) => i !== idx) } : l)),
      })),
    [mutateActive]
  );

  const moveImage = useCallback(
    (id, idx, dir) =>
      mutateActive((d) => ({
        ...d,
        locations: d.locations.map((l) => {
          if (l.id !== id) return l;
          const imgs = [...(l.images || [])];
          const j = dir === "left" ? idx - 1 : idx + 1;
          if (j < 0 || j >= imgs.length) return l;
          [imgs[idx], imgs[j]] = [imgs[j], imgs[idx]];
          return { ...l, images: imgs };
        }),
      })),
    [mutateActive]
  );

  // ---- Draft management --------------------------------------------------
  const drafts = data.drafts.map((d) => ({
    id: d.id,
    name: d.name,
    updatedAt: d.updatedAt,
    slideCount: d.locations.length,
  }));

  const newDraft = useCallback((name) => {
    const d = newDraftObj(name);
    setData((prev) => ({ activeId: d.id, drafts: [...prev.drafts, d] }));
    return d.id;
  }, []);

  const switchDraft = useCallback((id) => {
    setData((prev) => (prev.drafts.some((d) => d.id === id) ? { ...prev, activeId: id } : prev));
  }, []);

  const renameDraft = useCallback((id, name) => {
    setData((prev) => ({
      ...prev,
      drafts: prev.drafts.map((d) => (d.id === id ? { ...d, name: name || d.name, updatedAt: Date.now() } : d)),
    }));
  }, []);

  const deleteDraft = useCallback((id) => {
    setData((prev) => {
      let drafts = prev.drafts.filter((d) => d.id !== id);
      let activeId = prev.activeId;
      if (!drafts.length) {
        const nd = newDraftObj("My first slideshow");
        drafts = [nd];
        activeId = nd.id;
      } else if (activeId === id) {
        activeId = drafts[0].id;
      }
      return { activeId, drafts };
    });
  }, []);

  const duplicateDraft = useCallback((id) => {
    setData((prev) => {
      const src = prev.drafts.find((d) => d.id === id);
      if (!src) return prev;
      const copy = {
        ...newDraftObj(`${src.name} copy`),
        theme: { ...src.theme },
        locations: src.locations.map((l) => ({ ...l, id: uid() })),
      };
      return { activeId: copy.id, drafts: [...prev.drafts, copy] };
    });
  }, []);

  return {
    hydrated,
    theme,
    updateTheme,
    applyPreset,
    locations,
    addLocation,
    addCover,
    addEnd,
    updateLocation,
    removeLocation,
    moveLocation,
    addImages,
    removeImage,
    moveImage,
    // drafts
    drafts,
    activeId: active?.id || null,
    activeName: active?.name || "",
    newDraft,
    switchDraft,
    renameDraft,
    deleteDraft,
    duplicateDraft,
  };
}
