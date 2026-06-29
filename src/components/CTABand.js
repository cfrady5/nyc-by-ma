import { getCategoryImage } from "@/data/categories";

// Soft closing CTA band above the footer. Postcards reuse category covers.
const POSTCARDS = [
  { src: getCategoryImage("Free Activity"), rotate: "-rotate-6", z: "z-10" },
  { src: getCategoryImage("Dessert"), rotate: "rotate-3", z: "z-20" },
  { src: getCategoryImage("Culture"), rotate: "rotate-[8deg]", z: "z-0" },
];

export default function CTABand() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      <div className="relative overflow-hidden rounded-[2rem] border border-line bg-gradient-to-br from-blush-soft via-blush to-lavender-soft p-8 shadow-soft sm:p-12">
        <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="font-serif text-3xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-4xl">
              Your NYC.
              <br />
              Beautifully <span className="italic text-pink">mapped.</span>
            </h2>
            <p className="mt-3 max-w-md text-sm text-ink-soft">
              Save your favorites, build your perfect day, and never run out of
              places to love.
            </p>
            <a href="/build" className="btn-primary mt-6">
              Build Your Day
            </a>
          </div>

          {/* Overlapping postcards */}
          <div className="relative hidden h-44 lg:block" aria-hidden="true">
            {POSTCARDS.map((p, i) =>
              p.src ? (
                <div
                  key={i}
                  className={`absolute left-1/2 top-1/2 h-36 w-28 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border-4 border-white shadow-card ${p.rotate} ${p.z}`}
                  style={{ marginLeft: `${(i - 1) * 70}px` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.src} alt="" className="h-full w-full object-cover" loading="lazy" />
                </div>
              ) : null
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
