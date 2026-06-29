"use client";

import { recInCollection } from "@/data/collections";
import { getCategoryImage } from "@/data/categories";
import { cx } from "@/lib/utils";

// Curated, pastel "kind of day" collection cards (matches the mockup). Each
// card filters the grid — most by a collection tag, one (Brunch) by category.
// `bg` uses brand pastels; `img` reuses a category cover when it fits.
const HOME_COLLECTIONS = [
  { title: "Girls’ Day Shopping", kind: "collection", value: "Girls’ Day Shopping", bg: "bg-blush-soft", emoji: "🛍️", img: null },
  { title: "Brunch Favorites", kind: "category", value: "Brunch", bg: "bg-butter-soft", emoji: "🥞", img: getCategoryImage("Brunch") },
  { title: "Coffee + Sweet Treats", kind: "collection", value: "Coffee + Sweet Treats", bg: "bg-lavender-soft", emoji: "☕", img: getCategoryImage("Coffee") },
  { title: "Date Night Guide", kind: "collection", value: "Date Night / Special Occasion", bg: "bg-blush-soft", emoji: "💗", img: getCategoryImage("Food & Drink") },
  { title: "Culture Day", kind: "collection", value: "Culture Day", bg: "bg-butter-soft", emoji: "🎨", img: getCategoryImage("Culture") },
  { title: "Budget Friendly", kind: "collection", value: "Budget-Friendly", bg: "bg-lavender-soft", emoji: "🚲", img: getCategoryImage("Free Activity") },
];

export default function Collections({ recs, onPick, onViewAll }) {
  const countFor = (c) =>
    c.kind === "collection"
      ? recs.filter((r) => recInCollection(r, c.value)).length
      : recs.filter((r) => r.category === c.value).length;

  return (
    <section id="collections" className="mx-auto max-w-6xl px-4 py-14">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="eyebrow">Browse by collection</p>
          <h2 className="mt-1 font-serif text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Curated for every <span className="italic text-pink">kind of day</span>
          </h2>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="text-sm font-semibold text-pink-deep transition hover:text-pink"
        >
          View all collections →
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {HOME_COLLECTIONS.map((c) => {
          const count = countFor(c);
          return (
            <button
              key={c.title}
              type="button"
              onClick={() => onPick(c)}
              className={cx(
                "group flex flex-col overflow-hidden rounded-3xl border border-line text-left shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-glow",
                c.bg
              )}
            >
              <div className="flex h-24 items-center justify-center overflow-hidden">
                {c.img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.img}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <span className="text-4xl" aria-hidden="true">{c.emoji}</span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-3">
                <h3 className="font-serif text-sm font-bold leading-tight text-ink">{c.title}</h3>
                <p className="mt-1 text-[11px] font-semibold text-ink-soft">
                  {count} {count === 1 ? "spot" : "spots"}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
