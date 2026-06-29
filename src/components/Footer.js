import Logo from "./Logo";

const COLUMNS = [
  {
    heading: "Explore",
    links: [
      { label: "All Recs", href: "/#recs" },
      { label: "Map", href: "/#map" },
      { label: "Collections", href: "/#collections" },
    ],
  },
  {
    heading: "Info",
    links: [
      { label: "About MA", href: "/#site-footer" },
      { label: "How It Works", href: "/build" },
      { label: "Contact", href: "https://www.instagram.com/NYC_BY_MA/", external: true },
    ],
  },
  {
    heading: "Plan",
    links: [
      { label: "Build Your Day", href: "/build" },
      { label: "Favorites", href: "/#recs" },
      { label: "Boroughs", href: "/#recs" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/#site-footer" },
      { label: "Terms of Use", href: "/#site-footer" },
    ],
  },
];

// Clean, airy, premium footer with link columns + brand marks.
export default function Footer() {
  return (
    <footer id="site-footer" className="mt-14 border-t border-line bg-ivory/70 px-5 pb-10 pt-14">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          {/* Brand */}
          <div>
            <a href="/" aria-label="NYC by MA — home" className="inline-flex">
              <Logo variant="inline" tone="color" imgClassName="h-14 w-auto" />
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">
              A feminine, editorial NYC guide by{" "}
              <span className="font-semibold text-ink">Mary Ashley Stevenson</span> — the
              best food, coffee, shopping, and hidden gems, beautifully mapped.
            </p>
            <a
              href="https://www.instagram.com/NYC_BY_MA/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-5"
            >
              <IgIcon /> Follow on Instagram
            </a>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold">
                {col.heading}
              </h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="text-sm text-ink-soft transition hover:text-pink-deep"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 sm:flex-row">
          <p className="text-xs text-ink-soft/80">
            © {new Date().getFullYear()} NYC by MA. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="font-script text-2xl text-gold">
              xoxo, MA <span className="text-base text-heart">♥</span>
            </span>
            <a
              href="https://www.instagram.com/NYC_BY_MA/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="NYC by MA on Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink/70 transition hover:border-pink/40 hover:text-pink-deep"
            >
              <IgIcon />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function IgIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}
