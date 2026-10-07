"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  CylinderGeometry,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  ShaderMaterial,
} from "three";
import { usePresence } from "@/gl/hooks/usePresence";
import { useStore } from "@/store/useStore";
import { TIERS } from "@/lib/quality";
import { PALETTE } from "@/lib/palette";
import { makeGrainBump } from "@/gl/materials/proceduralTextures";
import { rig } from "@/gl/rig";

export type Material = "fertilizer" | "cattle-feed";

interface Item {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  s: number;
  sy: number;
  roll: number;
}

/** A bed of material filling the view: a gentle heap, denser at the centre. */
function makeBed(n: number, seed: number): Item[] {
  let a = seed;
  const rand = () => {
    a = (a * 16807) % 2147483647;
    return a / 2147483647;
  };
  const items: Item[] = [];
  for (let i = 0; i < n; i++) {
    const x = (rand() - 0.5) * 7;
    const z = (rand() - 0.5) * 5 - 0.6;
    const heap = Math.exp(-(x * x * 0.08 + (z + 0.8) * (z + 0.8) * 0.12)) * 0.9;
    items.push({
      x,
      y: -0.9 + heap + rand() * 0.18,
      z,
      rx: rand() * Math.PI * 2,
      ry: rand() * Math.PI * 2,
      rz: rand() * Math.PI * 2,
      s: 0.55 + rand() * 0.75,
      sy: 0.72 + rand() * 0.34,
      roll: rand() < 0.012 ? 0.4 + rand() * 0.6 : 0,
    });
  }
  return items;
}

function useInstances(
  ref: React.RefObject<InstancedMesh | null>,
  items: Item[],
  colors: Color[],
  presence: { current: number },
) {
  const dummy = useMemo(() => new Object3D(), []);
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    items.forEach((it, i) => {
      m.setColorAt(i, colors[i % colors.length]);
    });
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [ref, items, colors]);
  useFrame((state) => {
    const m = ref.current;
    if (!m) return;
    const t = state.clock.elapsedTime * rig.timeScale;
    const reduced = useStore.getState().reducedMotion;
    const rise = (1 - presence.current) * -1.2;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      let x = it.x;
      let rz = it.rz;
      if (it.roll && !reduced) {
        // A few granules roll slowly across the bed and wrap around
        x = ((((it.x + t * it.roll * 0.35 + 3.5) % 7) + 7) % 7) - 3.5;
        rz = it.rz - (t * it.roll * 0.35) / (0.1 * it.s);
      }
      dummy.position.set(x, it.y + rise, it.z);
      dummy.rotation.set(it.rx, it.ry, rz);
      dummy.scale.set(it.s, it.s * it.sy, it.s);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
}

function Fertilizer({ count }: { count: number }) {
  const presence = usePresence();
  const glossyRef = useRef<InstancedMesh>(null);
  const matteRef = useRef<InstancedMesh>(null);
  const nGlossy = Math.round(count * 0.55);
  const nMatte = count - nGlossy;
  const bedA = useMemo(() => makeBed(nGlossy, 13), [nGlossy]);
  const bedB = useMemo(() => makeBed(nMatte, 29), [nMatte]);
  const bump = useMemo(() => makeGrainBump(128, false), []);
  const geo = useMemo(() => new IcosahedronGeometry(0.068, 3), []);
  const glossy = useMemo(
    () =>
      new MeshPhysicalMaterial({
        roughness: 0.46,
        clearcoat: 0.22,
        clearcoatRoughness: 0.5,
        bumpMap: bump,
        bumpScale: 1.1,
        transparent: true,
      }),
    [bump],
  );
  const matte = useMemo(
    () => new MeshStandardMaterial({ roughness: 0.82, bumpMap: bump, bumpScale: 1.4, transparent: true }),
    [bump],
  );
  const colors = useMemo(
    () => [
      new Color(PALETTE.bone).multiplyScalar(0.82),
      new Color(PALETTE.bone).multiplyScalar(0.64),
      new Color(PALETTE.bone).lerp(new Color(PALETTE.soil), 0.42),
      new Color(PALETTE.bone).lerp(new Color(PALETTE.moss), 0.2).multiplyScalar(0.75),
      new Color(PALETTE.bone).lerp(new Color(PALETTE.clay), 0.12).multiplyScalar(0.7),
    ],
    [],
  );
  useInstances(glossyRef, bedA, colors, presence);
  useInstances(matteRef, bedB, colors, presence);
  useEffect(() => () => {
    [bump, geo, glossy, matte].forEach((d) => d.dispose());
  }, [bump, geo, glossy, matte]);
  useFrame(() => {
    glossy.opacity = matte.opacity = presence.current;
  });
  return (
    <>
      <instancedMesh ref={glossyRef} args={[geo, glossy, nGlossy]} frustumCulled={false} />
      <instancedMesh ref={matteRef} args={[geo, matte, nMatte]} frustumCulled={false} />
    </>
  );
}

function CattleFeed({ count }: { count: number }) {
  const presence = usePresence();
  const pelletRef = useRef<InstancedMesh>(null);
  const grainRef = useRef<InstancedMesh>(null);
  const crackRef = useRef<InstancedMesh>(null);
  const nPellet = Math.round(count * 0.6);
  const nGrain = Math.round(count * 0.25);
  const nCrack = count - nPellet - nGrain;
  const beds = useMemo(
    () => [makeBed(nPellet, 41), makeBed(nGrain, 43), makeBed(nCrack, 47)],
    [nPellet, nGrain, nCrack],
  );
  const bump = useMemo(() => makeGrainBump(128, true), []);
  const pelletGeo = useMemo(() => {
    const g = new CylinderGeometry(0.05, 0.05, 0.15, 12, 1);
    return g;
  }, []);
  const grainGeo = useMemo(() => {
    const g = new IcosahedronGeometry(0.042, 2);
    g.scale(0.75, 0.6, 1.6);
    return g;
  }, []);
  const crackGeo = useMemo(() => new IcosahedronGeometry(0.035, 0), []);
  const pelletMat = useMemo(
    () => new MeshStandardMaterial({ roughness: 0.96, bumpMap: bump, bumpScale: 3, transparent: true }),
    [bump],
  );
  const grainMat = useMemo(
    () => new MeshPhysicalMaterial({ roughness: 0.45, clearcoat: 0.2, transparent: true }),
    [],
  );
  const crackMat = useMemo(
    () => new MeshStandardMaterial({ roughness: 0.7, flatShading: true, transparent: true }),
    [],
  );
  const pelletColors = useMemo(
    () => [
      new Color(PALETTE.clay).lerp(new Color(PALETTE.grain), 0.35),
      new Color(PALETTE.clay).lerp(new Color(PALETTE.grain), 0.2),
      new Color(PALETTE.clay).multiplyScalar(0.85),
    ],
    [],
  );
  const grainColors = useMemo(
    () => [new Color(PALETTE.grain), new Color(PALETTE.grain).lerp(new Color(PALETTE.bone), 0.3)],
    [],
  );
  const crackColors = useMemo(
    () => [new Color(PALETTE.bone).multiplyScalar(0.85), new Color(PALETTE.grain).multiplyScalar(0.8)],
    [],
  );
  useInstances(pelletRef, beds[0], pelletColors, presence);
  useInstances(grainRef, beds[1], grainColors, presence);
  useInstances(crackRef, beds[2], crackColors, presence);
  useEffect(() => () => {
    [bump, pelletGeo, grainGeo, crackGeo, pelletMat, grainMat, crackMat].forEach((d) => d.dispose());
  }, [bump, pelletGeo, grainGeo, crackGeo, pelletMat, grainMat, crackMat]);
  useFrame(() => {
    pelletMat.opacity = grainMat.opacity = crackMat.opacity = presence.current;
  });
  return (
    <>
      <instancedMesh ref={pelletRef} args={[pelletGeo, pelletMat, nPellet]} frustumCulled={false} />
      <instancedMesh ref={grainRef} args={[grainGeo, grainMat, nGrain]} frustumCulled={false} />
      <instancedMesh ref={crackRef} args={[crackGeo, crackMat, nCrack]} frustumCulled={false} />
    </>
  );
}

function Motes({ warm }: { warm: boolean }) {
  const presence = usePresence();
  const geo = useMemo(() => {
    const n = 260;
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      p[i * 3] = (Math.random() - 0.5) * 8;
      p[i * 3 + 1] = Math.random() * 2.5 - 0.5;
      p[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(p, 3));
    return g;
  }, []);
  const mat = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uAlpha: { value: 0 },
          uColor: { value: new Color(warm ? PALETTE.grain : PALETTE.bone) },
        },
        vertexShader: `uniform float uTime; varying float vA;
          void main(){ vec3 p = position; float ph = fract(sin(dot(p.xz, vec2(12.9,78.2))) * 43758.5);
            p.y += sin(uTime * 0.2 + ph * 20.0) * 0.25; p.x += uTime * 0.03 * (ph - 0.3);
            vec4 mv = modelViewMatrix * vec4(p,1.0); gl_PointSize = (1.2 + ph * 2.0) * (8.0 / -mv.z);
            vA = 0.3 + ph * 0.7; gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `uniform float uAlpha; uniform vec3 uColor; varying float vA;
          void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d) * vA * 0.25 * uAlpha;
            gl_FragColor = vec4(uColor * a, a); }`,
      }),
    [warm],
  );
  useEffect(() => () => {
    geo.dispose();
    mat.dispose();
  }, [geo, mat]);
  useFrame((state) => {
    mat.uniforms.uTime.value = state.clock.elapsedTime * rig.timeScale;
    mat.uniforms.uAlpha.value = presence.current;
  });
  return <points geometry={geo} material={mat} />;
}

/** Macro bed of fertilizer prills or feed pellets with material specific light. */
export default function ProductMacro({ kind }: { kind: Material }) {
  const quality = useStore((s) => s.quality);
  // Macro beds need more grains than the Stock stream to read as a surface
  const count = Math.round(TIERS[quality].instances * 1.8);
  const warm = kind === "cattle-feed";
  const group = useRef<Group>(null);
  const presence = usePresence();
  useFrame(() => {
    if (group.current) group.current.visible = presence.current > 0.01;
  });
  return (
    <group ref={group}>
      {/* Key: cool daylight for fertilizer, warm low light for feed. Rim from behind. */}
      <directionalLight
        position={warm ? [3.5, 2.2, 1.5] : [-3, 3.5, 2]}
        intensity={warm ? 3.2 : 3.6}
        color={warm ? new Color("#ffcf96") : new Color("#e8eef5")}
      />
      <directionalLight position={[0, 1.5, -4]} intensity={2.2} color={new Color(warm ? PALETTE.clay : PALETTE.grain)} />
      <ambientLight intensity={0.12} />
      {kind === "fertilizer" ? <Fertilizer count={count} /> : <CattleFeed count={count} />}
      <Motes warm={warm} />
    </group>
  );
}
