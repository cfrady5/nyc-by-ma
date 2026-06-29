"use client";

import SearchBar from "./SearchBar";
import { FILTERS } from "@/data/filters";
import { cx } from "@/lib/utils";

export const BOROUGHS = ["All Boroughs", "Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"];

const GROUPS = [
  { key: "category", label: "Categories" },
  { key: "vibe", label: "Vibes" },
  { key: "neighborhood", label: "Neighborhoods" },
];

// The search + filter controls (search, Borough, Category, Saved). Designed to
// live at the top of the map sidebar (vertical stack), not a sticky bar.
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
    <div className="space-y-2 border-b border-line p-3">
      <SearchBar value={query} onChange={onQuery} placeholder="Search tacos, UWS, coffee…" />

      <div className="flex flex-wrap gap-2">
        <SelectPill
          label="Borough"
          value={borough}
          onChange={onBorough}
          active={borough !== "All Boroughs"}
          options={BOROUGHS.map((b) => ({ value: b, label: b }))}
        />
        <CategorySelect
          value={savedOnly ? "All" : activeFilter}
          onChange={onFilter}
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

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5 text-xs text-ink-soft">
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

function SelectPill({ label, value, onChange, options, active }) {
  return (
    <label className="relative shrink-0">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cx(
          "appearance-none rounded-full border py-2 pl-4 pr-9 text-sm font-medium transition focus:outline-none",
          active ? "border-transparent bg-pink text-white shadow-glow" : "border-ink/12 bg-white text-ink hover:border-pink/40"
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-white text-ink">
            {o.label}
          </option>
        ))}
      </select>
      <span className={cx("pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs", active ? "text-white" : "text-ink-soft")} aria-hidden="true">▾</span>
    </label>
  );
}

function CategorySelect({ value, onChange, active }) {
  return (
    <label className="relative shrink-0">
      <span className="sr-only">Category</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cx(
          "appearance-none rounded-full border py-2 pl-4 pr-9 text-sm font-medium transition focus:outline-none",
          active ? "border-transparent bg-pink text-white shadow-glow" : "border-ink/12 bg-white text-ink hover:border-pink/40"
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
      <span className={cx("pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs", active ? "text-white" : "text-ink-soft")} aria-hidden="true">▾</span>
    </label>
  );
}
