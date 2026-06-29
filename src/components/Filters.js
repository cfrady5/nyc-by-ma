"use client";

import { FILTERS } from "@/data/filters";
import { cx } from "@/lib/utils";

export const BOROUGHS = ["All Boroughs", "Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"];

// Group the category filters for the dropdown's optgroups.
const GROUPS = [
  { key: "category", label: "Categories" },
  { key: "vibe", label: "Vibes" },
  { key: "neighborhood", label: "Neighborhoods" },
];

// Sticky search bar with inline filter dropdowns (Borough + Category) and a
// Saved toggle — no chip rows. Drives both the results list and the map pins.
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
  return (
    <div className="sticky top-16 z-30 border-b border-line bg-cream/90 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          {/* Search */}
          <div className="min-w-0 flex-1">{children}</div>

          {/* Filter dropdowns + Saved */}
          <div className="flex flex-wrap items-center gap-2">
            <SelectPill
              label="Borough"
              value={borough}
              onChange={onBoroughChange}
              options={BOROUGHS.map((b) => ({ value: b, label: b }))}
              active={borough !== "All Boroughs"}
            />

            <CategorySelect
              value={savedOnly ? "All" : activeFilter}
              onChange={(v) => onFilterChange(v)}
              active={!savedOnly && activeFilter !== "All"}
            />

            <button
              type="button"
              onClick={onToggleSaved}
              aria-pressed={savedOnly}
              className={cx("pill shrink-0", savedOnly ? "pill-on" : "pill-off")}
            >
              ♥ Saved{savedCount ? ` (${savedCount})` : ""}
            </button>
          </div>
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

// A styled native <select> shaped like a pill (accessible + mobile-friendly).
function SelectPill({ label, value, onChange, options, active }) {
  return (
    <label className="relative shrink-0">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cx(
          "appearance-none rounded-full border py-2 pl-4 pr-9 text-sm font-medium transition focus:outline-none",
          active
            ? "border-transparent bg-pink text-white shadow-glow"
            : "border-ink/12 bg-white text-ink hover:border-pink/40"
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-white text-ink">
            {o.label}
          </option>
        ))}
      </select>
      <span
        className={cx(
          "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs",
          active ? "text-white" : "text-ink-soft"
        )}
        aria-hidden="true"
      >
        ▾
      </span>
    </label>
  );
}

// Category select with optgroups (All + categories / vibes / neighborhoods).
function CategorySelect({ value, onChange, active }) {
  return (
    <label className="relative shrink-0">
      <span className="sr-only">Category</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cx(
          "appearance-none rounded-full border py-2 pl-4 pr-9 text-sm font-medium transition focus:outline-none",
          active
            ? "border-transparent bg-pink text-white shadow-glow"
            : "border-ink/12 bg-white text-ink hover:border-pink/40"
        )}
      >
        <option value="All" className="bg-white text-ink">All categories</option>
        {GROUPS.map((g) => (
          <optgroup key={g.key} label={g.label}>
            {FILTERS.filter((f) => f.group === g.key).map((f) => (
              <option key={f.label} value={f.label} className="bg-white text-ink">
                {f.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <span
        className={cx(
          "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs",
          active ? "text-white" : "text-ink-soft"
        )}
        aria-hidden="true"
      >
        ▾
      </span>
    </label>
  );
}
