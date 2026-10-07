/**
 * Quality tiers. Every WebGL cost reads from here: particle counts, DPR, post effects, shadows.
 */
export type QualityTier = "high" | "medium" | "low";

export interface TierSettings {
  /** Hero granule count */
  particles: number;
  /** Instanced pellets in the Stock chapter and product macro scenes */
  instances: number;
  /** Globe land dot density multiplier */
  globeDots: number;
  dprMax: number;
  dprMin: number;
  postfx: boolean;
  /** Terrain segments per side */
  terrainSegments: number;
  /** Render the full 3D world (false = static poster plus DOM) */
  webgl: boolean;
}

export const TIERS: Record<QualityTier, TierSettings> = {
  high: {
    particles: 60000,
    instances: 2400,
    globeDots: 1,
    dprMax: 1.5,
    dprMin: 1,
    postfx: true,
    terrainSegments: 256,
    webgl: true,
  },
  medium: {
    particles: 25000,
    instances: 1200,
    globeDots: 0.7,
    dprMax: 1.25,
    dprMin: 0.85,
    postfx: true,
    terrainSegments: 160,
    webgl: true,
  },
  low: {
    particles: 8000,
    instances: 500,
    globeDots: 0.45,
    dprMax: 1.25,
    dprMin: 0.75,
    postfx: false,
    terrainSegments: 96,
    webgl: true,
  },
};

/**
 * Cheap capability detection. No network calls. Reads the WebGL renderer string, cores, memory
 * and screen to choose a tier. A runtime frame time monitor can lower it further.
 */
export function detectTier(): { tier: QualityTier; webgl2: boolean } {
  if (typeof window === "undefined") return { tier: "medium", webgl2: true };
  let webgl2 = false;
  let renderer = "";
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2");
    webgl2 = !!gl;
    if (gl) {
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      renderer = String(
        ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
      ).toLowerCase();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
  } catch {
    webgl2 = false;
  }
  if (!webgl2) return { tier: "low", webgl2 };

  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 8;
  const mobile = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
  const software = /swiftshader|llvmpipe|software|basic render/.test(renderer);
  const strongGpu = /nvidia|geforce|rtx|radeon|apple m\d|apple gpu|arc/.test(renderer);

  if (software) return { tier: "low", webgl2 };
  if (mobile) return { tier: cores >= 8 && memory >= 6 ? "medium" : "low", webgl2 };
  if (strongGpu || (cores >= 8 && memory >= 8)) return { tier: "high", webgl2 };
  return { tier: "medium", webgl2 };
}

export function lowerTier(t: QualityTier): QualityTier {
  return t === "high" ? "medium" : "low";
}
