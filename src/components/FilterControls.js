"use client";

import { useState } from "react";
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

// Only the true categories become chips here. Vibe filters get their own small
// row; neighborhood filters are intentionally dropped from the panel (Borough +
// the search box already cover location) to keep this calm, not a wall of chips.
const CATEGORY_FILTERS = FILTERS.filter((f) => f.group === "category");
const VIBE_FILTERS = FILTERS.filter((f) => f.group === "vibe");

// Vertical left-sidebar filter panel for the map explorer. Boroughs, categories
// and vibes are MULTI-SELECT (chips toggle on/off); within a facet selections
// are OR'd. On small screens the chip groups collapse behind a "Filters" toggle
// so the map is visible first; on lg+ the sidebar is always open.
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
  const [open, setOpen] = useState(false);

  // How many facet selections are active (for the mobile toggle badge).
  const activeCount =
    boroughs.length +
    activeFilters.length +
    (savedOnly ? 1 : 0) +
    (activeCollection ? 1 : 0);

  return (
    <div className="space-y-3 p-3 sm:p-4">
      <SearchBar value={query} onChange={onQuery} />

      {/* Result count + clear all (always visible) */}
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

      {/* Mobile-only toggle: keeps the panel calm until you want to filter. */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-full border border-ink/12 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-pink/40 lg:hidden"
      >
        <span className="flex items-center gap-2">
          Filters &amp; sort
          {activeCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-pink px-1.5 text-[11px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </span>
        <span className={cx("text-xs text-ink-soft transition-transform", open && "rotate-180")} aria-hidden="true">
          ▾
        </span>
      </button>

      {/* Collapsible groups: hidden on small screens until toggled; always shown on lg+ */}
      <div className={cx("space-y-4", open ? "block" : "hidden lg:block")}>
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
          <Chip active={activeFilters.length === 0 && !savedOnly} onClick={() => onToggleFilter("All")}>
            All
          </Chip>
          <Chip active={savedOnly} onClick={onToggleSaved}>
            ♥ Saved{savedCount ? ` (${savedCount})` : ""}
          </Chip>
          {CATEGORY_FILTERS.map((f) => (
            <Chip key={f.label} active={activeFilters.includes(f.label)} onClick={() => onToggleFilter(f.label)}>
              {f.label}
            </Chip>
          ))}
        </Group>

        {/* Vibe (multi-select) */}
        <Group label="Vibe">
          {VIBE_FILTERS.map((f) => (
            <Chip key={f.label} active={activeFilters.includes(f.label)} onClick={() => onToggleFilter(f.label)}>
              {f.label}
            </Chip>
          ))}
        </Group>
      </div>
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
