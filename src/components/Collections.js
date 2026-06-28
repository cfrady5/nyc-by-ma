"use client";

import { COLLECTIONS, recInCollection } from "@/data/collections";
import { cx } from "@/lib/utils";

// Curated collection cards. Clicking one filters the grid to that collection
// (handled by the parent via onSelect) and scrolls down to the results.
export default function Collections({ recs, activeCollection, onSelect }) {
  return (
    <section id="collections" className="mx-auto max-w-6xl px-4 py-14">
      <div className="mb-8 text-center">
        <p className="eyebrow">Curated by MA</p>
        <h2 className="mt-2 font-serif text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Collections <span className="italic text-pink">for every mood</span>
        </h2>
        <div className="gold-rule mt-4" />
        <p className="mx-auto mt-4 max-w-xl text-sm text-ink-soft">
          Tap a collection to instantly filter the map and the grid.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {COLLECTIONS.map((c) => {
          const count = recs.filter((r) => recInCollection(r, c.name)).length;
          const isActive = activeCollection === c.name;
          return (
            <button
              key={c.name}
              type="button"
              onClick={() => onSelect(c.name)}
              aria-pressed={isActive}
              className={cx(
                "surface group relative overflow-hidden p-4 text-left transition duration-300 hover:-translate-y-1 hover:shadow-glow",
                isActive && "ring-2 ring-pink"
              )}
            >
              {/* Decorative blush wash */}
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-40 blur-2xl transition group-hover:opacity-70"
                style={{ background: "radial-gradient(circle, #F7D9DF, transparent 70%)" }}
                aria-hidden="true"
              />
              <div className="relative">
                <div className="text-2xl" aria-hidden="true">
                  {c.emoji}
                </div>
                <h3 className="mt-2 font-serif text-sm font-bold leading-tight text-ink">
                  {c.title}
                </h3>
                <p className="mt-0.5 text-[11px] leading-snug text-ink-soft">{c.subtitle}</p>
                <p className="mt-2 text-[11px] font-semibold text-pink-deep">{count} spots →</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
