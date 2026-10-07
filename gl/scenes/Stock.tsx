"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  IcosahedronGeometry,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  ShaderMaterial,
} from "three";
import { usePresence } from "@/gl/hooks/usePresence";
import { useStore } from "@/store/useStore";
import { TIERS } from "@/lib/quality";
import { PALETTE } from "@/lib/palette";
import { clamp01 } from "@/lib/motion";
import { hash2D } from "@/gl/shaders/noise.glsl";
import { makeGrainBump } from "@/gl/materials/proceduralTextures";
import { rig } from "@/gl/rig";

/** Stock chapter station: feed pours into a trough under a barn window light shaft. */
export const STOCK_ORIGIN: [number, number, number] = [0, -4.2, -46];

const TROUGH = { length: 5.2, width: 1.0, height: 0.55 };

function Trough() {
  const mat = useMemo(
    () => new MeshStandardMaterial({ color: new Color(PALETTE.loam).multiplyScalar(2.2), roughness: 0.9 }),
    [],
  );
  const geo = useMemo(() => new BoxGeometry(1, 1, 1), []);
  useEffect(() => () => {
    mat.dispose();
    geo.dispose();
  }, [mat, geo]);
  const { length: L, width: W, height: H } = TROUGH;
  const t = 0.06;
  return (
    <group position={[0, H / 2, 0]}>
      <mesh geometry={geo} material={mat} scale={[L, t, W]} position={[0, -H / 2, 0]} />
      <mesh geometry={geo} material={mat} scale={[L, H, t]} position={[0, 0, W / 2]} />
      <mesh geometry={geo} material={mat} scale={[L, H, t]} position={[0, 0, -W / 2]} />
      <mesh geometry={geo} material={mat} scale={[t, H, W]} position={[L / 2, 0, 0]} />
      <mesh geometry={geo} material={mat} scale={[t, H, W]} position={[-L / 2, 0, 0]} />
    </group>
  );
}

function FeedStream({ count }: { count: number }) {
  const pelletRef = useRef<InstancedMesh>(null);
  const grainRef = useRef<InstancedMesh>(null);
  const nPellet = Math.round(count * 0.7);
  const nGrain = count - nPellet;

  const data = useMemo(() => {
    const make = (n: number) =>
      Array.from({ length: n }, () => ({
        delay: Math.random(),
        landX: (Math.random() - 0.5) * (TROUGH.length - 0.3),
        landZ: (Math.random() - 0.5) * (TROUGH.width - 0.2),
        landY: 0.06 + Math.random() * 0.32,
        startX: -1.2 + (Math.random() - 0.5) * 0.25,
        startZ: (Math.random() - 0.5) * 0.25,
        rx: Math.random() * Math.PI,
        ry: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 8,
        s: 0.75 + Math.random() * 0.5,
      }));
    return { pellets: make(nPellet), grains: make(nGrain) };
  }, [nPellet, nGrain]);

  const bump = useMemo(() => makeGrainBump(64, true), []);
  const pelletGeo = useMemo(() => new CylinderGeometry(0.035, 0.035, 0.1, 7), []);
  const grainGeo = useMemo(() => {
    const g = new IcosahedronGeometry(0.03, 1);
    g.scale(1, 0.6, 1.7);
    return g;
  }, []);
  const pelletMat = useMemo(
    () =>
      new MeshStandardMaterial({
        color: new Color(PALETTE.clay).lerp(new Color(PALETTE.grain), 0.25),
        roughness: 0.95,
        bumpMap: bump,
        bumpScale: 2,
      }),
    [bump],
  );
  const grainMat = useMemo(
    () => new MeshStandardMaterial({ color: new Color(PALETTE.grain).multiplyScalar(0.9), roughness: 0.6 }),
    [],
  );
  useEffect(
    () => () => {
      [pelletGeo, grainGeo, pelletMat, grainMat, bump].forEach((d) => d.dispose());
    },
    [pelletGeo, grainGeo, pelletMat, grainMat, bump],
  );

  const dummy = useMemo(() => new Object3D(), []);

  useFrame((state) => {
    const homeT = useStore.getState().live.homeT;
    // Pour runs while the Stock chapter scrolls
    const pour = clamp01((homeT - 1.55) / 1.0);
    const time = state.clock.elapsedTime;
    const apply = (mesh: InstancedMesh | null, arr: typeof data.pellets) => {
      if (!mesh) return;
      for (let i = 0; i < arr.length; i++) {
        const d = arr[i];
        const local = clamp01(pour * 1.6 - d.delay * 0.6) ;
        const startY = 3.4;
        if (local <= 0) {
          dummy.position.set(d.startX, startY + 2, d.startZ);
          dummy.scale.setScalar(0);
        } else {
          const fallT = clamp01(local / 0.55);
          const x = d.startX + (d.landX - d.startX) * fallT;
          const z = d.startZ + (d.landZ - d.startZ) * fallT;
          const y = startY + (d.landY + 0.1 - startY) * (fallT * fallT);
          dummy.position.set(x, y, z);
          const rot = fallT < 1 ? time * d.spin : 0;
          dummy.rotation.set(d.rx + rot, d.ry, rot * 0.5);
          dummy.scale.setScalar(d.s);
        }
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    };
    apply(pelletRef.current, data.pellets);
    apply(grainRef.current, data.grains);
  });

  return (
    <>
      <instancedMesh ref={pelletRef} args={[pelletGeo, pelletMat, nPellet]} frustumCulled={false} />
      <instancedMesh ref={grainRef} args={[grainGeo, grainMat, nGrain]} frustumCulled={false} />
    </>
  );
}

/** Fake volumetric shaft: an additive cone with drifting noise, plus dust motes inside it. */
function LightShaft() {
  const presence = usePresence();
  const geo = useMemo(() => {
    const g = new ConeGeometry(1.6, 7, 32, 1, true);
    g.translate(0, -3.5, 0);
    return g;
  }, []);
  const mat = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        side: DoubleSide,
        uniforms: { uTime: { value: 0 }, uPresence: { value: 0 }, uColor: { value: new Color(PALETTE.grain) } },
        vertexShader: /* glsl */ `
          varying vec2 vUv; varying vec3 vN; varying vec3 vView;
          void main(){ vUv = uv; vN = normalize(normalMatrix * normal);
            vec4 mv = modelViewMatrix * vec4(position,1.0); vView = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv; }`,
        fragmentShader: /* glsl */ `
          uniform float uTime; uniform float uPresence; uniform vec3 uColor;
          varying vec2 vUv; varying vec3 vN; varying vec3 vView;
          ${hash2D}
          void main(){
            float facing = pow(abs(dot(vN, vView)), 1.5);
            float n = fbm(vec2(vUv.x * 8.0, vUv.y * 2.0 - uTime * 0.05));
            float along = smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.6, vUv.y);
            float a = facing * along * (0.35 + n * 0.65) * 0.09 * uPresence;
            gl_FragColor = vec4(uColor * a, a);
          }`,
      }),
    [],
  );

  const dustGeo = useMemo(() => {
    const n = 500;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const h = Math.random();
      const r = Math.random() * 1.4 * h;
      const a = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = -h * 7;
      pos[i * 3 + 2] = Math.sin(a) * r;
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(pos, 3));
    return g;
  }, []);
  const dustMat = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uPresence: { value: 0 }, uColor: { value: new Color(PALETTE.bone) } },
        vertexShader: /* glsl */ `
          uniform float uTime; varying float vA;
          void main(){
            vec3 p = position;
            float ph = fract(sin(dot(p.xz, vec2(12.9898,78.233))) * 43758.5453);
            p.x += sin(uTime * 0.3 + ph * 20.0) * 0.12;
            p.y += sin(uTime * 0.15 + ph * 10.0) * 0.2;
            vec4 mv = modelViewMatrix * vec4(p,1.0);
            gl_PointSize = (1.5 + ph * 2.5) * (10.0 / -mv.z);
            vA = 0.4 + 0.6 * sin(uTime * 0.8 + ph * 30.0) * 0.5 + 0.3;
            gl_Position = projectionMatrix * mv; }`,
        fragmentShader: /* glsl */ `
          uniform float uPresence; uniform vec3 uColor; varying float vA;
          void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d) * vA * 0.35 * uPresence;
            gl_FragColor = vec4(uColor * a, a); }`,
      }),
    [],
  );

  useEffect(
    () => () => {
      [geo, mat, dustGeo, dustMat].forEach((d) => d.dispose());
    },
    [geo, mat, dustGeo, dustMat],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime * rig.timeScale;
    mat.uniforms.uTime.value = t;
    dustMat.uniforms.uTime.value = t;
    mat.uniforms.uPresence.value = presence.current;
    dustMat.uniforms.uPresence.value = presence.current;
  });

  return (
    <group position={[-2.6, 6.2, -1.5]} rotation={[0.25, 0, -0.42]}>
      <mesh geometry={geo} material={mat} />
      <points geometry={dustGeo} material={dustMat} />
    </group>
  );
}

export default function Stock() {
  const quality = useStore((s) => s.quality);
  const count = TIERS[quality].instances;
  return (
    <group position={STOCK_ORIGIN}>
      <directionalLight position={[-4, 8, 2]} intensity={2.4} color={new Color("#ffd9a8")} />
      <pointLight position={[1.5, 1.2, 1.5]} intensity={6} distance={8} color={new Color(PALETTE.clay)} />
      <Trough />
      <FeedStream count={count} />
      <LightShaft />
    </group>
  );
}
