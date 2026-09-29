"use client";

import { useLayoutEffect, useRef, useState } from "react";
import SlideCard, { SLIDE_W, SLIDE_H } from "./SlideCard";

// Renders a fixed-size SlideCard scaled to fit its container width, so the
// preview and the exported PNG use the exact same rendering code.
export default function ScaledSlide({ theme, location, index = 0, total = 1, className, style }) {
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(0.32);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      if (w) setScale(w / SLIDE_W);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ width: "100%", height: SLIDE_H * scale, ...style }}
    >
      <div style={{ width: SLIDE_W, height: SLIDE_H, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <SlideCard theme={theme} location={location} index={index} total={total} />
      </div>
    </div>
  );
}
