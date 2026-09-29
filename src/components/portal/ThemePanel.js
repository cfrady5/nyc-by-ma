"use client";

import { THEME_PRESETS, FONT_OPTIONS } from "@/hooks/usePortalStudio";
import { cx } from "@/lib/utils";

// Controls that restyle every slide at once: preset themes, individual colors,
// and title/body fonts.
export default function ThemePanel({ theme, onApplyPreset, onUpdate }) {
  return (
    <div className="space-y-5">
      {/* Presets */}
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gold">Theme</p>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(THEME_PRESETS).map(([key, p]) => (
            <button
              key={key}
              type="button"
              onClick={() => onApplyPreset(key)}
              aria-pressed={theme.preset === key}
              className={cx(
                "flex flex-col items-center gap-1.5 rounded-xl border p-2 text-[11px] font-semibold transition",
                theme.preset === key ? "border-pink shadow-glow" : "border-ink/10 hover:border-pink/40"
              )}
            >
              <span className="flex gap-1">
                <span className="h-5 w-5 rounded-full" style={{ background: p.bg }} />
                <span className="h-5 w-5 rounded-full" style={{ background: p.accent }} />
              </span>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gold">Colors</p>
        <div className="space-y-2">
          <ColorRow label="Background" value={theme.bg} onChange={(v) => onUpdate({ preset: "custom", bg: v })} />
          <ColorRow label="Text" value={theme.text} onChange={(v) => onUpdate({ preset: "custom", text: v })} />
          <ColorRow label="Accent" value={theme.accent} onChange={(v) => onUpdate({ preset: "custom", accent: v })} />
        </div>
      </div>

      {/* Fonts */}
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gold">Fonts</p>
        <div className="space-y-2">
          <FontRow
            label="Title"
            value={theme.titleFont}
            onChange={(v) => onUpdate({ titleFont: v })}
          />
          <FontRow
            label="Body"
            value={theme.bodyFont}
            onChange={(v) => onUpdate({ bodyFont: v })}
          />
        </div>
      </div>

      {/* Texture toggle */}
      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-ink/10 bg-white px-3.5 py-2.5">
        <span className="text-sm font-medium text-ink">Soft watercolor wash</span>
        <input
          type="checkbox"
          checked={theme.texture}
          onChange={(e) => onUpdate({ texture: e.target.checked })}
          className="h-4 w-4 accent-pink"
        />
      </label>
    </div>
  );
}

function ColorRow({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-ink/10 bg-white px-3.5 py-2">
      <span className="text-sm font-medium text-ink">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tabular-nums text-ink-soft">{value}</span>
        <input
          type="color"
          value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} color`}
          className="h-8 w-10 cursor-pointer rounded-md border border-ink/10 bg-white p-0.5"
        />
      </div>
    </div>
  );
}

function FontRow({ label, value, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl border border-ink/10 bg-white px-3.5 py-2">
      <span className="text-sm font-medium text-ink">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="max-w-[60%] rounded-lg border border-ink/12 bg-white px-2 py-1.5 text-xs font-medium text-ink focus:outline-none"
      >
        {FONT_OPTIONS.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>
    </label>
  );
}
