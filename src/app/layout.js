import { Montserrat, Playfair_Display, Parisienne, Zilla_Slab } from "next/font/google";
import "./globals.css";

// Clean & modern sans for all body / UI text.
const sans = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

// Editorial serif for headings — bold & timeless.
const serif = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

// Playful & elegant script for the "MA" monogram + tasteful accents.
const script = Parisienne({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-script",
  display: "swap",
});

// Bold slab for the iconic "NY" mark in the logo lockup.
const slab = Zilla_Slab({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-slab",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://nyc-by-ma.vercel.app"),
  title: "NYC by MA — NYC recs, mapped.",
  description:
    "A feminine, editorial guide to NYC's best food, shopping, date nights, walks, museums, coffee, and hidden gems — all mapped in one place.",
  keywords: [
    "NYC recommendations",
    "New York City guide",
    "things to do in NYC",
    "NYC food map",
    "Upper West Side",
    "NYC by MA",
  ],
  openGraph: {
    title: "NYC by MA — NYC recs, mapped.",
    description:
      "Food, shopping, date nights, walks, museums, coffee, and hidden gems — all in one place.",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#FBF5EF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} ${script.variable} ${slab.variable}`}
    >
      <body className="font-sans">{children}</body>
    </html>
  );
}
