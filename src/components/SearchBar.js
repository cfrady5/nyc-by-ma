"use client";

// Controlled search input with a pink "Search" button (matches the mockup).
// Search is live as you type; the button just submits/blurs for affordance.
export default function SearchBar({ value, onChange, placeholder }) {
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        e.currentTarget.querySelector("input")?.blur();
      }}
      className="relative"
    >
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
        placeholder={placeholder || "Search tacos, UWS, date night, coffee, museums…"}
        aria-label="Search recommendations"
        className="w-full rounded-full border border-ink/12 bg-white py-3 pl-11 pr-28 text-sm
                   text-ink placeholder:text-ink-soft/70 shadow-soft transition
                   focus:border-pink/60 focus:outline-none"
      />
      <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="rounded-full px-2 py-1 text-xs text-ink-soft hover:text-pink-deep"
          >
            Clear
          </button>
        ) : null}
        <button
          type="submit"
          className="rounded-full bg-pink px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-pink-deep"
        >
          Search
        </button>
      </div>
    </form>
  );
}
