"use client";

// -----------------------------------------------------------------------------
// HOME (client) — owns all interactive state: search, filters, collection,
// saved-only toggle. Everything else is presentational and driven by props.
// -----------------------------------------------------------------------------

import { useCallback, useMemo, useState } from "react";
import Header from "./Header";
import Hero from "./Hero";
import MapSection from "./MapSection";
import Collections from "./Collections";
import CTABand from "./CTABand";
import Footer from "./Footer";

import { recommendations } from "@/data/recommendations";
import { getFilter } from "@/data/filters";
import { recInCollection } from "@/data/collections";
import { matchesQuery } from "@/lib/utils";
import { useSavedRecs } from "@/hooks/useSavedRecs";

// Scroll helper shared by the nav + CTAs.
function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Sorting. "Most loved" uses real signals (your saves + how curated a spot is).
// A true "most visited" needs backend analytics, so it isn't offered yet.
const priceRank = (r) => {
  const p = (r.price || "").toLowerCase();
  if (!p) return 3;
  if (p.includes("$0")) return 0;
  if (p.includes("budget")) return 1;
  return 2;
};
const lovedScore = (r, isSaved) =>
  (isSaved(r.id) ? 1000 : 0) + (r.collectionTags?.length || 0) * 10 + (r.tags?.length || 0);

function sortRecs(list, sort, isSaved) {
  const arr = [...list];
  if (sort === "az") return arr.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "loved") return arr.sort((a, b) => lovedScore(b, isSaved) - lovedScore(a, isSaved));
  if (sort === "price") return arr.sort((a, b) => priceRank(a) - priceRank(b) || a.name.localeCompare(b.name));
  return arr; // featured = original curated order
}

export default function HomeClient() {
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]); // selected category labels (multi)
  const [boroughs, setBoroughs] = useState([]); // selected boroughs (multi)
  const [activeCollection, setActiveCollection] = useState(null); // collection name
  const [savedOnly, setSavedOnly] = useState(false);
  const [sort, setSort] = useState("featured");

  const { isSaved, toggleSaved, savedCount } = useSavedRecs();

  // ---- The single filtering pipeline (search + filters + collection + saved).
  // Within a facet selections are OR'd; facets are AND'd together.
  const filtered = useMemo(() => {
    const defs = activeFilters.map((l) => getFilter(l)).filter(Boolean);
    return recommendations.filter((rec) => {
      if (!matchesQuery(rec, query)) return false;
      if (boroughs.length && !boroughs.some((b) => (rec.borough || "").includes(b))) return false;
      if (defs.length && !defs.some((d) => d.test(rec))) return false;
      if (activeCollection && !recInCollection(rec, activeCollection)) return false;
      if (savedOnly && !isSaved(rec.id)) return false;
      return true;
    });
  }, [query, boroughs, activeFilters, activeCollection, savedOnly, isSaved]);

  const sorted = useMemo(() => sortRecs(filtered, sort, isSaved), [filtered, sort, isSaved]);

  const hasActiveFilters =
    Boolean(query) || boroughs.length > 0 || activeFilters.length > 0 || savedOnly || Boolean(activeCollection);

  // ---- Handlers ------------------------------------------------------------
  // Toggle a category filter; "All" clears the category facet.
  const handleToggleFilter = useCallback((label) => {
    if (label === "All") return setActiveFilters([]);
    setActiveFilters((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    );
  }, []);

  // Toggle a borough; "All Boroughs" clears the borough facet.
  const handleToggleBorough = useCallback((b) => {
    if (b === "All Boroughs") return setBoroughs([]);
    setBoroughs((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));
  }, []);

  const handleToggleSaved = useCallback(() => {
    setSavedOnly((s) => !s);
  }, []);

  // Pastel collection cards filter by a collection OR a category.
  const handlePickCollection = useCallback((c) => {
    setSavedOnly(false);
    if (c.kind === "category") {
      setActiveCollection(null);
      setActiveFilters([c.value]);
    } else {
      setActiveFilters([]);
      setActiveCollection(c.value);
    }
    requestAnimationFrame(() => scrollToId("map"));
  }, []);

  const handleClearAll = useCallback(() => {
    setQuery("");
    setActiveFilters([]);
    setBoroughs([]);
    setActiveCollection(null);
    setSavedOnly(false);
  }, []);

  // Nav: "Favorites" turns on the saved filter and scrolls to the explorer.
  const handleFavorites = useCallback(() => {
    setSavedOnly(true);
    setActiveFilters([]);
    setActiveCollection(null);
    requestAnimationFrame(() => scrollToId("map"));
  }, []);

  return (
    <>
      <Header onNav={scrollToId} onFavorites={handleFavorites} />
      <Hero />

      {/* Interactive explorer — filters live in the sidebar; map shows pins */}
      <MapSection
        recs={sorted}
        isSaved={isSaved}
        onToggleSave={toggleSaved}
        savedOnly={savedOnly}
        onReset={handleClearAll}
        filters={{
          query,
          onQuery: setQuery,
          boroughs,
          onToggleBorough: handleToggleBorough,
          activeFilters,
          onToggleFilter: handleToggleFilter,
          savedOnly,
          onToggleSaved: handleToggleSaved,
          savedCount,
          resultCount: filtered.length,
          activeCollection,
          onClearCollection: () => setActiveCollection(null),
          onClearAll: handleClearAll,
          hasActiveFilters,
          sort,
          onSort: setSort,
        }}
      />

      <Collections
        recs={recommendations}
        onPick={handlePickCollection}
        onViewAll={() => scrollToId("map")}
      />

      <CTABand />
      <Footer />
    </>
  );
}
