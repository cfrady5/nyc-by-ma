"use client";

// Small interactive Leaflet map with ONE draggable pin, used in the portal to
// confirm / fine-tune a looked-up address. Client-only (dynamic import with
// ssr:false from the form). Clicking the map or dragging the pin updates the
// coordinates via onChange({ lat, lng }).

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const pinIcon = L.divIcon({
  className: "nyc-pin",
  html: `
    <div style="
      width:30px;height:30px;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      background:#DF1B7D;
      border:2px solid rgba(255,255,255,0.95);
      box-shadow:0 6px 14px -4px rgba(0,0,0,0.6), 0 0 0 4px rgba(223,27,125,0.2);">
    </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 28],
});

function Recenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      map.setView([lat, lng], Math.max(map.getZoom(), 15), { animate: true });
    }
  }, [lat, lng, map]);
  return null;
}

function ClickToPlace({ onChange }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function MapPicker({ lat, lng, onChange }) {
  const hasPin = Number.isFinite(lat) && Number.isFinite(lng);
  const center = hasPin ? [lat, lng] : [40.7766, -73.9772];

  return (
    <MapContainer center={center} zoom={hasPin ? 15 : 12} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Recenter lat={lat} lng={lng} />
      <ClickToPlace onChange={onChange} />
      {hasPin ? (
        <Marker
          position={[lat, lng]}
          icon={pinIcon}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const p = e.target.getLatLng();
              onChange({ lat: p.lat, lng: p.lng });
            },
          }}
        />
      ) : null}
    </MapContainer>
  );
}
