"use client";

import { useState } from "react";
import { FILTERS } from "@/data/filters";
import { cx } from "@/lib/utils";

export const BOROUGHS = ["All Boroughs", "Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"];

// Primary chips shown by default; everything else lives under "More".
const PRIMARY = [
  "Food & Drink",
  "Coffee",
  "Dessert",
  "Brunch",
  "Shopping",
  "Date Night",
  "Free Activities",
];

// Sticky, mobile-first filter bar: search + borough selector + category chips
// (with a "More" overflow). Drives both the grid and the map pins.
export default function Filters({
  activeFilter,
  onFilterChange,
  resultCount,
  savedOnly,
  onToggleSaved,
  savedCount,
  activeCollection,
  onClearCollection,
  borough,
  onBoroughChange,
  children, // <SearchBar />
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const primaryFilters = FILTERS.filter((f) => PRIMARY.includes(f.label));
  const moreFilters = FILTERS.filter((f) => !PRIMARY.includes(f.label));
  const moreActive = moreFilters.some((f) => f.label === activeFilter && !savedOnly);

  return (
    <div className="sticky top-16 z-30 border-b border-line bg-cream/90 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 py-3">
        {/* Search */}
        <div className="mb-3">{children}</div>

        {/* Borough selector */}
        <div
          className="no-scrollbar -mx-1 mb-2 flex items-center gap-2 overflow-x-auto px-1"
          role="group"
          aria-label="Filter by borough"
        >
          <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-gold">
            Borough
          </span>
          {BOROUGHS.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => onBoroughChange(b)}
              aria-pressed={borough === b}
              className={cx("pill text-xs", borough === b ? "pill-on" : "pill-off")}
            >
              {b}
            </button>
          ))}
        </div>

        {/* Category chips */}
        <div
          className="no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1"
          role="group"
          aria-label="Filter by category"
        >
          <button
            type="button"
            onClick={() => onFilterChange("All")}
            aria-pressed={activeFilter === "All" && !savedOnly}
            className={cx("pill", activeFilter === "All" && !savedOnly ? "pill-on" : "pill-off")}
          >
            All
          </button>
          <button
            type="button"
            onClick={onToggleSaved}
            aria-pressed={savedOnly}
            className={cx("pill", savedOnly ? "pill-on" : "pill-off")}
          >
            ♥ Saved{savedCount ? ` (${savedCount})` : ""}
          </button>

          {primaryFilters.map((f) => (
            <button
              key={f.label}
              type="button"
              onClick={() => onFilterChange(f.label)}
              aria-pressed={activeFilter === f.label && !savedOnly}
              className={cx("pill", activeFilter === f.label && !savedOnly ? "pill-on" : "pill-off")}
            >
              {f.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setMoreOpen((o) => !o)}
            aria-expanded={moreOpen}
            className={cx("pill", moreActive ? "pill-on" : "pill-off")}
          >
            More {moreOpen ? "▴" : "▾"}
          </button>
        </div>

        {/* More (overflow) chips */}
        {moreOpen && (
          <div className="mt-2 flex flex-wrap gap-2 rounded-2xl border border-line bg-white/70 p-3">
            {moreFilters.map((f) => (
              <button
                key={f.label}
                type="button"
                onClick={() => onFilterChange(f.label)}
                aria-pressed={activeFilter === f.label && !savedOnly}
                className={cx("pill", activeFilter === f.label && !savedOnly ? "pill-on" : "pill-off")}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Result count + active collection chip */}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft">
          <span aria-live="polite">
            <span className="font-semibold text-ink">{resultCount}</span>{" "}
            {resultCount === 1 ? "spot" : "spots"}
          </span>
          {borough !== "All Boroughs" && (
            <button
              type="button"
              onClick={() => onBoroughChange("All Boroughs")}
              className="inline-flex items-center gap-1 rounded-full bg-lavender-soft px-2.5 py-1 font-medium text-mauve hover:bg-lavender"
            >
              {borough} ✕
            </button>
          )}
          {activeCollection ? (
            <button
              type="button"
              onClick={onClearCollection}
              className="inline-flex items-center gap-1 rounded-full bg-blush px-2.5 py-1 font-medium text-pink-deep hover:bg-pink-soft/50"
            >
              Collection: {activeCollection} ✕
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
