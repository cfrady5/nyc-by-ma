// =============================================================================
// HERO DECORATIVE ART (purely decorative — aria-hidden)
// =============================================================================
// Soft, romantic NYC atmosphere flanking the hero, built as lightweight inline
// SVG so there are no heavy image downloads and everything stays crisp + on
// palette. Both sides are low-opacity and gradient-masked so they dissolve into
// the cream background and never compete with the headline. Hidden on small
// screens to keep mobile clean.
// =============================================================================

// Left: faded Empire State skyline + cherry blossom branch + "xoxo, MA".
export function HeroArtLeft() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 hidden h-full w-[28%] max-w-[420px] select-none lg:block"
      style={{
        WebkitMaskImage:
          "linear-gradient(to right, black 30%, transparent 100%), linear-gradient(to bottom, black 70%, transparent 100%)",
        WebkitMaskComposite: "source-in",
        maskImage:
          "linear-gradient(to right, black 30%, transparent 100%), linear-gradient(to bottom, black 70%, transparent 100%)",
        maskComposite: "intersect",
      }}
    >
      <svg
        viewBox="0 0 420 620"
        className="absolute bottom-0 left-0 h-[88%] w-full"
        fill="none"
        preserveAspectRatio="xMinYMax meet"
      >
        {/* skyline silhouettes */}
        <g opacity="0.5" fill="#F7D6DE">
          <rect x="20" y="300" width="46" height="320" rx="3" />
          <rect x="74" y="240" width="40" height="380" rx="3" />
          <rect x="150" y="330" width="52" height="290" rx="3" />
        </g>
        {/* Empire State-style stepped tower */}
        <g opacity="0.6" fill="#EFC3CF">
          <rect x="104" y="150" width="54" height="470" rx="4" />
          <rect x="116" y="110" width="30" height="60" rx="3" />
          <rect x="127" y="78" width="8" height="40" />
        </g>
        {/* cherry blossom branch */}
        <g opacity="0.85">
          <path
            d="M0 470 C70 450 120 470 180 430 C210 410 235 420 270 400"
            stroke="#D99BB0"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M70 462 C90 430 80 405 60 392"
            stroke="#D99BB0"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          {[
            [58, 388],
            [120, 452],
            [180, 430],
            [232, 414],
            [268, 400],
            [95, 470],
            [150, 440],
          ].map(([cx, cy], i) => (
            <Blossom key={i} cx={cx} cy={cy} />
          ))}
        </g>
      </svg>

      {/* Handwritten gold accent */}
      <span
        className="absolute left-[14%] top-[34%] -rotate-6 font-script text-3xl text-gold/80"
        style={{ textShadow: "0 1px 0 rgba(255,255,255,0.4)" }}
      >
        xoxo, MA
        <span className="ml-1 align-middle text-base text-heart/70">♥</span>
      </span>
    </div>
  );
}

// Right: blush-toned NYC building facade with fire-escape details.
export function HeroArtRight() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute right-0 top-0 hidden h-full w-[24%] max-w-[360px] select-none lg:block"
      style={{
        WebkitMaskImage: "linear-gradient(to left, black 35%, transparent 100%)",
        maskImage: "linear-gradient(to left, black 35%, transparent 100%)",
      }}
    >
      <svg
        viewBox="0 0 360 620"
        className="absolute right-0 top-0 h-full w-full"
        fill="none"
        preserveAspectRatio="xMaxYMid slice"
      >
        {/* facade wall */}
        <rect x="120" y="0" width="240" height="620" fill="#F8DCE2" opacity="0.42" />
        {/* window grid */}
        <g opacity="0.5" fill="#FFFFFF" stroke="#E7B9C6" strokeWidth="2">
          {Array.from({ length: 6 }).flatMap((_, row) =>
            Array.from({ length: 3 }).map((__, col) => (
              <rect
                key={`${row}-${col}`}
                x={150 + col * 66}
                y={36 + row * 96}
                width="44"
                height="64"
                rx="4"
              />
            ))
          )}
        </g>
        {/* fire escape verticals + rails */}
        <g opacity="0.4" stroke="#C98AA0" strokeWidth="3" strokeLinecap="round">
          <line x1="138" y1="20" x2="138" y2="600" />
          <line x1="206" y1="20" x2="206" y2="600" />
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={i} x1="138" y1={40 + i * 96} x2="206" y2={40 + i * 96} />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={`d${i}`} x1="138" y1={40 + i * 96} x2="206" y2={88 + i * 96} />
          ))}
        </g>
      </svg>
    </div>
  );
}

function Blossom({ cx, cy }) {
  return (
    <g transform={`translate(${cx} ${cy})`} opacity="0.9">
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse
          key={a}
          cx="0"
          cy="-7"
          rx="4.6"
          ry="7"
          fill="#F7C6D5"
          transform={`rotate(${a})`}
        />
      ))}
      <circle r="2.4" fill="#E8A23D" />
    </g>
  );
}
