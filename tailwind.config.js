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
        // Feminine, editorial, "luxury bakery" — soft cream + blush, butter
        // yellow, lavender, gold, with a black anchor and a pop of red.
        // Tweak these in one place to restyle the whole site.
        cream: "#FBF5EF", // warm page background
        ivory: "#FFFDFB", // lightest surface
        ink: {
          DEFAULT: "#211A1C", // warm near-black (primary text + "NY" mark)
          soft: "#6F6166", // muted text
        },
        line: "#ECDDE0", // soft hairline borders on cream
        blush: {
          DEFAULT: "#F7D9DF",
          soft: "#FDEEF1",
        },
        pink: {
          DEFAULT: "#D81B79", // primary accent (CTAs, MA script, active states)
          soft: "#F2A6C6",
          deep: "#AE155F", // hover / high-contrast
        },
        mauve: "#C98BA0",
        lavender: {
          DEFAULT: "#9B7BD4",
          soft: "#E7DDF6",
        },
        butter: {
          DEFAULT: "#EFCB6A", // warm yellow accent
          soft: "#FBF0CB",
        },
        gold: "#BC9A56", // metallic-ish accent for premium details
        heart: "#E4002B", // the red heart / red accent
      },
      fontFamily: {
        // Clean & modern sans for body + UI.
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        // Editorial serif for headings (bold & timeless).
        serif: ["var(--font-serif)", "Georgia", "serif"],
        // Playful & elegant script for the "MA" monogram + accents.
        script: ["var(--font-script)", "cursive"],
        // Bold slab for the "NY" mark in the logo lockup.
        slab: ["var(--font-slab)", "Georgia", "serif"],
      },
      boxShadow: {
        // Soft, warm, diffuse shadows — not neon. Editorial, premium.
        soft: "0 18px 50px -28px rgba(33,26,28,0.35)",
        card: "0 22px 60px -34px rgba(33,26,28,0.40)",
        glow: "0 14px 38px -16px rgba(216,27,121,0.40)",
        gold: "0 14px 38px -18px rgba(188,154,86,0.45)",
      },
      backgroundImage: {
        "gold-line":
          "linear-gradient(90deg, transparent, rgba(188,154,86,0.6), transparent)",
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
