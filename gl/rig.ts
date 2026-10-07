import { Vector3, Color } from "three";
import { THEME_BG, type Theme } from "@/lib/palette";

/**
 * Shared camera intent. Scenes write where the camera should be; CameraRig damps toward it.
 * Mutable singleton so frame loops never trigger React renders.
 */
export const rig = {
  position: new Vector3(0, 0.6, 12),
  lookAt: new Vector3(0, -0.4, 0),
  fov: 35,
  /** Damping strength. Higher snaps faster. */
  lambda: 3.2,
  /** Extra push toward the look target during product transitions, 0..1 */
  push: 0,
  /** Pointer parallax amount in world units */
  parallax: 0.25,
  /** Global time scale: menu open slows the world */
  timeScale: 1,
  /** Global dim 0..1 (menu open darkens the world) */
  dim: 0,
};

export const themeColor = (t: Theme) => new Color(THEME_BG[t]);
