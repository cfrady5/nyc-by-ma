"use client";

import { useRef, useState } from "react";
import { fileToScaledDataUrl } from "@/lib/imageResize";

// Add a new slide location: name, neighborhood, caption, and a photo (which is
// downscaled client-side before it's stored). Resets after a successful add.
export default function LocationForm({ onAdd }) {
  const [name, setName] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setWorking(true);
    try {
      const url = await fileToScaledDataUrl(file);
      setImage(url);
    } catch (err) {
      setError(err.message || "Couldn't process that image.");
    } finally {
      setWorking(false);
    }
  };

  const reset = () => {
    setName("");
    setNeighborhood("");
    setCaption("");
    setImage("");
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Give the spot a name.");
      return;
    }
    onAdd({ name, neighborhood, caption, image });
    reset();
  };

  const field =
    "w-full rounded-xl border border-ink/12 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/70 focus:border-pink/50 focus:outline-none";

  return (
    <form onSubmit={submit} className="space-y-3">
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
        <label className="mb-1 block text-xs font-semibold text-ink">Photo</label>
        <div className="flex items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="block w-full text-xs text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-blush file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-pink-deep hover:file:bg-pink-soft/60"
          />
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="preview" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
          ) : null}
        </div>
        {working ? <p className="mt-1 text-xs text-ink-soft">Processing image…</p> : null}
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
