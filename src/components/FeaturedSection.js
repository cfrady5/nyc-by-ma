"use client";

import RecommendationCard from "./RecommendationCard";

// "Handpicked favorites" — a content preview right under the hero so the
// product is useful immediately: a stylized mini-map card beside a horizontal
// row of real recommendation cards. All data is real; cards reuse the same
// component (and save / Visit / Maps logic) as the main grid.
export default function FeaturedSection({ recs, isSaved, onToggleSave, onViewMap, onViewAll }) {
  if (!recs.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="eyebrow">Featured recs</p>
          <h2 className="mt-1 font-serif text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Handpicked favorites{" "}
            <span className="align-middle text-heart" aria-hidden="true">
              ♥
            </span>
          </h2>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="text-sm font-semibold text-pink-deep transition hover:text-pink"
        >
          View all recs →
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* Mini map preview */}
        <MiniMap onViewMap={onViewMap} />

        {/* Featured cards — horizontal scroll */}
        <div className="no-scrollbar -mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
          {recs.map((rec) => (
            <div key={rec.id} className="w-[17rem] shrink-0 sm:w-[18rem]">
              <RecommendationCard
                rec={rec}
                isSaved={isSaved(rec.id)}
                onToggleSave={onToggleSave}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Stylized, on-brand mini map of Manhattan with pink pins (decorative preview).
function MiniMap({ onViewMap }) {
  return (
    <div className="surface relative h-72 overflow-hidden lg:h-full">
      <svg
        viewBox="0 0 300 420"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <rect width="300" height="420" fill="#EEF4F2" />
        {/* rivers */}
        <rect x="0" y="0" width="46" height="420" fill="#DCEAF1" />
        <rect x="250" y="0" width="50" height="420" fill="#DCEAF1" />
        {/* landmass */}
        <path d="M46 0 H250 V420 H46 Z" fill="#FBF5EF" />
        {/* avenues */}
        <g stroke="#EAD9DC" strokeWidth="2">
          {[80, 120, 160, 200].map((x) => (
            <line key={x} x1={x} y1="0" x2={x} y2="420" />
          ))}
          {[60, 120, 180, 240, 300, 360].map((y) => (
            <line key={y} x1="46" y1={y} x2="250" y2={y} />
          ))}
        </g>
        {/* Central Park */}
        <rect x="120" y="70" width="56" height="120" rx="4" fill="#E6F0DE" />
        {/* pins */}
        {[
          [95, 110],
          [150, 60],
          [200, 150],
          [110, 210],
          [175, 250],
          [135, 320],
          [90, 360],
        ].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <path
              d="M0 0 C-7 -10 -12 -16 0 -26 C12 -16 7 -10 0 0 Z"
              fill="#DF1B7D"
              transform="translate(0 2)"
            />
            <circle cx="0" cy="-17" r="3.4" fill="#fff" />
          </g>
        ))}
      </svg>

      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-soft backdrop-blur">
        Manhattan
      </span>

      <button
        type="button"
        onClick={onViewMap}
        className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-ink shadow-soft backdrop-blur transition hover:bg-white"
      >
        View Map
      </button>
    </div>
  );
}
