"use client";

// -----------------------------------------------------------------------------
// HOME (client) — owns all interactive state: search, filters, collection,
// saved-only toggle. Everything else is presentational and driven by props.
// -----------------------------------------------------------------------------

import { useCallback, useMemo, useState } from "react";
import Header from "./Header";
import Hero from "./Hero";
import Filters from "./Filters";
import SearchBar from "./SearchBar";
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

export default function HomeClient() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All"); // pill label
  const [activeCollection, setActiveCollection] = useState(null); // collection name
  const [savedOnly, setSavedOnly] = useState(false);
  const [borough, setBorough] = useState("All Boroughs");

  const { isSaved, toggleSaved, savedCount } = useSavedRecs();

  // ---- The single filtering pipeline (search + filter + collection + saved).
  // Both the map pins and the card grid read from this, so they stay in sync.
  const filtered = useMemo(() => {
    const filterDef = activeFilter !== "All" ? getFilter(activeFilter) : null;

    return recommendations.filter((rec) => {
      if (!matchesQuery(rec, query)) return false;
      if (borough !== "All Boroughs" && !(rec.borough || "").includes(borough)) return false;
      if (filterDef && !filterDef.test(rec)) return false;
      if (activeCollection && !recInCollection(rec, activeCollection)) return false;
      if (savedOnly && !isSaved(rec.id)) return false;
      return true;
    });
  }, [query, borough, activeFilter, activeCollection, savedOnly, isSaved]);

  // ---- Handlers ------------------------------------------------------------
  const handleFilterChange = useCallback((label) => {
    setSavedOnly(false);
    setActiveFilter(label);
  }, []);

  const handleToggleSaved = useCallback(() => {
    setSavedOnly((s) => !s);
  }, []);

  const handleSelectCollection = useCallback((name) => {
    setActiveCollection((prev) => (prev === name ? null : name));
    setActiveFilter("All");
    setSavedOnly(false);
    requestAnimationFrame(() => scrollToId("map"));
  }, []);

  // Pastel collection cards can filter by a collection OR a category.
  const handlePickCollection = useCallback((c) => {
    setSavedOnly(false);
    if (c.kind === "category") {
      setActiveCollection(null);
      setActiveFilter(c.value);
    } else {
      setActiveFilter("All");
      setActiveCollection(c.value);
    }
    requestAnimationFrame(() => scrollToId("map"));
  }, []);

  const handleResetFilters = useCallback(() => {
    setQuery("");
    setActiveFilter("All");
    setActiveCollection(null);
    setSavedOnly(false);
    setBorough("All Boroughs");
  }, []);

  // Nav: "Favorites" turns on the saved filter and scrolls to the explorer.
  const handleFavorites = useCallback(() => {
    setSavedOnly(true);
    setActiveFilter("All");
    setActiveCollection(null);
    requestAnimationFrame(() => scrollToId("map"));
  }, []);

  return (
    <>
      <Header onNav={scrollToId} onFavorites={handleFavorites} />
      <Hero />

      {/* Sticky filters + search (drives both map and grid) */}
      <Filters
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        resultCount={filtered.length}
        savedOnly={savedOnly}
        onToggleSaved={handleToggleSaved}
        savedCount={savedCount}
        activeCollection={activeCollection}
        onClearCollection={() => setActiveCollection(null)}
        borough={borough}
        onBoroughChange={setBorough}
      >
        <SearchBar value={query} onChange={setQuery} />
      </Filters>

      {/* Interactive explorer — results sidebar + live map (the primary list) */}
      <MapSection
        recs={filtered}
        isSaved={isSaved}
        onToggleSave={toggleSaved}
        savedOnly={savedOnly}
        onReset={handleResetFilters}
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
