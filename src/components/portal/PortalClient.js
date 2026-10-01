"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePortalStudio } from "@/hooks/usePortalStudio";
import LocationForm from "./LocationForm";
import ThemePanel from "./ThemePanel";
import LocationCard from "./LocationCard";
import Slideshow from "./Slideshow";
import SlideEditor from "./SlideEditor";
import { cx } from "@/lib/utils";

const SESSION_KEY = "nyc_by_ma_portal_authed";
const CREDS_KEY = "nyc_by_ma_portal_creds";

export default function PortalClient() {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      setAuthed(window.sessionStorage.getItem(SESSION_KEY) === "1");
    } catch {
      /* ignore */
    }
    setChecked(true);
  }, []);

  const handleAuthed = (creds) => {
    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
      if (creds) window.sessionStorage.setItem(CREDS_KEY, JSON.stringify(creds));
    } catch {
      /* ignore */
    }
    setAuthed(true);
  };

  const handleLock = () => {
    try {
      window.sessionStorage.removeItem(SESSION_KEY);
      window.sessionStorage.removeItem(CREDS_KEY);
    } catch {
      /* ignore */
    }
    setAuthed(false);
  };

  if (!checked) return null; // avoid a flash of the gate before we read the session

  return authed ? <Studio onLock={handleLock} /> : <PasswordGate onSuccess={handleAuthed} />;
}

// -----------------------------------------------------------------------------
// PASSWORD GATE
// -----------------------------------------------------------------------------
function PasswordGate({ onSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/portal-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) onSuccess({ username, password });
      else setError("That username or password isn't right.");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="surface w-full max-w-sm p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blush text-2xl">
          🔒
        </div>
        <h1 className="font-serif text-2xl font-extrabold text-ink">Creator portal</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Enter the password to build themed location slideshows.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            autoFocus
            autoComplete="username"
            className="w-full rounded-xl border border-ink/12 bg-white px-4 py-3 text-center text-sm text-ink focus:border-pink/50 focus:outline-none"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            className="w-full rounded-xl border border-ink/12 bg-white px-4 py-3 text-center text-sm text-ink focus:border-pink/50 focus:outline-none"
          />
          {error ? <p className="text-xs font-medium text-heart">{error}</p> : null}
          <button type="submit" disabled={busy} className="btn-primary w-full py-3 disabled:opacity-50">
            {busy ? "Checking…" : "Enter"}
          </button>
        </form>
        <Link href="/" className="mt-5 inline-block text-xs font-semibold text-pink-deep hover:text-pink">
          ← Back to the site
        </Link>
      </div>
    </main>
  );
}

// -----------------------------------------------------------------------------
// STUDIO
// -----------------------------------------------------------------------------
function Studio({ onLock }) {
  const studio = usePortalStudio();
  const [tab, setTab] = useState("add"); // "add" | "theme"
  const [playing, setPlaying] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState(null); // { ok, text }

  const { hydrated, theme, updateTheme, applyPreset, locations } = studio;
  const editing = locations.find((l) => l.id === editingId) || null;
  const editingIndex = editing ? locations.findIndex((l) => l.id === editingId) : -1;

  // Location slides that can go on the map (need coordinates).
  const mappable = locations.filter(
    (l) => (l.type || "location") === "location" && Number.isFinite(l.lat) && Number.isFinite(l.lng)
  );
  const locationCount = locations.filter((l) => (l.type || "location") === "location").length;

  const publishToSite = async () => {
    setPublishing(true);
    setPublishMsg(null);
    let creds = null;
    try {
      creds = JSON.parse(window.sessionStorage.getItem(CREDS_KEY) || "null");
    } catch {
      creds = null;
    }
    if (!creds) {
      setPublishing(false);
      setPublishMsg({ ok: false, text: "Please Lock and sign in again to publish." });
      return;
    }
    try {
      const res = await fetch("/api/publish-locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: creds.username,
          password: creds.password,
          locations: mappable.map((l) => ({
            id: l.id,
            name: l.name,
            neighborhood: l.neighborhood,
            borough: l.borough,
            category: l.category,
            website: l.website,
            address: l.address,
            caption: l.caption,
            lat: l.lat,
            lng: l.lng,
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setPublishMsg({
          ok: true,
          text: `Published ${data.published} location${data.published === 1 ? "" : "s"} to the site${
            data.skipped ? ` · ${data.skipped} skipped (missing address)` : ""
          }. The live map updates within a minute.`,
        });
      } else {
        setPublishMsg({ ok: false, text: data.error || "Publish failed. Please try again." });
      }
    } catch {
      setPublishMsg({ ok: false, text: "Couldn't reach the server. Please try again." });
    } finally {
      setPublishing(false);
    }
  };

  if (!hydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-ink-soft">Loading your studio…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Creator portal</p>
          <h1 className="mt-1 font-serif text-3xl font-extrabold tracking-tight text-ink">
            Slideshow <span className="italic text-pink">studio</span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={publishToSite}
            disabled={publishing || mappable.length === 0}
            title={mappable.length === 0 ? "Add locations with an address first" : ""}
            className="inline-flex items-center gap-1.5 rounded-full border border-gold/50 bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-gold hover:bg-butter-soft disabled:opacity-40"
          >
            {publishing ? "Publishing…" : `⬆ Add all to website${mappable.length ? ` (${mappable.length})` : ""}`}
          </button>
          <button
            type="button"
            onClick={() => setPlaying(true)}
            disabled={locations.length === 0}
            className="btn-primary px-5 py-2.5 text-sm disabled:opacity-40"
          >
            ▶ Play slideshow
          </button>
          <button type="button" onClick={onLock} className="btn-secondary px-4 py-2.5 text-sm">
            Lock
          </button>
        </div>
      </div>

      {publishMsg ? (
        <div
          className={cx(
            "mb-4 flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm",
            publishMsg.ok ? "border-green-300 bg-green-50 text-green-800" : "border-heart/30 bg-blush-soft text-heart"
          )}
        >
          <span>{publishMsg.text}</span>
          <button type="button" onClick={() => setPublishMsg(null)} aria-label="Dismiss" className="shrink-0 opacity-60 hover:opacity-100">
            ✕
          </button>
        </div>
      ) : null}

      {locationCount > 0 && mappable.length < locationCount ? (
        <p className="mb-4 text-xs text-ink-soft">
          Tip: {locationCount - mappable.length} location{locationCount - mappable.length === 1 ? "" : "s"} have no
          address yet, so they won’t appear on the map. Use “Find by address” when adding a location to set its spot.
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        {/* Left: controls */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="surface p-4">
            <div className="mb-4 flex rounded-full bg-blush-soft p-1">
              <TabBtn active={tab === "add"} onClick={() => setTab("add")}>
                Add location
              </TabBtn>
              <TabBtn active={tab === "theme"} onClick={() => setTab("theme")}>
                Theme &amp; style
              </TabBtn>
            </div>
            {tab === "add" ? (
              <LocationForm onAdd={studio.addLocation} />
            ) : (
              <ThemePanel theme={theme} onApplyPreset={applyPreset} onUpdate={updateTheme} />
            )}
          </div>
        </div>

        {/* Right: the deck */}
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-ink-soft">
              <span className="font-semibold text-ink">{locations.length}</span>{" "}
              {locations.length === 1 ? "slide" : "slides"}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditingId(studio.addCover())}
                className="rounded-full border border-ink/12 bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-pink/40 hover:bg-blush-soft"
              >
                ＋ Cover slide
              </button>
              <button
                type="button"
                onClick={() => setEditingId(studio.addEnd())}
                className="rounded-full border border-ink/12 bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-pink/40 hover:bg-blush-soft"
              >
                ＋ End slide (QR)
              </button>
            </div>
          </div>

          {locations.length === 0 ? (
            <div className="surface flex flex-col items-center justify-center p-12 text-center">
              <div className="text-4xl">🗽</div>
              <p className="mt-3 font-serif text-lg font-bold text-ink">No slides yet</p>
              <p className="mt-1 max-w-xs text-sm text-ink-soft">
                Add your first location on the left, or start with a cover slide — each one appears
                here as a themed slide instantly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {locations.map((loc, i) => (
                <LocationCard
                  key={loc.id}
                  location={loc}
                  theme={theme}
                  index={i}
                  total={locations.length}
                  onEdit={setEditingId}
                  onRemove={studio.removeLocation}
                  onMove={studio.moveLocation}
                />
              ))}
            </div>
          )}

          <p className="mt-5 text-xs text-ink-soft/80">
            Slides are saved on this device. Tap any slide to edit it fully. Use “Play slideshow” to
            preview full-screen and download each slide as an image for Instagram.
          </p>
        </div>
      </div>

      {editing ? (
        <SlideEditor
          location={editing}
          theme={theme}
          index={editingIndex}
          total={locations.length}
          studio={studio}
          onClose={() => setEditingId(null)}
        />
      ) : null}

      {playing ? (
        <Slideshow theme={theme} locations={locations} onClose={() => setPlaying(false)} />
      ) : null}
    </main>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition",
        active ? "bg-white text-pink-deep shadow-soft" : "text-ink-soft hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}
