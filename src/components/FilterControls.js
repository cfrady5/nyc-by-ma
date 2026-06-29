"use client";

import SearchBar from "./SearchBar";
import { FILTERS } from "@/data/filters";
import { cx } from "@/lib/utils";

export const BOROUGHS = ["All Boroughs", "Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"];

// Keep values in sync with sortRecs() in HomeClient.
const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "loved", label: "Most loved" },
  { value: "az", label: "Name (A–Z)" },
  { value: "price", label: "Budget first" },
];

// Vertical left-sidebar filter panel for the map explorer. Boroughs and
// categories are MULTI-SELECT (chips toggle on/off); within a facet selections
// are OR'd. Includes a "Clear all".
export default function FilterControls({
  query,
  onQuery,
  boroughs,
  onToggleBorough,
  activeFilters,
  onToggleFilter,
  savedOnly,
  onToggleSaved,
  savedCount,
  resultCount,
  activeCollection,
  onClearCollection,
  onClearAll,
  hasActiveFilters,
  sort,
  onSort,
}) {
  return (
    <div className="space-y-4 p-3 sm:p-4">
      <SearchBar value={query} onChange={onQuery} />

      {/* Sort */}
      <div className="flex items-center gap-2">
        <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-gold">
          Sort
        </span>
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Sort results</span>
          <select
            value={sort}
            onChange={(e) => onSort(e.target.value)}
            className="w-full appearance-none rounded-full border border-ink/12 bg-white py-2 pl-4 pr-9 text-sm font-medium text-ink transition hover:border-pink/40 focus:outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value} className="bg-white text-ink">
                {s.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-soft" aria-hidden="true">▾</span>
        </label>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-soft">
          <span className="font-semibold text-ink">{resultCount}</span>{" "}
          {resultCount === 1 ? "spot" : "spots"}
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="rounded-full px-2.5 py-1 text-xs font-semibold text-pink-deep transition hover:bg-blush-soft"
          >
            Clear all ✕
          </button>
        )}
      </div>

      {activeCollection ? (
        <button
          type="button"
          onClick={onClearCollection}
          className="inline-flex items-center gap-1 rounded-full bg-blush px-2.5 py-1 text-xs font-medium text-pink-deep hover:bg-pink-soft/50"
        >
          {activeCollection} ✕
        </button>
      ) : null}

      {/* Borough (multi-select) */}
      <Group label="Borough">
        <Chip active={boroughs.length === 0} onClick={() => onToggleBorough("All Boroughs")}>
          All
        </Chip>
        {BOROUGHS.slice(1).map((b) => (
          <Chip key={b} active={boroughs.includes(b)} onClick={() => onToggleBorough(b)}>
            {b}
          </Chip>
        ))}
      </Group>

      {/* Category (multi-select) + Saved */}
      <Group label="Category">
        <Chip active={activeFilters.length === 0} onClick={() => onToggleFilter("All")}>
          All
        </Chip>
        <Chip active={savedOnly} onClick={onToggleSaved}>
          ♥ Saved{savedCount ? ` (${savedCount})` : ""}
        </Chip>
        {FILTERS.map((f) => (
          <Chip key={f.label} active={activeFilters.includes(f.label)} onClick={() => onToggleFilter(f.label)}>
            {f.label}
          </Chip>
        ))}
      </Group>
    </div>
  );
}

function Group({ label, children }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gold">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx("pill shrink-0 text-sm", active ? "pill-on" : "pill-off")}
    >
      {children}
    </button>
  );
}
