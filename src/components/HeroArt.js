// =============================================================================
// HERO DECORATIVE ART (purely decorative — aria-hidden)
// =============================================================================
// Real, hand-picked NYC imagery flanking the hero:
//   • left  — Empire State + cherry blossoms + a gold "xoxo, MA" (baked in)
//   • right — a blush line-art Statue of Liberty + skyline
//
// Both images already fade to cream toward the center; we anchor each to its
// outer edge and add a soft mask so the inner edge dissolves seamlessly into
// the page. Optimized WebP (~40KB each). Hidden on smaller screens so mobile
// stays clean. Swap the files in /public/brand/ to change the artwork.
// =============================================================================

export function HeroArtLeft() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 hidden h-full w-[40%] max-w-[480px] select-none lg:block"
      style={{
        WebkitMaskImage: "linear-gradient(to right, black 35%, transparent 96%)",
        maskImage: "linear-gradient(to right, black 35%, transparent 96%)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/left.webp"
        alt=""
        className="h-full w-full object-cover object-left opacity-95"
      />
    </div>
  );
}

export function HeroArtRight() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute right-0 top-0 hidden h-full w-[38%] max-w-[460px] select-none lg:block"
      style={{
        WebkitMaskImage: "linear-gradient(to left, black 35%, transparent 96%)",
        maskImage: "linear-gradient(to left, black 35%, transparent 96%)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/right.webp"
        alt=""
        className="h-full w-full object-cover object-right opacity-95"
      />
    </div>
  );
}
