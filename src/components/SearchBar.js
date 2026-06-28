"use client";

// Controlled search input. Lives in the sticky bar with the filter pills.
export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative">
      <span
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft"
        aria-hidden="true"
      >
        🔍
      </span>
      <input
        type="search"
        inputMode="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search tacos, UWS, date night, coffee…"
        aria-label="Search recommendations"
        className="w-full rounded-full border border-ink/12 bg-white py-3 pl-11 pr-20 text-sm
                   text-ink placeholder:text-ink-soft/70 shadow-soft transition
                   focus:border-pink/60 focus:outline-none"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full bg-blush px-3 py-1 text-xs font-medium text-pink-deep hover:bg-blush-soft"
        >
          Clear
        </button>
      ) : null}
    </div>
  );
}
