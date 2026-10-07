"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { BoxGeometry, Color, Group, MeshStandardMaterial } from "three";
import { usePresence } from "@/gl/hooks/usePresence";
import { useStore } from "@/store/useStore";
import { PALETTE } from "@/lib/palette";
import { damp } from "@/lib/motion";
import { makeBagLabel, makeGrainBump } from "@/gl/materials/proceduralTextures";
import type { Product } from "@/content/products";

const W = 1.3;
const H = 1.9;
const D = 0.46;

/** Soft deformed box with a folded, stitched top. Built procedurally, no model file. */
function bagGeometry() {
  const g = new BoxGeometry(W, H, D, 24, 36, 10);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i);
    let y = p.getY(i);
    let z = p.getZ(i);
    const nx = x / (W / 2);
    const ny = y / (H / 2);
    // Pillow: thickness falls off toward the edges, more toward the top
    const edge = (1 - Math.pow(Math.abs(nx), 4)) * (1 - Math.pow(Math.abs(ny), 6));
    z *= 0.35 + 0.65 * edge;
    // Settled weight: bottom bulges a little
    if (ny < 0) x *= 1 + (1 - Math.abs(ny + 0.6)) * 0.03;
    // Folded top: the last 8 percent collapses flat into a stitched hem
    if (ny > 0.9) {
      const f = (ny - 0.9) / 0.1;
      z *= 1 - f * 0.92;
      y -= f * 0.02;
    }
    // Slight sag in the middle of the front
    z *= 1 - 0.04 * Math.exp(-(nx * nx * 4 + (ny - 0.2) * (ny - 0.2) * 6));
    p.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals();
  return g;
}

export default function Bag({ product, x = 1.35 }: { product: Product; x?: number }) {
  const presence = usePresence();
  const ref = useRef<Group>(null);
  const warm = product.slug === "cattle-feed";
  const geo = useMemo(bagGeometry, []);
  const weave = useMemo(() => makeGrainBump(128, false), []);
  const label = useMemo(
    () =>
      makeBagLabel({
        product: product.name,
        line: product.bag.line,
        weight: product.bag.weight.value,
        warm,
      }),
    [product, warm],
  );
  const mats = useMemo(() => {
    const side = new MeshStandardMaterial({
      color: new Color(warm ? "#d9cfb6" : PALETTE.bone).multiplyScalar(0.92),
      roughness: 0.92,
      bumpMap: weave,
      bumpScale: 1.2,
      transparent: true,
    });
    const front = new MeshStandardMaterial({ map: label, roughness: 0.85, bumpMap: weave, bumpScale: 0.8, transparent: true });
    // BoxGeometry groups: +x, -x, +y, -y, +z (front), -z (back)
    return [side, side, side, side, front, front];
  }, [label, weave, warm]);

  useEffect(() => () => {
    geo.dispose();
    weave.dispose();
    label.dispose();
    new Set(mats).forEach((m) => m.dispose());
  }, [geo, weave, label, mats]);

  const rot = useRef(0);
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const s = useStore.getState();
    const target = s.live.bagRotation + (s.reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.3) * 0.08);
    rot.current = damp(rot.current, target, 5, dt);
    if (ref.current) {
      ref.current.rotation.y = rot.current - 0.35;
      ref.current.position.y = (1 - presence.current) * -0.8;
    }
    const o = presence.current;
    mats[0].opacity = o;
    mats[4].opacity = o;
  });

  const stitch = useMemo(
    () => Array.from({ length: 2 }, (_, i) => [-W / 2 + 0.04, H / 2 - 0.05 - i * 0.035, 0.012] as [number, number, number]),
    [],
  );
  return (
    <group position={[x, 0.05, 0]}>
      <directionalLight position={[2, 3, 3]} intensity={3} color={new Color(warm ? "#ffd9a8" : "#eef2f5")} />
      <directionalLight position={[-3, 1, -2]} intensity={1.6} color={new Color(PALETTE.grain)} />
      <ambientLight intensity={0.25} />
      <group ref={ref}>
        <mesh geometry={geo} material={mats} />
        {/* Stitched hem, front and back */}
        {[1, -1].map((side) => (
          <Line
            key={side}
            points={[
              [stitch[0][0], stitch[0][1], 0.02 * side],
              [-stitch[0][0], stitch[0][1], 0.02 * side],
            ]}
            color={PALETTE.soil}
            lineWidth={1.4}
            dashed
            dashSize={0.025}
            gapSize={0.018}
          />
        ))}
      </group>
    </group>
  );
}
