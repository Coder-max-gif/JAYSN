"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  BufferAttribute,
  BufferGeometry,
  NormalBlending,
  Plane,
  Raycaster,
  ShaderMaterial,
  Vector2,
  Vector3,
} from "three";
import { granulesVertex, granulesFragment } from "@/gl/shaders/granules.glsl";
import { sampleTextTargets } from "@/gl/textTargets";
import { usePresence } from "@/gl/hooks/usePresence";
import { useStore } from "@/store/useStore";
import { TIERS } from "@/lib/quality";
import { damp, clamp01 } from "@/lib/motion";
import { rig } from "@/gl/rig";

/** Hero phase timings in seconds after heroStart */
export const HERO_TIMELINE = { gatherStart: 0.5, gatherEnd: 2.3, releaseStart: 3.3, releaseEnd: 5.0 };

const FIELD_Y = -2.5;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function Hero() {
  const quality = useStore((s) => s.quality);
  const count = TIERS[quality].particles;
  const presence = usePresence();
  const { camera, size } = useThree();
  const aspect = size.width / size.height;

  const geometry = useMemo(() => {
    const rand = mulberry32(7);
    const g = new BufferGeometry();
    const pos = new Float32Array(count * 3);
    const field = new Float32Array(count * 3);
    const rnd = new Float32Array(count * 4);
    const fieldW = 16;
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rand() - 0.5) * 26;
      pos[i * 3 + 1] = (rand() - 0.5) * 14;
      pos[i * 3 + 2] = (rand() - 0.5) * 12 - 1;
      // Denser near the camera so the dunes read as a surface
      const z = -Math.pow(rand(), 0.7) * 16 + 4;
      field[i * 3] = (rand() - 0.5) * fieldW * 2 * (1 + (4 - z) * 0.06);
      field[i * 3 + 1] = FIELD_Y + (rand() - 0.5) * 0.12;
      field[i * 3 + 2] = z;
      rnd[i * 4] = rand();
      rnd[i * 4 + 1] = rand() < 0.45 ? 1 : 0;
      rnd[i * 4 + 2] = rand();
      rnd[i * 4 + 3] = rand();
    }
    g.setAttribute("position", new BufferAttribute(pos, 3));
    g.setAttribute("aField", new BufferAttribute(field, 3));
    g.setAttribute("aRand", new BufferAttribute(rnd, 4));
    g.setAttribute("aTarget", new BufferAttribute(new Float32Array(count * 3), 3));
    return g;
  }, [count]);

  // Text targets: rebuilt when fonts are ready and when the layout changes between wide and tall
  const twoLines = aspect < 0.9;
  useEffect(() => {
    let cancelled = false;
    const build = () => {
      if (cancelled) return;
      const worldH = 2 * camera.position.z * Math.tan(((35 / 2) * Math.PI) / 180);
      const worldW = worldH * aspect;
      const pts = sampleTextTargets({
        lines: twoLines ? ["JAYSN", "AGRO"] : ["JAYSN AGRO"],
        worldWidth: Math.min(worldW * (twoLines ? 0.78 : 0.82), 15),
      });
      const n = pts.length / 3;
      if (!n) return;
      const attr = geometry.getAttribute("aTarget") as BufferAttribute;
      const arr = attr.array as Float32Array;
      const rand = mulberry32(11);
      const lift = twoLines ? 0.7 : 0.5;
      for (let i = 0; i < count; i++) {
        const k = Math.floor(rand() * n);
        arr[i * 3] = pts[k * 3] + (rand() - 0.5) * 0.03;
        arr[i * 3 + 1] = pts[k * 3 + 1] + lift + (rand() - 0.5) * 0.03;
        arr[i * 3 + 2] = (rand() - 0.5) * 0.18;
      }
      attr.needsUpdate = true;
    };
    document.fonts.ready.then(build);
    return () => {
      cancelled = true;
    };
    // camera z is stable for the hero station
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geometry, count, twoLines, Math.round(aspect * 10)]);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: granulesVertex,
        fragmentShader: granulesFragment,
        transparent: true,
        depthWrite: false,
        blending: NormalBlending,
        uniforms: {
          uTime: { value: 0 },
          uGather: { value: 0 },
          uRelease: { value: 0 },
          uFall: { value: 0 },
          uPixelRatio: { value: 1 },
          uSize: { value: 0.9 },
          uFocus: { value: 12 },
          uPresence: { value: 0 },
          uPointer: { value: new Vector3(99, 99, 0) },
          uPush: { value: 0 },
          uFloor: { value: -4.1 },
          uDim: { value: 0 },
        },
      }),
    [],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  const ray = useMemo(() => new Raycaster(), []);
  const plane = useMemo(() => new Plane(new Vector3(0, 0, 1), 0), []);
  const ndc = useMemo(() => new Vector2(), []);
  const hit = useMemo(() => new Vector3(), []);
  const smoothPointer = useRef(new Vector3(99, 99, 0));
  const push = useRef(0);
  const clock = useRef(0);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const s = useStore.getState();
    const u = material.uniforms;
    clock.current += dt * rig.timeScale;
    u.uTime.value = clock.current;
    u.uPixelRatio.value = state.gl.getPixelRatio();
    u.uSize.value = size.width < 768 ? 2.6 : 2.3;
    u.uPresence.value = presence.current;
    u.uDim.value = rig.dim;
    u.uFocus.value = camera.position.length();

    // Phase timeline from heroStart
    if (s.reducedMotion) {
      u.uGather.value = 1;
      u.uRelease.value = 1;
    } else if (s.heroStart !== null) {
      const t = (performance.now() - s.heroStart) / 1000;
      const T = HERO_TIMELINE;
      u.uGather.value = clamp01((t - T.gatherStart) / (T.gatherEnd - T.gatherStart));
      u.uRelease.value = clamp01((t - T.releaseStart) / (T.releaseEnd - T.releaseStart));
    }
    u.uFall.value = damp(u.uFall.value, s.live.heroExit, 4, dt);

    // Pointer on the z = 0 plane, damped so the push has inertia
    const p = s.live.pointer;
    ndc.set(p.x, p.y);
    ray.setFromCamera(ndc, camera);
    if (ray.ray.intersectPlane(plane, hit)) {
      smoothPointer.current.x = damp(smoothPointer.current.x, hit.x, 7, dt);
      smoothPointer.current.y = damp(smoothPointer.current.y, hit.y, 7, dt);
    }
    // Field particles sit low: project the pointer down onto the field when it is over it
    u.uPointer.value.copy(smoothPointer.current);
    const targetPush = p.active && !s.reducedMotion ? 0.35 + Math.min(p.speed, 4) * 0.25 : 0;
    push.current = damp(push.current, targetPush, targetPush > push.current ? 6 : 2.2, dt);
    u.uPush.value = push.current;
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
