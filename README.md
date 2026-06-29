# NYC by MA — NYC recs, mapped. 🗽💗

An editorial, searchable guide to the best of NYC — built from
[`@NYC_BY_MA`](https://www.instagram.com/NYC_BY_MA/)'s Instagram recommendations.

Browse an interactive map, search by name / neighborhood / tag, filter by
category, save your favorites, open Google Maps, and jump straight to each
place's website with a **Visit Now** button.

![Stack](https://img.shields.io/badge/Next.js-16-black) ![Map](https://img.shields.io/badge/Leaflet-OpenStreetMap-green) ![Styling](https://img.shields.io/badge/Tailwind-CSS-D81B79)

---

## ✨ Features

- 🗺️ **Interactive map** (Leaflet + OpenStreetMap, no API keys) with custom
  category pins that update live as you search and filter.
- 🔍 **Smart search** across name, neighborhood, category, tags, collections,
  and the recommendation text.
- 🏷️ **Filter pills** by category, vibe (Date Night, Budget-Friendly), and
  neighborhood (UWS, UES, West Village, Soho, Midtown, Central Park).
- 🧺 **Curated collections** (Free NYC Day, Girls' Day Shopping, Date Night, …).
- 💗 **Save** spots to revisit later (persisted in `localStorage`).
- 🖼️ **Graceful image fallback** — missing photos become a pretty
  "Photo coming soon" placeholder, so the UI never breaks.
- 📱 **Mobile-first**, fully responsive, accessible, and Vercel-ready.

---

## 🚀 Run locally

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev

# 3. Open the app
#    http://localhost:3000
```

Other scripts:

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # lint
```

> Requires **Node 18.17+** (Node 20+ recommended).

---

## 🗂️ Project structure

```
nyc-by-ma/
├─ public/
│  ├─ brand/                      # ← drop your own logo here (optional)
│  └─ recommendation-photos/      # ← put place photos here
├─ src/
│  ├─ app/
│  │  ├─ layout.js                # fonts, metadata, global styles
│  │  ├─ page.js                  # page shell (Server Component)
│  │  ├─ globals.css              # Tailwind + theme + Leaflet overrides
│  │  └─ icon.svg                 # favicon
│  ├─ components/
│  │  ├─ HomeClient.js            # owns search/filter/saved state
│  │  ├─ Header.js                # sticky top bar (logo + Instagram)
│  │  ├─ Hero.js
│  │  ├─ BrandLogo.js  Logo.js    # the "MA ♥ NY" logo lockup + image swap
│  │  ├─ Filters.js  SearchBar.js
│  │  ├─ MapSection.js            # dynamic import wrapper (ssr:false)
│  │  ├─ MapView.js               # the actual Leaflet map (client only)
│  │  ├─ Collections.js
│  │  ├─ RecommendationGrid.js  RecommendationCard.js  RecImage.js
│  │  └─ Footer.js
│  ├─ data/
│  │  ├─ recommendations.js       # ← all places live here
│  │  ├─ collections.js           # curated collection definitions
│  │  ├─ categories.js            # category → color/emoji (pins + badges)
│  │  └─ filters.js               # filter pill definitions
│  ├─ hooks/
│  │  └─ useSavedRecs.js          # localStorage save feature
│  └─ lib/
│     └─ utils.js                 # Maps URL / Visit URL / search helpers
└─ ...config files
```

---

## ➕ Add or edit a recommendation

All places live in **`src/data/recommendations.js`**. Copy an existing object,
paste it into the array, and edit the fields. Each object looks like:

```js
{
  id: "joes-pizza",                 // unique, lowercase-with-dashes
  name: "Joe's Pizza",
  neighborhood: "Greenwich Village",
  borough: "Manhattan",
  category: "Food & Drink",         // see categories.js for the list
  subcategory: "Pizza",
  recommendation: "Classic NY slice. Get the plain.",
  tags: ["Pizza", "Cheap Eats"],
  collectionTags: ["Budget-Friendly"],
  price: "Around $4",               // or null
  image: "/recommendation-photos/joes-pizza.jpg",
  website: "https://www.joespizzanyc.com/",
  address: "7 Carmine Street, New York, NY 10014",
  lat: 40.7305,
  lng: -74.0027,
  needsExactAddress: false
}
```

Only `id`, `name`, `lat`, and `lng` are strictly required — but the more you
fill in, the better search, filtering, and the cards look.

---

## 🖼️ Add a photo

1. Drop the image into **`public/recommendation-photos/`**.
2. Name it after the place's `id` (e.g. `joes-pizza.jpg`).
3. Point the `image` field at it:
   `image: "/recommendation-photos/joes-pizza.jpg"`

If a photo is missing, the card shows a branded placeholder automatically —
nothing breaks. See `public/recommendation-photos/README.md` for specs.

---

## 🔗 Update a website link (the "Visit Now" button)

Set the `website` field to the official site. If it's empty (`""`), the
**Visit Now** button automatically falls back to a Google Maps search so it's
never a dead end. (Logic lives in `src/lib/utils.js` → `getVisitUrl`.)

---

## 📍 Replace / fix coordinates

1. Open [Google Maps](https://maps.google.com), right-click the exact spot, and
   click the latitude/longitude at the top of the menu to copy them.
2. Paste them into the place's `lat` and `lng` fields.
3. Unsure of the exact spot? Set `needsExactAddress: true` to flag it for later.

---

## 🧺 Add a new collection tag

1. In **`src/data/collections.js`**, add an entry:
   `{ name: "Rainy Day Picks", title: "Rainy Day Picks", subtitle: "...", emoji: "🌧️" }`
2. Add that exact `name` to the `collectionTags` array of any matching places in
   `recommendations.js`.

The collection card and filtering wire up automatically.

---

## ▲ Deploy to Vercel

This project is Vercel-ready out of the box.

**Option A — Dashboard**

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Framework preset: **Next.js** (auto-detected). No env vars needed.
4. Click **Deploy**.

**Option B — CLI**

```bash
npm i -g vercel
vercel          # preview deploy
vercel --prod   # production deploy
```

No API keys or environment variables are required — the map uses free
OpenStreetMap tiles.

---

## 🛠️ Tech

- **Next.js 16** (App Router) + **React 19**
- **Tailwind CSS**
- **Leaflet** + **react-leaflet** + **OpenStreetMap** tiles
- **localStorage** for saved spots
- Static, local data file — no backend, no API keys

## 🎨 Branding

The visual system (palette, fonts, logo lockup) lives in:

- `tailwind.config.js` — the **NYC by MA** color palette (cream, blush, pink,
  butter, lavender, gold, red) and fonts.
- `src/app/layout.js` — the fonts (Playfair Display, Parisienne, Montserrat,
  Zilla Slab).
- `src/components/BrandLogo.js` — the "MA ♥ NY" CSS logo lockup.
- `src/components/Logo.js` — swap in your own exported logo image here
  (see `public/brand/README.md`). Used in the header and footer.

---

Made for saving the best NYC recs in one place. ♥
