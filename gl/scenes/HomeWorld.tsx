"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { CatmullRomCurve3, Vector3 } from "three";
import { Presence } from "@/gl/hooks/usePresence";
import { useStore } from "@/store/useStore";
import { rig } from "@/gl/rig";
import Hero from "./Hero";
import Terrain from "./Terrain";
import Stock from "./Stock";
import Port from "./Port";
import Globe from "./Globe";

/**
 * The home page is one continuous world. A camera rail (Catmull-Rom through keyframes) is
 * driven by the continuous chapter position homeT (0 hero, 1 soil, 2 stock, 3 trade,
 * 4 people, 5 quote). Stations outside the window around homeT are unmounted.
 */
export const GLOBE_POS: [number, number, number] = [0, 26, -104];

const KEYS: { t: number; pos: [number, number, number]; look: [number, number, number] }[] = [
  { t: 0, pos: [0, 0.6, 12], look: [0, -0.4, 0] },
  { t: 0.55, pos: [0.4, -1.6, 8.5], look: [0, -3.6, -1] },
  { t: 1, pos: [0.9, -3.35, 5.2], look: [-0.3, -4.0, -4] },
  { t: 1.5, pos: [0.3, -3.3, -14], look: [0, -3.9, -28] },
  { t: 2, pos: [2.6, -2.2, -38.6], look: [-0.2, -3.7, -46] },
  { t: 2.45, pos: [3.4, -1.9, -42.5], look: [-0.6, -3.6, -47] },
  { t: 2.6, pos: [5, 1.2, -64], look: [0, -2.4, -92] },
  { t: 2.8, pos: [7.2, -2.0, -84], look: [0, -3.2, -99] },
  { t: 3.05, pos: [5.5, -1.6, -88], look: [-0.5, -3.0, -100] },
  { t: 3.6, pos: [-1.5, 25.5, -83], look: [-4.6, 25.8, -104] },
  { t: 4, pos: [-3.2, 25.2, -84], look: [-6.5, 25.6, -104] },
  { t: 5, pos: [-2.6, 26.2, -86.5], look: [-5.8, 25.6, -104] },
];

function buildRail() {
  const pos = new CatmullRomCurve3(KEYS.map((k) => new Vector3(...k.pos)), false, "catmullrom", 0.3);
  const look = new CatmullRomCurve3(KEYS.map((k) => new Vector3(...k.look)), false, "catmullrom", 0.3);
  return { pos, look };
}

/** Maps homeT to the curve parameter u through the keyframe times (piecewise linear). The rig damping adds weight. */
function tToU(t: number) {
  const n = KEYS.length - 1;
  if (t <= KEYS[0].t) return 0;
  for (let i = 0; i < n; i++) {
    const a = KEYS[i];
    const b = KEYS[i + 1];
    if (t <= b.t) {
      return (i + (t - a.t) / (b.t - a.t)) / n;
    }
  }
  return 1;
}

const WINDOWS = {
  hero: [-1, 1.85],
  terrain: [0.15, 2.85],
  stock: [1.2, 3.1],
  port: [2.3, 3.9],
  globe: [2.45, 9],
} as const;

type Station = keyof typeof WINDOWS;

export default function HomeWorld() {
  const rail = useMemo(buildRail, []);
  const tmpP = useMemo(() => new Vector3(), []);
  const tmpL = useMemo(() => new Vector3(), []);
  const [active, setActive] = useState<Record<Station, boolean>>({
    hero: true,
    terrain: false,
    stock: false,
    port: false,
    globe: false,
  });
  const activeRef = useRef(active);
  const { size } = useThree();

  useFrame(() => {
    const t = useStore.getState().live.homeT;
    const u = tToU(t);
    rail.pos.getPoint(u, tmpP);
    rail.look.getPoint(u, tmpL);
    rig.position.copy(tmpP);
    rig.lookAt.copy(tmpL);
    // Narrow screens: keep the globe centred behind the copy instead of off to the side
    if (size.width < 768 && t > 3.05) {
      const k = Math.min(1, (t - 3.05) / 0.55) * 0.85;
      rig.position.x *= 1 - k;
      rig.lookAt.x *= 1 - k;
      rig.position.z -= k * 3;
    }
    rig.lambda = 3.2;
    rig.parallax = t < 1 ? 0.3 : 0.15;

    let changed = false;
    const next = { ...activeRef.current };
    (Object.keys(WINDOWS) as Station[]).forEach((k) => {
      const [a, b] = WINDOWS[k];
      const on = t >= a && t <= b;
      if (next[k] !== on) {
        next[k] = on;
        changed = true;
      }
    });
    if (changed) {
      activeRef.current = next;
      setActive(next);
    }
  });

  return (
    <>
      <Presence active={active.hero}>
        <Hero />
      </Presence>
      <Presence active={active.terrain}>
        <Terrain />
      </Presence>
      <Presence active={active.stock}>
        <Stock />
      </Presence>
      <Presence active={active.port}>
        <Port />
      </Presence>
      <Presence active={active.globe}>
        <Globe mode="home" radius={5} position={GLOBE_POS} />
      </Presence>
    </>
  );
}
