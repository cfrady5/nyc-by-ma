"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { recommendations } from "@/data/recommendations";
import { getCategoryMeta } from "@/data/categories";
import { getGoogleMapsUrl, getVisitUrl, matchesQuery, cx } from "@/lib/utils";
import { useDayPlan } from "@/hooks/useDayPlan";
import { useSavedRecs } from "@/hooks/useSavedRecs";
import {
  VIBES,
  optimizeOrder,
  fetchTransitRoute,
  minutesToText,
  buildGoogleMapsLinks,
  buildAppleMapsLinks,
  buildItineraryText,
  encodePlan,
  decodePlan,
} from "@/lib/itinerary";

const byId = new Map(recommendations.map((r) => [r.id, r]));
const BOROUGHS = ["All NYC", "Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"];

// Route map preview is client-only (Leaflet) — loaded with ssr:false.
const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-blush-soft text-sm text-ink-soft">
      Loading map…
    </div>
  ),
});

export default function BuildYourDayClient() {
  const plan = useDayPlan();
  const { isSaved, toggleSaved } = useSavedRecs();

  const [vibe, setVibe] = useState("custom");
  const [borough, setBorough] = useState("All NYC");
  const [query, setQuery] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);
  const [segments, setSegments] = useState({}); // key `${a}->${b}` -> route
  const [optimizing, setOptimizing] = useState(false);

  // Load a shared plan from ?plan= once on mount (overrides current plan).
  useEffect(() => {
    if (!plan.hydrated) return;
    const params = new URLSearchParams(window.location.search);
    const shared = decodePlan(params.get("plan"));
    if (shared.length) {
      plan.replaceAll(shared);
      // clean the URL so a refresh doesn't re-apply
      window.history.replaceState({}, "", window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.hydrated]);

  // ---- Picker list (vibe + borough + search + saved) -----------------------
  const vibeDef = VIBES.find((v) => v.id === vibe);
  const picker = useMemo(() => {
    return recommendations.filter((rec) => {
      if (!matchesQuery(rec, query)) return false;
      if (borough !== "All NYC" && !(rec.borough || "").includes(borough)) return false;
      if (savedOnly && !isSaved(rec.id)) return false;
      if (vibeDef?.categories && !vibeDef.categories.includes(rec.category)) return false;
      if (vibeDef?.collections && !(rec.collectionTags || []).some((c) => vibeDef.collections.includes(c)))
        return false;
      return true;
    });
  }, [query, borough, savedOnly, vibeDef, isSaved]);

  // ---- Ordered stops (resolved recs) ---------------------------------------
  const orderedStops = useMemo(
    () => plan.stops.map((s) => ({ ...byId.get(s.id), minutes: s.minutes })).filter((s) => s.id),
    [plan.stops]
  );

  // ---- Fetch transit segments between consecutive stops --------------------
  useEffect(() => {
    let cancelled = false;
    async function run() {
      for (let i = 0; i < orderedStops.length - 1; i++) {
        const a = orderedStops[i];
        const b = orderedStops[i + 1];
        const key = `${a.id}->${b.id}`;
        if (segments[key]) continue;
        const route = await fetchTransitRoute(
          { lat: a.lat, lng: a.lng },
          { lat: b.lat, lng: b.lng }
        );
        if (cancelled) return;
        setSegments((prev) => ({ ...prev, [key]: route }));
      }
    }
    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderedStops.map((s) => s.id).join("|")]);

  // ---- Day summary ---------------------------------------------------------
  const summary = useMemo(() => {
    const activity = orderedStops.reduce((sum, s) => sum + (s.minutes || 0), 0);
    let travel = 0;
    let miles = 0;
    for (let i = 0; i < orderedStops.length - 1; i++) {
      const seg = segments[`${orderedStops[i].id}->${orderedStops[i + 1].id}`];
      if (seg?.durationMinutes) travel += seg.durationMinutes;
      if (seg?.distanceMiles) miles += seg.distanceMiles;
    }
    const boroughs = [...new Set(orderedStops.map((s) => s.borough).filter(Boolean))];
    return { activity, travel, total: activity + travel, miles, boroughs };
  }, [orderedStops, segments]);

  const handleOptimize = useCallback(() => {
    setOptimizing(true);
    const ordered = optimizeOrder(orderedStops);
    plan.setOrder(ordered.map((s) => s.id));
    setTimeout(() => setOptimizing(false), 350);
  }, [orderedStops, plan]);

  return (
    <>
      <Header />

      {/* Intro hero */}
      <section className="relative overflow-hidden px-5 pb-8 pt-12 text-center">
        <p className="eyebrow mb-3">Build Your Day</p>
        <h1 className="font-serif text-4xl font-extrabold tracking-tight text-ink sm:text-6xl">
          Build your perfect <span className="italic text-pink">NYC day.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-balance text-ink-soft">
          Choose your favorite spots, set how long you want to stay, and let NYC by MA
          map the prettiest route between them.
        </p>
      </section>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 pb-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* ---------------- LEFT: pick stops ---------------- */}
        <section aria-label="Choose stops" className="min-w-0 space-y-4">
          {/* Step 1 — vibe */}
          <div className="surface p-4">
            <StepLabel n={1} title="Choose a vibe" />
            <div className="no-scrollbar -mx-1 flex flex-wrap gap-2 px-1">
              {VIBES.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVibe(v.id)}
                  aria-pressed={vibe === v.id}
                  className={cx("pill", vibe === v.id ? "pill-on" : "pill-off")}
                >
                  <span aria-hidden="true" className="mr-1">{v.emoji}</span>
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2 — area + search */}
          <div className="surface p-4">
            <StepLabel n={2} title="Choose an area & find spots" />
            <div className="mb-3 flex flex-wrap gap-2">
              {BOROUGHS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBorough(b)}
                  aria-pressed={borough === b}
                  className={cx("pill text-xs", borough === b ? "pill-on" : "pill-off")}
                >
                  {b}
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" aria-hidden="true">🔍</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tacos, UWS, date night, coffee…"
                aria-label="Search recommendations to add"
                className="w-full rounded-full border border-ink/12 bg-white py-2.5 pl-11 pr-28 text-sm text-ink placeholder:text-ink-soft/70 shadow-soft focus:border-pink/60 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSavedOnly((s) => !s)}
                aria-pressed={savedOnly}
                className={cx(
                  "absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  savedOnly ? "bg-pink text-white" : "bg-blush text-pink-deep hover:bg-blush-soft"
                )}
              >
                ♥ Saved
              </button>
            </div>
          </div>

          {/* Step 3 — pick from list */}
          <div className="surface p-4">
            <StepLabel n={3} title={`Add stops (${picker.length})`} />
            <ul className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
              {picker.length === 0 ? (
                <li className="px-2 py-8 text-center text-sm text-ink-soft">
                  No spots match. Try another vibe, area, or search.
                </li>
              ) : (
                picker.map((rec) => {
                  const meta = getCategoryMeta(rec.category);
                  const added = plan.has(rec.id);
                  return (
                    <li
                      key={rec.id}
                      className="flex items-center gap-3 rounded-2xl border border-line bg-white p-2"
                    >
                      <CatIcon category={rec.category} className="h-14 w-14 shrink-0" emojiClass="text-2xl" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-ink">{rec.name}</p>
                        <p className="truncate text-xs text-ink-soft">
                          <span className="text-pink-deep">{meta.label}</span> · {rec.neighborhood}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => plan.toggle(rec.id)}
                        aria-pressed={added}
                        className={cx(
                          "btn-chip shrink-0",
                          added
                            ? "bg-pink text-white"
                            : "border border-pink/40 bg-white text-pink-deep hover:bg-blush-soft"
                        )}
                      >
                        {added ? "✓ Added" : "+ Add to Day"}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </section>

        {/* ---------------- RIGHT: itinerary ---------------- */}
        <section aria-label="Your itinerary" className="min-w-0 space-y-4">
          <DaySummary summary={summary} count={orderedStops.length} />

          {/* Map preview of selected stops */}
          <div className="surface overflow-hidden p-1.5">
            <div className="h-56 w-full overflow-hidden rounded-[1.1rem]">
              <MapView recs={orderedStops} />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-serif text-2xl font-bold text-ink">Your itinerary</h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleOptimize}
                disabled={orderedStops.length < 3}
                className="btn-secondary px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"
              >
                {optimizing ? "Optimizing…" : "✨ Optimize Route"}
              </button>
              <ExportMenu stops={orderedStops} segments={segments} />
              {orderedStops.length > 0 && (
                <button type="button" onClick={plan.clear} className="btn-chip border border-line bg-white text-ink-soft hover:bg-blush-soft">
                  Clear
                </button>
              )}
            </div>
          </div>

          {orderedStops.length === 0 ? (
            <div className="surface p-10 text-center">
              <div className="text-4xl">🗺️</div>
              <h3 className="mt-3 font-serif text-xl font-bold">No stops yet</h3>
              <p className="mx-auto mt-1 max-w-xs text-sm text-ink-soft">
                Add a coffee, a walk, a museum, or a dinner spot to start your day.
              </p>
            </div>
          ) : (
            <ol className="space-y-2">
              {orderedStops.map((stop, i) => {
                const seg = i < orderedStops.length - 1
                  ? segments[`${stop.id}->${orderedStops[i + 1].id}`]
                  : null;
                return (
                  <li key={stop.id}>
                    <StopCard
                      stop={stop}
                      index={i}
                      total={orderedStops.length}
                      onRemove={() => plan.remove(stop.id)}
                      onMove={(dir) => plan.move(stop.id, dir)}
                      onMinutes={(m) => plan.setMinutes(stop.id, m)}
                    />
                    {i < orderedStops.length - 1 && <TransitSegment seg={seg} />}
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </div>

      <Footer />
    </>
  );
}

/* ----------------------------- sub-components ----------------------------- */

// Category icon tile (used instead of photos in the planner).
function CatIcon({ category, className = "", emojiClass = "text-2xl" }) {
  const m = getCategoryMeta(category);
  return (
    <div
      className={cx("flex items-center justify-center rounded-xl", className)}
      style={{ background: `linear-gradient(135deg, ${m.color}22, #FDEDF1)` }}
      aria-hidden="true"
    >
      <span className={emojiClass}>{m.emoji}</span>
    </div>
  );
}

function StepLabel({ n, title }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink text-xs font-bold text-white">
        {n}
      </span>
      <h2 className="font-serif text-lg font-bold text-ink">{title}</h2>
    </div>
  );
}

function DaySummary({ summary, count }) {
  return (
    <div className="surface bg-gradient-to-br from-white to-blush-soft p-4">
      <p className="eyebrow">Day summary</p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryStat value={count} label={count === 1 ? "stop" : "stops"} />
        <SummaryStat value={minutesToText(summary.activity)} label="exploring" />
        <SummaryStat value={minutesToText(summary.travel)} label="travel" />
        <SummaryStat value={minutesToText(summary.total)} label="total day" />
      </div>
      <p className="mt-3 text-xs text-ink-soft">
        {summary.boroughs.length
          ? `${summary.boroughs.join(" · ")}${summary.miles ? ` · ~${summary.miles.toFixed(1)} mi` : ""}`
          : "Add stops to see your day come together."}
      </p>
    </div>
  );
}

function SummaryStat({ value, label }) {
  return (
    <div className="rounded-xl bg-white/70 px-2 py-2 text-center">
      <div className="font-serif text-base font-bold leading-tight text-pink-deep">{value}</div>
      <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-soft">{label}</div>
    </div>
  );
}

function StopCard({ stop, index, total, onRemove, onMove, onMinutes }) {
  const meta = getCategoryMeta(stop.category);
  return (
    <div className="surface flex gap-3 p-3">
      <div className="flex flex-col items-center gap-1">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pink text-sm font-bold text-white">
          {index + 1}
        </span>
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label="Move stop up"
            className="text-ink-soft hover:text-pink disabled:opacity-25"
          >▲</button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            aria-label="Move stop down"
            className="text-ink-soft hover:text-pink disabled:opacity-25"
          >▼</button>
        </div>
      </div>

      <CatIcon category={stop.category} className="h-20 w-20 shrink-0" emojiClass="text-3xl" />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-serif text-base font-bold text-ink">{stop.name}</h3>
            <p className="truncate text-xs text-ink-soft">
              <span className="font-semibold text-pink-deep">{meta.label}</span> · {stop.neighborhood}
              {stop.borough ? ` · ${stop.borough}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${stop.name}`}
            className="shrink-0 rounded-full bg-blush px-2 py-1 text-xs font-semibold text-pink-deep hover:bg-pink hover:text-white"
          >
            Remove
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {/* Duration editor */}
          <div className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-1">
            <button type="button" onClick={() => onMinutes(stop.minutes - 15)} aria-label="Less time" className="px-2 text-ink-soft hover:text-pink">−</button>
            <span className="min-w-[3.5rem] text-center text-xs font-semibold text-ink">{stop.minutes} min</span>
            <button type="button" onClick={() => onMinutes(stop.minutes + 15)} aria-label="More time" className="px-2 text-ink-soft hover:text-pink">+</button>
          </div>
          <a href={getVisitUrl(stop)} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-pink-deep hover:underline">Visit ↗</a>
          <a href={getGoogleMapsUrl(stop)} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-ink-soft hover:underline">Map ↗</a>
        </div>
      </div>
    </div>
  );
}

function ExportMenu({ stops, segments }) {
  const [open, setOpen] = useState(false);
  const [appleLegs, setAppleLegs] = useState(false);
  const [toast, setToast] = useState("");
  const canRoute = stops.length >= 2;

  const google = useMemo(() => buildGoogleMapsLinks(stops), [stops]);
  const apple = useMemo(() => buildAppleMapsLinks(stops), [stops]);

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  };
  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      flash("Copied!");
    } catch {
      flash("Copy failed");
    }
  };
  const shareUrl = () =>
    `${window.location.origin}/build?plan=${encodeURIComponent(encodePlan(stops))}`;

  if (!stops.length) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="btn-primary px-4 py-2 text-xs"
      >
        Export Route {open ? "▴" : "▾"}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-line bg-white p-3 shadow-card">
          {toast && (
            <div className="mb-2 rounded-lg bg-pink/10 px-3 py-1.5 text-center text-xs font-semibold text-pink-deep">
              {toast}
            </div>
          )}

          {/* Google Maps */}
          <p className="px-1 text-[11px] font-bold uppercase tracking-wider text-gold">Google Maps</p>
          {!canRoute ? (
            <p className="px-1 py-1 text-xs text-ink-soft">Add at least 2 stops.</p>
          ) : (
            <>
              {google.links.map((l) => (
                <a
                  key={l.url}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg px-2 py-1.5 text-sm text-ink hover:bg-blush-soft"
                >
                  🗺️ {l.label} (transit)
                </a>
              ))}
              {google.split && (
                <p className="px-2 pb-1 text-[11px] text-mauve">
                  Long route split into parts (Google Maps limits stops per link).
                </p>
              )}
            </>
          )}

          {/* Apple Maps */}
          <p className="mt-2 px-1 text-[11px] font-bold uppercase tracking-wider text-gold">Apple Maps</p>
          {!canRoute ? (
            <p className="px-1 py-1 text-xs text-ink-soft">Add at least 2 stops.</p>
          ) : stops.length === 2 ? (
            <a href={apple.single} target="_blank" rel="noopener noreferrer" className="block rounded-lg px-2 py-1.5 text-sm text-ink hover:bg-blush-soft"> Open in Apple Maps</a>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setAppleLegs((v) => !v)}
                className="block w-full rounded-lg px-2 py-1.5 text-left text-sm text-ink hover:bg-blush-soft"
              >
                 Open each leg in Apple Maps {appleLegs ? "▴" : "▾"}
              </button>
              {appleLegs && (
                <div className="max-h-40 overflow-y-auto">
                  {apple.legs.map((leg, i) => (
                    <a
                      key={i}
                      href={leg.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate rounded-lg px-3 py-1 text-xs text-ink-soft hover:bg-blush-soft"
                    >
                      {i + 1}. {leg.label}
                    </a>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Copy / share */}
          <div className="mt-2 border-t border-line pt-2">
            <button
              type="button"
              onClick={() => copy(buildItineraryText(stops, segments))}
              className="block w-full rounded-lg px-2 py-1.5 text-left text-sm text-ink hover:bg-blush-soft"
            >
              📋 Copy itinerary
            </button>
            <button
              type="button"
              onClick={() => copy(shareUrl())}
              className="block w-full rounded-lg px-2 py-1.5 text-left text-sm text-ink hover:bg-blush-soft"
            >
              🔗 Copy share link
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TransitSegment({ seg }) {
  return (
    <div className="my-1 ml-3 border-l-2 border-dashed border-pink/30 pl-5 text-xs text-ink-soft">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
        <span aria-hidden="true">🚇</span>
        {!seg ? (
          <span>Finding the prettiest route…</span>
        ) : (
          <>
            <span className="font-semibold text-ink">{seg.durationText}</span>
            <span>· {seg.distanceText}</span>
            <span className="text-ink-soft">· {seg.routeSummary}</span>
            {seg.fallback && (
              <span className="rounded-full bg-butter-soft px-2 py-0.5 text-[10px] text-mauve">
                estimate
              </span>
            )}
          </>
        )}
      </div>
      {seg?.steps?.length ? (
        <div className="flex flex-wrap gap-1 pb-2">
          {seg.steps.map((s, i) =>
            s.type === "subway" ? (
              <span key={i} className="rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold text-white">
                {s.line || "subway"}
              </span>
            ) : (
              <span key={i} className="rounded-full bg-white px-2 py-0.5 text-[10px] text-ink-soft ring-1 ring-line">
                walk {s.durationText}
              </span>
            )
          )}
        </div>
      ) : null}
    </div>
  );
}
