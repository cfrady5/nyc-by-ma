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
import RecommendationGrid from "./RecommendationGrid";
import Footer from "./Footer";

import { recommendations } from "@/data/recommendations";
import { getFilter } from "@/data/filters";
import { recInCollection } from "@/data/collections";
import { matchesQuery } from "@/lib/utils";
import { useSavedRecs } from "@/hooks/useSavedRecs";

export default function HomeClient() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All"); // pill label
  const [activeCollection, setActiveCollection] = useState(null); // collection name
  const [savedOnly, setSavedOnly] = useState(false);
  const [highlightedId, setHighlightedId] = useState(null);

  const { isSaved, toggleSaved, savedCount } = useSavedRecs();

  // ---- Derived stats for the hero ------------------------------------------
  const stats = useMemo(
    () => ({
      count: recommendations.length,
      neighborhoods: new Set(recommendations.map((r) => r.neighborhood)).size,
    }),
    []
  );

  // ---- The single filtering pipeline (search + filter + collection + saved).
  // Both the map pins and the card grid read from this, so they stay in sync.
  const filtered = useMemo(() => {
    const filterDef = activeFilter !== "All" ? getFilter(activeFilter) : null;

    return recommendations.filter((rec) => {
      if (!matchesQuery(rec, query)) return false;
      if (filterDef && !filterDef.test(rec)) return false;
      if (activeCollection && !recInCollection(rec, activeCollection)) return false;
      if (savedOnly && !isSaved(rec.id)) return false;
      return true;
    });
  }, [query, activeFilter, activeCollection, savedOnly, isSaved]);

  // ---- Handlers ------------------------------------------------------------
  const handleFilterChange = useCallback((label) => {
    setSavedOnly(false);
    setActiveFilter(label);
  }, []);

  const handleToggleSaved = useCallback(() => {
    setSavedOnly((s) => !s);
  }, []);

  const handleSelectCollection = useCallback((name) => {
    // Toggle off if the same collection is tapped again.
    setActiveCollection((prev) => (prev === name ? null : name));
    setActiveFilter("All");
    setSavedOnly(false);
    // Scroll to the results so the effect is visible.
    requestAnimationFrame(() => {
      document.getElementById("recs")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const handleResetFilters = useCallback(() => {
    setQuery("");
    setActiveFilter("All");
    setActiveCollection(null);
    setSavedOnly(false);
  }, []);

  // From a map popup's "View Details": scroll to the matching card + highlight.
  const handleViewDetails = useCallback((rec) => {
    setHighlightedId(rec.id);
    requestAnimationFrame(() => {
      const el = document.getElementById(`rec-${rec.id}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    // Clear the highlight after a moment.
    setTimeout(() => setHighlightedId(null), 2400);
  }, []);

  return (
    <>
      <Header />
      <Hero stats={stats} />

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
      >
        <SearchBar value={query} onChange={setQuery} />
      </Filters>

      <MapSection recs={filtered} onViewDetails={handleViewDetails} />

      <Collections
        recs={recommendations}
        activeCollection={activeCollection}
        onSelect={handleSelectCollection}
      />

      {/* Recommendation grid */}
      <section id="recs" className="mx-auto max-w-6xl px-4 pb-6 pt-2">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="eyebrow">The full list</p>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {savedOnly ? (
                <>
                  Your <span className="font-script text-pink">saved</span> spots
                </>
              ) : (
                <>
                  All <span className="font-script text-pink">recs</span>
                </>
              )}
            </h2>
          </div>
          <span className="text-sm text-white/55">
            {filtered.length} {filtered.length === 1 ? "result" : "results"}
          </span>
        </div>

        {savedOnly && filtered.length === 0 ? (
          <div className="surface mx-auto max-w-md p-10 text-center">
            <div className="text-4xl">♡</div>
            <h3 className="mt-3 text-lg font-bold">No saved spots yet</h3>
            <p className="mt-1 text-sm text-white/60">
              Tap the heart on any card to save it here for later.
            </p>
            <button type="button" onClick={handleResetFilters} className="btn-secondary mt-5">
              Browse all recs
            </button>
          </div>
        ) : (
          <RecommendationGrid
            recs={filtered}
            isSaved={isSaved}
            onToggleSave={toggleSaved}
            onReset={handleResetFilters}
            highlightedId={highlightedId}
          />
        )}
      </section>

      <Footer />
    </>
  );
}
