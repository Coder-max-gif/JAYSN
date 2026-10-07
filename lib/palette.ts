/**
 * JS mirror of the colour tokens in /styles/tokens.css for WebGL, canvas and SVG generation.
 * Keep in sync with tokens.css. Do not use these in DOM styles: use CSS variables there.
 */
export const PALETTE = {
  soil: "#0c0f0b",
  loam: "#171c13",
  moss: "#3c4a2a",
  grain: "#c9a24b",
  bone: "#ede8da",
  clay: "#8a5a3b",
  sea: "#10303d",
} as const;

/** Background per chapter theme. Mirrors --theme-* in tokens.css */
export const THEME_BG = {
  soil: "#0c0f0b",
  clay: "#1a120d",
  sea: "#0a1e27",
} as const;

export type Theme = keyof typeof THEME_BG;
