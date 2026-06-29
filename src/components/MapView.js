"use client";

// -----------------------------------------------------------------------------
// LEAFLET MAP (client-only)
// -----------------------------------------------------------------------------
// This component is dynamically imported with { ssr: false } from MapSection,
// so Leaflet only ever runs in the browser — preventing Next.js hydration
// errors and "window is not defined" crashes during server rendering.
// -----------------------------------------------------------------------------

import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getCategoryMeta } from "@/data/categories";
import { getGoogleMapsUrl, getVisitUrl } from "@/lib/utils";

// Manhattan-ish center + default zoom.
const NYC_CENTER = [40.7766, -73.9772];
const DEFAULT_ZOOM = 12;

// Build a branded divIcon for a category (colored circle + emoji).
// Using divIcons avoids the classic Leaflet "broken default marker image" 404.
function buildIcon(category) {
  const { color, emoji } = getCategoryMeta(category);
  return L.divIcon({
    className: "nyc-pin",
    html: `
      <div style="
        width:34px;height:34px;border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        background:${color};
        border:2px solid rgba(255,255,255,0.9);
        box-shadow:0 6px 14px -4px rgba(0,0,0,0.7), 0 0 0 4px ${color}33;
        display:flex;align-items:center;justify-content:center;">
        <span style="transform:rotate(45deg);font-size:15px;line-height:1;">${emoji}</span>
      </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 32],
    popupAnchor: [0, -30],
  });
}

// Keeps the visible map area in sync with the currently filtered pins.
function FitToPins({ recs }) {
  const map = useMap();
  const prevKey = useRef("");

  useEffect(() => {
    // Recompute only when the actual set of pins changes (not on every render).
    const key = recs.map((r) => r.id).join("|");
    if (key === prevKey.current) return;
    prevKey.current = key;

    if (!recs.length) return;
    if (recs.length === 1) {
      map.setView([recs[0].lat, recs[0].lng], 15, { animate: true });
      return;
    }
    const bounds = L.latLngBounds(recs.map((r) => [r.lat, r.lng]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15, animate: true });
  }, [recs, map]);

  return null;
}

// Pans to a focused rec (sidebar click) and opens its popup.
function FocusController({ focusId, recs, markerRefs }) {
  const map = useMap();
  useEffect(() => {
    if (!focusId) return;
    const rec = recs.find((r) => r.id === focusId);
    if (!rec) return;
    map.setView([rec.lat, rec.lng], Math.max(map.getZoom(), 15), { animate: true });
    const m = markerRefs.current[focusId];
    if (m) m.openPopup();
  }, [focusId, recs, map, markerRefs]);
  return null;
}

export default function MapView({ recs, onViewDetails, focusId }) {
  // Cache one icon per category so we don't rebuild them on every render.
  const iconCache = useMemo(() => ({}), []);
  const iconFor = (category) => {
    if (!iconCache[category]) iconCache[category] = buildIcon(category);
    return iconCache[category];
  };
  const markerRefs = useRef({});

  return (
    <MapContainer
      center={NYC_CENTER}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom={false}
      className="h-full w-full"
      // Friendly defaults for touch devices.
      tap={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitToPins recs={recs} />
      <FocusController focusId={focusId} recs={recs} markerRefs={markerRefs} />

      {recs.map((rec) => {
        const meta = getCategoryMeta(rec.category);
        return (
          <Marker
            key={rec.id}
            position={[rec.lat, rec.lng]}
            icon={iconFor(rec.category)}
            ref={(m) => {
              if (m) markerRefs.current[rec.id] = m;
            }}
          >
            <Popup>
              <div style={{ minWidth: 200, maxWidth: 240 }}>
                <strong style={{ fontSize: 15, color: "#211a1c" }}>{rec.name}</strong>
                <div style={{ fontSize: 12, color: "#AE155F", marginTop: 2, fontWeight: 600 }}>
                  {rec.neighborhood}
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    marginTop: 6,
                    padding: "2px 9px",
                    borderRadius: 999,
                    background: "#FDEEF1",
                    color: "#211a1c",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 999,
                      background: meta.color,
                      display: "inline-block",
                    }}
                  />
                  {meta.emoji} {meta.label}
                </div>
                <p style={{ fontSize: 12.5, color: "#6F6166", margin: "8px 0 10px" }}>
                  {rec.recommendation}
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => onViewDetails?.(rec)}
                    style={popupBtn("#FFFFFF", "#211a1c", "1px solid rgba(33,26,28,0.15)")}
                  >
                    View Details
                  </button>
                  <a
                    href={getVisitUrl(rec)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={popupBtn("#D81B79", "#fff")}
                  >
                    Visit Now →
                  </a>
                  <a
                    href={getGoogleMapsUrl(rec)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={popupBtn("#FFFFFF", "#211a1c", "1px solid rgba(33,26,28,0.15)")}
                  >
                    📍 Open in Maps
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

// Inline style helper for the popup buttons (popups are outside Tailwind's reach
// in some cases, so we style them directly for reliability).
function popupBtn(bg, color, border = "none") {
  return {
    display: "block",
    textAlign: "center",
    width: "100%",
    padding: "8px 10px",
    borderRadius: 999,
    background: bg,
    color,
    border,
    fontSize: 12.5,
    fontWeight: 700,
    cursor: "pointer",
    textDecoration: "none",
  };
}
