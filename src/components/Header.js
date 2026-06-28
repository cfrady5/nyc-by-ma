"use client";

import Logo from "./Logo";

// Slim sticky top bar with the brand logo + Instagram link.
// Sits above the sticky filter bar (which sticks at top-14 / 56px below this).
export default function Header() {
  const toTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-line bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
        {/* Brand logo (transparent lockup) */}
        <a
          href="#top"
          onClick={toTop}
          aria-label="NYC by MA — back to top"
          className="flex items-center transition hover:opacity-80"
        >
          {/* Scaled down slightly so it sits comfortably in the slim bar. */}
          <span className="origin-left scale-[0.78] sm:scale-90">
            <Logo variant="inline" tone="color" />
          </span>
        </a>

        {/* Instagram link */}
        <a
          href="https://www.instagram.com/nyc_by_ma/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow NYC by MA on Instagram"
          className="inline-flex items-center gap-2 rounded-full border border-ink/12 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink transition hover:border-pink/40 hover:bg-blush-soft"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
            <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
          </svg>
          <span className="hidden sm:inline">Follow</span>
        </a>
      </div>
    </header>
  );
}
