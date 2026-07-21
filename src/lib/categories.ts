// Category color system — one source of truth for the per-topic accent colors.
//
// Why: a flat white-on-black feed reads as a generic newspaper. Giving each topic
// a signature hue adds life, helps readers scan/browse by topic, and ties the cards,
// topic browser, and category pages into one system. Colors are defined in OKLCH so
// every hue shares the same lightness/chroma — vivid but harmonious on the dark
// canvas, never neon-clashing. Keep the keys in sync with CATEGORIES in config.ts.

const HUE: Record<string, number> = {
  Canada: 25, // maple red — fitting for the Canadian lens
  'International relations': 255, // blue
  'International trade': 190, // teal
  Policy: 295, // violet
  Climate: 150, // green
  Tech: 220, // azure
  Philosophy: 75, // amber
  Arts: 330, // magenta
  Fashion: 350, // rose
};

const FALLBACK_HUE = 250;

export interface CategoryColor {
  hue: number;
  /** bright accent for eyebrow labels / links (AA on the near-black canvas) */
  label: string;
  /** saturated dot / marker */
  dot: string;
  /** low-alpha tile fill */
  soft: string;
  /** low-alpha tile border */
  softBorder: string;
  /** ambient glow (use in radial-gradients) */
  glow: string;
  /** image-fallback gradient stops */
  from: string;
  to: string;
}

export function categoryHue(category: string): number {
  return HUE[category] ?? FALLBACK_HUE;
}

export function categoryColor(category: string): CategoryColor {
  const h = categoryHue(category);
  return {
    hue: h,
    label: `oklch(0.8 0.13 ${h})`,
    dot: `oklch(0.72 0.16 ${h})`,
    soft: `oklch(0.65 0.16 ${h} / 0.1)`,
    softBorder: `oklch(0.72 0.16 ${h} / 0.22)`,
    glow: `oklch(0.62 0.18 ${h} / 0.16)`,
    from: `oklch(0.34 0.09 ${h})`,
    to: `oklch(0.16 0.05 ${h})`,
  };
}
