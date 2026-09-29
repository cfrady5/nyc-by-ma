"use client";

import QR from "qrcode";
import { useMemo } from "react";

// Renders a QR code as INLINE SVG (synchronous, no network, no async) so it
// exports cleanly with html-to-image. `value` is the URL to encode.
export default function QRCode({ value, size = 320, fg = "#000000", bg = "#ffffff", margin = 2 }) {
  const matrix = useMemo(() => {
    try {
      const qr = QR.create(value || "https://instagram.com", { errorCorrectionLevel: "M" });
      return { size: qr.modules.size, data: qr.modules.data };
    } catch {
      return null;
    }
  }, [value]);

  if (!matrix) return null;

  const count = matrix.size;
  const total = count + margin * 2;
  const cell = size / total;
  const rects = [];
  for (let y = 0; y < count; y++) {
    for (let x = 0; x < count; x++) {
      if (matrix.data[y * count + x]) {
        rects.push(
          <rect
            key={`${x}-${y}`}
            x={(x + margin) * cell}
            y={(y + margin) * cell}
            width={cell}
            height={cell}
            fill={fg}
          />
        );
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges" role="img" aria-label="QR code">
      <rect width={size} height={size} fill={bg} />
      {rects}
    </svg>
  );
}
