import Logo from "./Logo";

// Site footer with brand + Instagram CTA.
export default function Footer() {
  return (
    <footer className="mt-14 border-t border-line bg-ivory/70 px-5 py-14">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <Logo variant="inline" tone="color" />

        <p className="mt-4 font-script text-2xl text-pink-deep">NYC by MA</p>

        <p className="mt-3 max-w-md text-sm text-ink-soft">
          Made for saving the best NYC recs in one place.
        </p>

        <a
          href="https://www.instagram.com/nyc_by_ma/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary mt-6"
        >
          {/* Instagram glyph */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="shrink-0"
          >
            <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
            <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
          </svg>
          Follow on Instagram
        </a>

        <div className="gold-rule mt-10" />
        <p className="mt-5 text-xs text-ink-soft/80">
          © {new Date().getFullYear()} NYC by MA · Built with Next.js, Leaflet & OpenStreetMap
        </p>
      </div>
    </footer>
  );
}
