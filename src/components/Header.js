"use client";

import Logo from "./Logo";

// Slim, elegant sticky top nav. The sticky filter bar sits below it (top-16).
export default function Header({ onNav, onFavorites }) {
  const go = (id) => (e) => {
    e.preventDefault();
    onNav?.(id);
  };

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-line bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4">
        {/* Brand logo (real image) */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          aria-label="NYC by MA — back to top"
          className="flex shrink-0 items-center transition hover:opacity-80"
        >
          <Logo variant="inline" tone="color" imgClassName="h-10 w-auto sm:h-11" />
        </a>

        {/* Center nav links (desktop) */}
        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          <a href="#recs" onClick={go("recs")} className="nav-link">
            Explore
          </a>
          <a href="#map" onClick={go("map")} className="nav-link">
            Map
          </a>
          <a href="#collections" onClick={go("collections")} className="nav-link">
            Guides
          </a>
          <button type="button" onClick={() => onFavorites?.()} className="nav-link">
            Favorites
          </button>
          <a href="#site-footer" onClick={go("site-footer")} className="nav-link">
            About MA
          </a>
        </nav>

        {/* Right: socials + Follow */}
        <div className="flex shrink-0 items-center gap-1.5">
          <a
            href="https://www.instagram.com/NYC_BY_MA/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="NYC by MA on Instagram"
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink/70 transition hover:border-pink/40 hover:text-pink-deep sm:flex"
          >
            <IgIcon />
          </a>
          <a
            href="https://www.instagram.com/NYC_BY_MA/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-pink/40 bg-white px-3.5 py-1.5 text-xs font-semibold text-pink-deep transition hover:bg-pink hover:text-white"
          >
            Follow MA
            <span className="text-heart" aria-hidden="true">
              ♥
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}

function IgIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}
