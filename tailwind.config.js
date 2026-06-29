/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ---- NYC by MA brand palette --------------------------------------
        // Feminine, editorial, "luxury bakery / boutique guidebook" — soft
        // cream + blush, hot pink, butter yellow, lavender, gold, charcoal,
        // with a red heart accent. Tweak here to restyle the whole site.
        cream: "#FCF4EC", // warm page background
        ivory: "#FFFFFF", // card surface
        ink: {
          DEFAULT: "#241F21", // charcoal text + "NY" mark
          soft: "#6F6268", // muted body text
        },
        line: "rgba(36,31,33,0.10)", // soft hairline borders
        blush: {
          DEFAULT: "#F7D6DE",
          soft: "#FDEDF1",
        },
        pink: {
          DEFAULT: "#DF1B7D", // primary hot pink (CTAs, active states, accents)
          soft: "#F2A6C6",
          deep: "#B0185F", // hover / high-contrast
        },
        mauve: "#8E6A87",
        lavender: {
          DEFAULT: "#D9C6E8",
          soft: "#ECE3F5",
        },
        butter: {
          DEFAULT: "#FFF1B8", // warm yellow micro-accent
          soft: "#FFF8DD",
        },
        gold: "#C99A3D", // metallic-ish accent for premium details
        heart: "#E60023", // the red heart / red accent
      },
      fontFamily: {
        // Clean & modern sans for body + UI.
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        // Editorial display serif for headings.
        serif: ["var(--font-serif)", "Georgia", "serif"],
        // Elegant script for handwritten accents ("xoxo, MA").
        script: ["var(--font-script)", "cursive"],
        // Bold slab (fallback for the "NY" mark only).
        slab: ["var(--font-slab)", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 18px 45px rgba(36,31,33,0.08)",
        card: "0 22px 60px -30px rgba(36,31,33,0.20)",
        glow: "0 14px 38px -16px rgba(223,27,125,0.32)",
        gold: "0 14px 38px -18px rgba(201,154,61,0.40)",
      },
      backgroundImage: {
        "gold-line":
          "linear-gradient(90deg, transparent, rgba(201,154,61,0.6), transparent)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-heart": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.2)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "pulse-heart": "pulse-heart 0.4s ease-in-out",
      },
    },
  },
  plugins: [],
};
