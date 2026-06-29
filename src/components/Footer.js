import Logo from "./Logo";

// Site footer with brand, a short personal note from MA, and Instagram CTA.
export default function Footer() {
  return (
    <footer id="site-footer" className="mt-14 border-t border-line bg-ivory/70 px-5 py-14">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <Logo variant="inline" tone="color" imgClassName="h-20 w-auto sm:h-24" />

        <p className="mt-4 font-script text-2xl text-pink-deep">NYC by MA</p>

        {/* About MA */}
        <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
          Hi, I&apos;m <span className="font-semibold text-ink">Mary Ashley Stevenson</span> —
          sharing the food, coffee, shopping, date nights, and hidden gems that
          make New York City feel like home. Made for saving the best NYC recs in
          one place.
        </p>

        <a
          href="https://www.instagram.com/NYC_BY_MA/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary mt-6"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
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
