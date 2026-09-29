"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { fileToScaledDataUrl } from "@/lib/imageResize";

// The map picker is client-only (Leaflet) — load it on demand.
const MapPicker = dynamic(() => import("./MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-blush-soft text-xs text-ink-soft">
      Loading map…
    </div>
  ),
});

// Add a new slide location. You can type an address / business name and let the
// lookup fill in the exact spot (map pin) and the official website, or fill the
// fields in by hand. Photos are downscaled client-side before they're stored.
export default function LocationForm({ onAdd }) {
  const [name, setName] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [caption, setCaption] = useState("");
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const fileRef = useRef(null);

  // Address-lookup state
  const [lookupQuery, setLookupQuery] = useState("");
  const [looking, setLooking] = useState(false);
  const [lookupMsg, setLookupMsg] = useState("");
  const [place, setPlace] = useState(null); // { address, website, lat, lng, source, websiteMatched }
  const [coords, setCoords] = useState({ lat: null, lng: null });

  const handleFile = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setError("");
    setWorking(true);
    try {
      const urls = [];
      for (const f of files) {
        try {
          urls.push(await fileToScaledDataUrl(f));
        } catch {
          /* skip bad file */
        }
      }
      if (urls.length) setImages((prev) => [...prev, ...urls]);
    } catch (err) {
      setError(err.message || "Couldn't process those images.");
    } finally {
      setWorking(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const runLookup = async (e) => {
    e?.preventDefault();
    const q = lookupQuery.trim();
    if (!q) return;
    setLooking(true);
    setLookupMsg("");
    try {
      const res = await fetch("/api/place-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json().catch(() => ({}));
      if (!data.found) {
        setPlace(null);
        setLookupMsg(data.message || "No match found.");
        return;
      }
      setPlace(data);
      setCoords({ lat: data.lat, lng: data.lng });
      // Prefill fields (only overwrite name/neighborhood if empty so manual edits stick).
      if (!name.trim() && data.name) setName(data.name);
      if (!neighborhood.trim() && data.neighborhood) setNeighborhood(data.neighborhood);
      setLookupMsg(
        data.websiteMatched
          ? "Matched — website found."
          : data.source === "osm"
          ? "Location found (add a website manually — needs Google key for auto-match)."
          : "Location found (no website listed for this place)."
      );
    } catch {
      setLookupMsg("Lookup failed. Please try again.");
    } finally {
      setLooking(false);
    }
  };

  const reset = () => {
    setName("");
    setNeighborhood("");
    setCaption("");
    setImages([]);
    setError("");
    setLookupQuery("");
    setLookupMsg("");
    setPlace(null);
    setCoords({ lat: null, lng: null });
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Give the spot a name.");
      return;
    }
    onAdd({
      name,
      neighborhood,
      caption,
      images,
      address: place?.address || "",
      website: place?.website || "",
      lat: coords.lat,
      lng: coords.lng,
    });
    reset();
  };

  const field =
    "w-full rounded-xl border border-ink/12 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/70 focus:border-pink/50 focus:outline-none";

  return (
    <form onSubmit={submit} className="space-y-3">
      {/* Address / business lookup */}
      <div className="rounded-xl border border-pink/20 bg-blush-soft/50 p-3">
        <label className="mb-1 block text-xs font-semibold text-ink">Find by address or name</label>
        <div className="flex gap-2">
          <input
            value={lookupQuery}
            onChange={(e) => setLookupQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") runLookup(e);
            }}
            placeholder="Levain Bakery, 351 Amsterdam Ave"
            className={field}
          />
          <button
            type="button"
            onClick={runLookup}
            disabled={looking || !lookupQuery.trim()}
            className="shrink-0 rounded-xl bg-pink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-deep disabled:opacity-50"
          >
            {looking ? "…" : "Find"}
          </button>
        </div>
        {lookupMsg ? <p className="mt-2 text-xs font-medium text-pink-deep">{lookupMsg}</p> : null}

        {coords.lat != null ? (
          <>
            <div className="mt-3 h-40 overflow-hidden rounded-xl ring-1 ring-ink/10">
              <MapPicker lat={coords.lat} lng={coords.lng} onChange={setCoords} />
            </div>
            <p className="mt-1.5 text-[11px] text-ink-soft">
              Drag the pin or tap the map to fine-tune the exact spot.
            </p>
            {place?.address ? (
              <p className="mt-1 text-[11px] text-ink-soft">📍 {place.address}</p>
            ) : null}
            {place?.website ? (
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block max-w-full truncate text-[11px] font-semibold text-pink-deep hover:underline"
              >
                🔗 {place.website.replace(/^https?:\/\//, "")}
              </a>
            ) : null}
          </>
        ) : null}
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-ink">Name *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Levain Bakery"
          className={field}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-ink">Neighborhood / area</label>
        <input
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          placeholder="Upper West & East Side"
          className={field}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-ink">Caption</label>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={3}
          placeholder="Newly added collab w/ Cafe Panna Ice Cream. So good."
          className={`${field} resize-none`}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-ink">Photos (add one or more)</label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFile}
          className="block w-full text-xs text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-blush file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-pink-deep hover:file:bg-pink-soft/60"
        />
        {images.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {images.map((src, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-12 w-12 rounded-lg object-cover ring-1 ring-ink/10" />
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-heart text-[10px] font-bold text-white"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : null}
        {working ? <p className="mt-1 text-xs text-ink-soft">Processing images…</p> : null}
        <p className="mt-1 text-[11px] text-ink-soft/80">You can add more photos and arrange them after adding.</p>
      </div>

      {error ? <p className="text-xs font-medium text-heart">{error}</p> : null}

      <div className="flex gap-2">
        <button type="submit" disabled={working} className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-50">
          Add to slideshow
        </button>
        <button type="button" onClick={reset} className="btn-secondary px-4 py-2.5 text-sm">
          Clear
        </button>
      </div>
    </form>
  );
}
