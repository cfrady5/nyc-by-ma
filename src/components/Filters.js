"use client";

import { FILTERS } from "@/data/filters";
import { cx } from "@/lib/utils";

// Sticky, horizontally-scrollable pill bar (mobile-first) plus the search box.
// Updates the active filter, which drives both the grid and the map pins.
export default function Filters({
  activeFilter,
  onFilterChange,
  resultCount,
  savedOnly,
  onToggleSaved,
  savedCount,
  activeCollection,
  onClearCollection,
  children, // <SearchBar /> is passed in so it shares the sticky container
}) {
  return (
    <div className="sticky top-16 z-30 border-b border-line bg-cream/90 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 py-3">
        {/* Search */}
        <div className="mb-3">{children}</div>

        {/* Pills */}
        <div
          className="no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1"
          role="group"
          aria-label="Filter recommendations by category and neighborhood"
        >
          <button
            type="button"
            onClick={() => onFilterChange("All")}
            aria-pressed={activeFilter === "All" && !savedOnly}
            className={cx("pill", activeFilter === "All" && !savedOnly ? "pill-on" : "pill-off")}
          >
            All
          </button>

          {/* Saved toggle */}
          <button
            type="button"
            onClick={onToggleSaved}
            aria-pressed={savedOnly}
            className={cx("pill", savedOnly ? "pill-on" : "pill-off")}
          >
            ♥ Saved{savedCount ? ` (${savedCount})` : ""}
          </button>

          {FILTERS.map((f) => (
            <button
              key={f.label}
              type="button"
              onClick={() => onFilterChange(f.label)}
              aria-pressed={activeFilter === f.label && !savedOnly}
              className={cx(
                "pill",
                activeFilter === f.label && !savedOnly ? "pill-on" : "pill-off"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Result count + active collection chip */}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft">
          <span aria-live="polite">
            <span className="font-semibold text-ink">{resultCount}</span>{" "}
            {resultCount === 1 ? "spot" : "spots"}
          </span>
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
