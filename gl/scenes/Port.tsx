"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import {
  BoxGeometry,
  CanvasTexture,
  Color,
  Group,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  RepeatWrapping,
  ShaderMaterial,
  SRGBColorSpace,
} from "three";
import { usePresence } from "@/gl/hooks/usePresence";
import { PALETTE } from "@/lib/palette";
import { hash2D } from "@/gl/shaders/noise.glsl";
import { rig } from "@/gl/rig";
import { useStore } from "@/store/useStore";
import { clamp01 } from "@/lib/motion";

/** Trade chapter station: a container yard at dusk, bagged goods on a pallet, a ship on the horizon. */
export const PORT_ORIGIN: [number, number, number] = [0, -4.2, -98];

function ribTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 64;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#bdbdbd";
  ctx.fillRect(0, 0, 256, 64);
  for (let x = 0; x < 256; x += 8) {
    ctx.fillStyle = x % 16 === 0 ? "#e6e6e6" : "#8a8a8a";
    ctx.fillRect(x, 0, 4, 64);
  }
  // Small stencilled code block
  ctx.fillStyle = "#f4f4f4";
  ctx.fillRect(196, 8, 48, 14);
  const t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  t.colorSpace = SRGBColorSpace;
  return t;
}

const CONTAINER_COLORS = [
  new Color(PALETTE.clay).multiplyScalar(0.9),
  new Color(PALETTE.moss).multiplyScalar(1.3),
  new Color(PALETTE.sea).multiplyScalar(1.8),
  new Color(PALETTE.bone).multiplyScalar(0.55),
  new Color("#5a2f25"),
  new Color(PALETTE.grain).multiplyScalar(0.6),
];

function Containers() {
  const ref = useRef<InstancedMesh>(null);
  const tex = useMemo(() => ribTexture(), []);
  const geo = useMemo(() => new BoxGeometry(2.4, 0.52, 0.48), []);
  const mat = useMemo(() => new MeshStandardMaterial({ map: tex, roughness: 0.7, metalness: 0.2 }), [tex]);
  const layout = useMemo(() => {
    const items: { x: number; y: number; z: number }[] = [];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 4; col++) {
        const stack = 1 + Math.floor(Math.abs(Math.sin(row * 3.1 + col * 7.7)) * 4);
        for (let h = 0; h < stack; h++) {
          items.push({ x: -6 + col * 2.7 + (row % 2) * 0.2, y: 0.26 + h * 0.53, z: -row * 0.62 - 1.2 });
        }
      }
    }
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 3; col++) {
        const stack = 1 + Math.floor(Math.abs(Math.cos(row * 5.3 + col * 2.1)) * 3);
        for (let h = 0; h < stack; h++) items.push({ x: 3.2 + col * 2.7, y: 0.26 + h * 0.53, z: -row * 0.62 - 3.6 });
      }
    }
    return items;
  }, []);
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    const d = new Object3D();
    layout.forEach((it, i) => {
      d.position.set(it.x, it.y, it.z);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
      m.setColorAt(i, CONTAINER_COLORS[(i * 7 + Math.floor(it.x)) % CONTAINER_COLORS.length]);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [layout]);
  useEffect(() => () => {
    tex.dispose();
    geo.dispose();
    mat.dispose();
  }, [tex, geo, mat]);
  return <instancedMesh ref={ref} args={[geo, mat, layout.length]} />;
}

function Pallet() {
  const bagGeo = useMemo(() => {
    const g = new BoxGeometry(0.62, 0.16, 0.38, 6, 2, 4);
    // Soft pillow deformation
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i) / 0.31;
      const z = p.getZ(i) / 0.19;
      const y = p.getY(i);
      p.setY(i, y * (1 - 0.45 * Math.max(x * x, z * z)));
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const bagMat = useMemo(() => new MeshStandardMaterial({ color: new Color(PALETTE.bone).multiplyScalar(0.8), roughness: 0.95 }), []);
  const woodGeo = useMemo(() => new BoxGeometry(1.3, 0.12, 1.1), []);
  const woodMat = useMemo(() => new MeshStandardMaterial({ color: new Color(PALETTE.clay).multiplyScalar(0.7), roughness: 1 }), []);
  useEffect(() => () => {
    [bagGeo, bagMat, woodGeo, woodMat].forEach((d) => d.dispose());
  }, [bagGeo, bagMat, woodGeo, woodMat]);
  const bags = [];
  for (let layer = 0; layer < 5; layer++) {
    for (let i = 0; i < 4; i++) {
      const rot = layer % 2 === 0;
      const x = rot ? (i % 2) * 0.64 - 0.32 : (i < 2 ? -0.2 : 0.2);
      const z = rot ? Math.floor(i / 2) * 0.4 - 0.2 : (i % 2) * 0.64 - 0.32;
      bags.push(
        <mesh
          key={`${layer}-${i}`}
          geometry={bagGeo}
          material={bagMat}
          position={[x, 0.14 + layer * 0.15, z]}
          rotation={[0, rot ? 0 : Math.PI / 2, 0]}
        />,
      );
    }
  }
  return (
    <group position={[1.4, 0, 2.6]} rotation={[0, -0.3, 0]}>
      <mesh geometry={woodGeo} material={woodMat} position={[0, 0.06, 0]} />
      {bags}
    </group>
  );
}

function Horizon() {
  const presence = usePresence();
  const geo = useMemo(() => new PlaneGeometry(400, 60), []);
  const mat = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uPresence: { value: 0 },
          uSea: { value: new Color(PALETTE.sea) },
          uDusk: { value: new Color(PALETTE.clay) },
          uGold: { value: new Color(PALETTE.grain) },
        },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform float uPresence; uniform vec3 uSea; uniform vec3 uDusk; uniform vec3 uGold; varying vec2 vUv;
          void main(){
            float h = vUv.y; // 0 bottom, horizon at 0.5
            float band = exp(-pow((h - 0.5) * 22.0, 2.0));
            vec3 sky = mix(uDusk * 0.55, uSea * 0.7, smoothstep(0.5, 0.9, h));
            vec3 water = uSea * 0.45 * (0.7 + 0.3 * smoothstep(0.5, 0.0, h));
            vec3 col = h > 0.5 ? sky : water;
            col += uGold * band * 0.35;
            gl_FragColor = vec4(col, uPresence);
          }`,
      }),
    [],
  );
  useEffect(() => () => {
    geo.dispose();
    mat.dispose();
  }, [geo, mat]);
  useFrame(() => {
    mat.uniforms.uPresence.value = presence.current;
  });
  return <mesh geometry={geo} material={mat} position={[0, 0, -60]} />;
}

function Water() {
  const presence = usePresence();
  const geo = useMemo(() => {
    const g = new PlaneGeometry(400, 60);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const mat = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        uniforms: {
          uTime: { value: 0 },
          uPresence: { value: 0 },
          uSea: { value: new Color(PALETTE.sea) },
          uGold: { value: new Color(PALETTE.grain) },
        },
        vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
        fragmentShader: `uniform float uTime; uniform float uPresence; uniform vec3 uSea; uniform vec3 uGold; varying vec3 vW;
          ${hash2D}
          void main(){
            float n = fbm(vec2(vW.x * 0.4, vW.z * 2.0 + uTime * 0.2));
            float glint = smoothstep(0.72, 0.9, n) * smoothstep(40.0, 0.0, abs(vW.x - 8.0)) * 0.35;
            vec3 col = uSea * (0.35 + n * 0.25) + uGold * glint;
            gl_FragColor = vec4(col, uPresence);
          }`,
      }),
    [],
  );
  useEffect(() => () => {
    geo.dispose();
    mat.dispose();
  }, [geo, mat]);
  useFrame((state) => {
    mat.uniforms.uTime.value = state.clock.elapsedTime * rig.timeScale;
    mat.uniforms.uPresence.value = presence.current;
  });
  return <mesh geometry={geo} material={mat} position={[0, -0.05, -38]} />;
}

/** Line art ship silhouette crossing the horizon */
function Ship() {
  const ref = useRef<Group>(null);
  const points = useMemo(
    () =>
      [
        [-3, 0], [-2.6, -0.5], [2.8, -0.5], [3.4, 0.15], [-3, 0],
        [-2.2, 0], [-2.2, 0.55], [-1.2, 0.55], [-1.2, 0], [-0.9, 0], [-0.9, 0.42], [1.6, 0.42], [1.6, 0],
        [1.9, 0], [1.9, 0.9], [2.4, 0.9], [2.4, 0.15],
      ].map(([x, y]) => [x, y, 0] as [number, number, number]),
    [],
  );
  useFrame((state) => {
    if (!ref.current) return;
    const s = useStore.getState();
    const t = s.reducedMotion ? 0 : state.clock.elapsedTime;
    ref.current.position.x = -30 + ((t * 0.6) % 60) + clamp01(s.live.homeT - 2) * 6;
  });
  return (
    <group ref={ref} position={[0, 0.55, -40]}>
      <Line points={points} color={PALETTE.grain} lineWidth={1} transparent opacity={0.7} />
    </group>
  );
}

function Yard() {
  const geo = useMemo(() => {
    const g = new PlaneGeometry(40, 16);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const mat = useMemo(() => new MeshStandardMaterial({ color: new Color(PALETTE.loam).multiplyScalar(1.4), roughness: 1 }), []);
  useEffect(() => () => {
    geo.dispose();
    mat.dispose();
  }, [geo, mat]);
  return <mesh geometry={geo} material={mat} position={[0, 0, 0]} />;
}

export default function Port() {
  return (
    <group position={PORT_ORIGIN}>
      <directionalLight position={[8, 3, -10]} intensity={2.2} color={new Color("#ffb27a")} />
      <hemisphereLight args={[new Color(PALETTE.sea), new Color(PALETTE.soil), 1.2]} />
      <Horizon />
      <Water />
      <Ship />
      <Yard />
      <Containers />
      <Pallet />
    </group>
  );
}
