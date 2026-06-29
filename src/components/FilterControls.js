"use client";

import SearchBar from "./SearchBar";
import { FILTERS } from "@/data/filters";
import { cx } from "@/lib/utils";

export const BOROUGHS = ["All Boroughs", "Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"];

// Search + selectable borough chips + selectable category chips + Saved.
// Sits at the top of the map explorer card.
export default function FilterControls({
  query,
  onQuery,
  borough,
  onBorough,
  activeFilter,
  onFilter,
  savedOnly,
  onToggleSaved,
  savedCount,
  resultCount,
  activeCollection,
  onClearCollection,
}) {
  return (
    <div className="space-y-3 border-b border-line p-3 sm:p-4">
      <SearchBar value={query} onChange={onQuery} />

      {/* Borough chips */}
      <ChipRow label="Borough">
        {BOROUGHS.map((b) => (
          <Chip key={b} active={borough === b} onClick={() => onBorough(b)}>
            {b === "All Boroughs" ? "All" : b}
          </Chip>
        ))}
      </ChipRow>

      {/* Category chips */}
      <ChipRow label="Category">
        <Chip active={!savedOnly && activeFilter === "All"} onClick={() => onFilter("All")}>
          All
        </Chip>
        <Chip active={savedOnly} onClick={onToggleSaved}>
          ♥ Saved{savedCount ? ` (${savedCount})` : ""}
        </Chip>
        {FILTERS.map((f) => (
          <Chip
            key={f.label}
            active={!savedOnly && activeFilter === f.label}
            onClick={() => onFilter(f.label)}
          >
            {f.label}
          </Chip>
        ))}
      </ChipRow>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft">
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
            {activeCollection} ✕
          </button>
        ) : null}
      </div>
    </div>
  );
}

function ChipRow({ label, children }) {
  return (
    <div className="flex items-center gap-2">
      <span className="hidden shrink-0 text-[11px] font-semibold uppercase tracking-wider text-gold sm:inline">
        {label}
      </span>
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx("pill shrink-0", active ? "pill-on" : "pill-off")}
    >
      {children}
    </button>
  );
}
