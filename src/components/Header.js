"use client";

import Logo from "./Logo";

// Slim, elegant sticky top nav. Works on the homepage (where onNav scrolls to
// sections) and on other pages like /build (where links navigate to "/#id").
export default function Header({ onNav, onFavorites }) {
  // id present → in-page section; page:true → a real route.
  const LINKS = [
    { label: "Explore", id: "recs", href: "/#recs" },
    { label: "Map", id: "map", href: "/#map" },
    { label: "Build Your Day", href: "/build", page: true },
    { label: "Guides", id: "collections", href: "/#collections" },
    { label: "Favorites", id: "favorites", href: "/#recs", fav: true },
    { label: "About MA", id: "site-footer", href: "/#site-footer" },
  ];

  const renderLink = (l) => {
    // Real route → always a normal navigation.
    if (l.page) {
      return (
        <a key={l.label} href={l.href} className="nav-link">
          {l.label}
        </a>
      );
    }
    // On the homepage we have handlers → intercept and scroll/toggle in place.
    if (l.fav && onFavorites) {
      return (
        <button key={l.label} type="button" onClick={() => onFavorites()} className="nav-link">
          {l.label}
        </button>
      );
    }
    if (onNav && l.id) {
      return (
        <a
          key={l.label}
          href={l.href}
          onClick={(e) => {
            e.preventDefault();
            onNav(l.id);
          }}
          className="nav-link"
        >
          {l.label}
        </a>
      );
    }
    // Other pages → plain cross-page anchor.
    return (
      <a key={l.label} href={l.href} className="nav-link">
        {l.label}
      </a>
    );
  };

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-line bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4">
        <a
          href="/"
          aria-label="NYC by MA — home"
          className="flex shrink-0 items-center transition hover:opacity-80"
        >
          <Logo variant="inline" tone="color" imgClassName="h-10 w-auto sm:h-11" />
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-0.5 md:flex">
          {LINKS.map(renderLink)}
        </nav>

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
            <span className="text-heart" aria-hidden="true">♥</span>
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
