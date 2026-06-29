"use client";

import Logo from "./Logo";
import { HeroArtLeft, HeroArtRight } from "./HeroArt";

// Editorial hero. Real logo IMAGE (not CSS) anchors the brand; decorative NYC
// art flanks the centered content column. Kept airy — search & filters follow
// immediately below (no stat cards), so the product is usable fast.
export default function Hero() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative overflow-hidden px-5 pb-10 pt-10 sm:pt-14">
      <HeroArtLeft />
      <HeroArtRight />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {/* Brand logo — the real uploaded image asset */}
        <div className="mb-6 flex justify-center animate-fade-up">
          <Logo
            variant="stacked"
            tone="color"
            imgClassName="h-36 w-auto sm:h-48"
          />
        </div>

        <p className="eyebrow mb-4">New York City · Curated by Mary Ashley Stevenson</p>

        <h1 className="font-serif text-balance text-[2.6rem] font-extrabold leading-[1.04] tracking-tight text-ink sm:text-6xl lg:text-7xl">
          NYC, <span className="italic text-pink">mapped</span> by MA.
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-balance text-base leading-relaxed text-ink-soft sm:text-lg">
          Thoughtfully curated recs for food, coffee, shopping, date nights,
          walks, museums, and hidden gems in New York City.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => scrollTo("map")}
            className="btn-primary w-full sm:w-auto"
          >
            <PinIcon /> Explore the Map
          </button>
          <button
            type="button"
            onClick={() => scrollTo("recs")}
            className="btn-secondary w-full text-pink-deep sm:w-auto"
          >
            Browse All Recs
          </button>
        </div>
      </div>
    </section>
  );
}

/* small inline pin icon for the primary CTA (no emoji, crisp at any size) */
function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
