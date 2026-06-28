"use client";

import BrandLogo from "./BrandLogo";

// Landing hero. Two CTAs scroll to the map / grid sections.
export default function Hero({ stats }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative overflow-hidden px-5 pb-12 pt-12 sm:pt-16">
      <div className="mx-auto max-w-4xl text-center">
        {/* Brand lockup */}
        <div className="mb-7 flex justify-center animate-fade-up">
          <BrandLogo variant="stacked" />
        </div>

        <p className="eyebrow mb-4">New York City · Curated by MA</p>

        <h1 className="font-serif text-balance text-5xl font-extrabold leading-[1.02] tracking-tight text-ink sm:text-7xl">
          NYC recs, <span className="italic text-pink">mapped.</span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-balance text-base leading-relaxed text-ink-soft sm:text-lg">
          Food, shopping, date nights, walks, museums, coffee, and hidden gems —
          all in one place.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => scrollTo("map")}
            className="btn-primary w-full sm:w-auto"
          >
            📍 Explore the Map
          </button>
          <button
            type="button"
            onClick={() => scrollTo("recs")}
            className="btn-secondary w-full sm:w-auto"
          >
            Browse All Recs
          </button>
        </div>

        {/* Stats row */}
        <dl className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-3 sm:gap-4">
          <Stat value={`${stats.count}+`} label="recommendations" />
          <Stat value={`${stats.neighborhoods}+`} label="neighborhoods" />
          <Stat value="Food · Culture" label="shopping & free fun" />
        </dl>
      </div>
    </section>
  );
}

function Stat({ value, label }) {
  return (
    <div className="surface px-3 py-4 sm:px-5">
      <dt className="font-serif text-lg font-bold text-pink-deep sm:text-2xl">{value}</dt>
      <dd className="mt-1 text-[11px] leading-tight text-ink-soft sm:text-xs">{label}</dd>
    </div>
  );
}
