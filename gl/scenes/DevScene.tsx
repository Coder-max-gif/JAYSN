"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, Mesh, MeshStandardMaterial, TorusKnotGeometry } from "three";
import { usePresence } from "@/gl/hooks/usePresence";
import { useStore } from "@/store/useStore";
import { PALETTE } from "@/lib/palette";
import { damp } from "@/lib/motion";

/** /dev test mesh: turns with scroll, leans toward the pointer. */
export default function DevScene() {
  const ref = useRef<Mesh>(null);
  const presence = usePresence();
  const geo = useMemo(() => new TorusKnotGeometry(1.4, 0.38, 220, 32), []);
  const mat = useMemo(
    () => new MeshStandardMaterial({ color: new Color(PALETTE.grain), roughness: 0.35, metalness: 0.6, transparent: true }),
    [],
  );
  useEffect(() => () => {
    geo.dispose();
    mat.dispose();
  }, [geo, mat]);
  useFrame((_, dt) => {
    const m = ref.current;
    if (!m) return;
    const { live } = useStore.getState();
    m.rotation.y = live.scroll.y * 0.003;
    m.rotation.x = damp(m.rotation.x, -live.pointer.y * 0.4, 4, dt);
    m.rotation.z = damp(m.rotation.z, live.pointer.x * 0.4, 4, dt);
    mat.opacity = presence.current;
  });
  return (
    <group position={[3, 0, 0]}>
      <directionalLight position={[3, 4, 5]} intensity={3} />
      <mesh ref={ref} geometry={geo} material={mat} />
    </group>
  );
}
