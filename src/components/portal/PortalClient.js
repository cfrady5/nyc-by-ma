"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePortalStudio } from "@/hooks/usePortalStudio";
import LocationForm from "./LocationForm";
import ThemePanel from "./ThemePanel";
import LocationCard from "./LocationCard";
import Slideshow from "./Slideshow";
import { cx } from "@/lib/utils";

const SESSION_KEY = "nyc_by_ma_portal_authed";

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

  const handleAuthed = () => {
    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    setAuthed(true);
  };

  const handleLock = () => {
    try {
      window.sessionStorage.removeItem(SESSION_KEY);
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
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) onSuccess();
      else setError("That password isn't right.");
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
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
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

  const { hydrated, theme, updateTheme, applyPreset, locations } = studio;

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
        <div className="flex items-center gap-2">
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
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-ink-soft">
              <span className="font-semibold text-ink">{locations.length}</span>{" "}
              {locations.length === 1 ? "slide" : "slides"}
            </p>
          </div>

          {locations.length === 0 ? (
            <div className="surface flex flex-col items-center justify-center p-12 text-center">
              <div className="text-4xl">🗽</div>
              <p className="mt-3 font-serif text-lg font-bold text-ink">No slides yet</p>
              <p className="mt-1 max-w-xs text-sm text-ink-soft">
                Add your first location on the left — it appears here as a themed slide instantly.
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
                  onUpdate={studio.updateLocation}
                  onRemove={studio.removeLocation}
                  onMove={studio.moveLocation}
                />
              ))}
            </div>
          )}

          <p className="mt-5 text-xs text-ink-soft/80">
            Slides are saved on this device. Use “Play slideshow” to preview full-screen and download
            each slide as an image for Instagram.
          </p>
        </div>
      </div>

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
