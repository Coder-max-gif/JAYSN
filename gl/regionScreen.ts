/**
 * Screen positions of globe route ends (CSS px) plus label opacity. Written by the globe each
 * frame, read by DOM overlays (globe labels, services connector lines). Plain module state so
 * nothing re-renders.
 */
export interface RegionPoint {
  x: number;
  y: number;
  visible: boolean;
  /** Label opacity 0..1 */
  label: number;
}

export const regionScreen: Record<string, RegionPoint> = {};
