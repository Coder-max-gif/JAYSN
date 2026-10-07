/**
 * Motion tokens. Mirrors the motion variables in /styles/tokens.css.
 * The only easings and durations allowed on the site. See .claude/skills/jaysn-motion-rules.
 */

export const EASE = {
  /** Entrances, reveals, hovers */
  out: "expo.out",
  /** Scroll scrubbed values, camera moves, layout morphs */
  inOut: "power3.inOut",
  /** Covering exit before a route change */
  in: "expo.in",
} as const;

export const DUR = {
  micro: 0.3,
  standard: 0.8,
  large: 1.2,
  xlarge: 1.6,
  /** Page transition cover and reveal (brief value, logged in decisions.md) */
  transition: 0.9,
} as const;

export const STAGGER = {
  line: 0.06,
  item: 0.08,
} as const;

/** Exponential smoothing factor helper for frame loops: frame rate independent damping. */
export function damp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

/** expo.out as a plain function, for shader uniforms driven outside GSAP */
export function expoOut(t: number) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/** power3.inOut as a plain function */
export function power3InOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
