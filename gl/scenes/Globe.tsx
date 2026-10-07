"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  Group,
  MeshBasicMaterial,
  PlaneGeometry,
  ShaderMaterial,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from "three";
import { loadLandDots, latLonToVec } from "@/gl/data/landDots";
import { usePresence } from "@/gl/hooks/usePresence";
import { useStore } from "@/store/useStore";
import { TIERS } from "@/lib/quality";
import { PALETTE } from "@/lib/palette";
import { clamp01, damp } from "@/lib/motion";
import { company } from "@/content/company";
import { destinations, origins, type Region } from "@/content/services";
import { rig } from "@/gl/rig";
import { regionScreen } from "@/gl/regionScreen";

export type GlobeMode = "home" | "services" | "contact";

const HOME = company.portCoords;
const INDIA_LON = HOME.lon;

interface Route {
  region: Region;
  kind: "export" | "import";
}

const ROUTES: Route[] = [
  ...destinations.map((region) => ({ region, kind: "export" as const })),
  ...origins.map((region) => ({ region, kind: "import" as const })),
];

function arcCurve(from: Region | typeof HOME, to: Region | typeof HOME, r: number) {
  const a = new Vector3(...latLonToVec(from.lat, from.lon, 1));
  const b = new Vector3(...latLonToVec(to.lat, to.lon, 1));
  const angle = a.angleTo(b);
  const pts: Vector3[] = [];
  const n = 48;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    // Spherical interpolation
    const s = Math.sin(angle);
    const p =
      s < 1e-5
        ? a.clone()
        : a
            .clone()
            .multiplyScalar(Math.sin((1 - t) * angle) / s)
            .add(b.clone().multiplyScalar(Math.sin(t * angle) / s));
    const lift = 1 + Math.sin(Math.PI * t) * (0.04 + angle * 0.09);
    pts.push(p.normalize().multiplyScalar(r * lift));
  }
  return new CatmullRomCurve3(pts);
}

const arcVertex = /* glsl */ `
varying float vU;
void main(){ vU = uv.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const arcFragment = /* glsl */ `
uniform float uTime; uniform float uDraw; uniform float uAlpha; uniform vec3 uColor; uniform float uSpeed;
varying float vU;
void main(){
  if (vU > uDraw) discard;
  float head = fract(uTime * uSpeed);
  float d = vU - head; d = d - floor(d + 0.5);
  float glow = exp(-pow(d * 9.0, 2.0));
  float a = (0.28 + glow * 0.9) * uAlpha;
  // Bright tip while drawing
  a += smoothstep(0.06, 0.0, uDraw - vU) * step(uDraw, 0.999) * 0.8 * uAlpha;
  gl_FragColor = vec4(uColor * (0.8 + glow * 0.8), a);
}
`;

function Arc({ route, radius, index }: { route: Route; radius: number; index: number }) {
  const presence = usePresence();
  const { geometry, material, end } = useMemo(() => {
    const exp = route.kind === "export";
    const curve = exp ? arcCurve(HOME, route.region, radius) : arcCurve(route.region, HOME, radius);
    const geometry = new TubeGeometry(curve, 64, radius * 0.0028, 4, false);
    const material = new ShaderMaterial({
      vertexShader: arcVertex,
      fragmentShader: arcFragment,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: index * 0.37 },
        uDraw: { value: 0 },
        uAlpha: { value: 0 },
        uColor: { value: new Color(exp ? PALETTE.grain : PALETTE.bone) },
        uSpeed: { value: 0.32 },
      },
    });
    const end = new Vector3(...latLonToVec(route.region.lat, route.region.lon, radius * 1.002));
    return { geometry, material, end };
  }, [route, radius, index]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  const pulseMat = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uAlpha: { value: 0 }, uColor: { value: material.uniforms.uColor.value } },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform float uTime; uniform float uAlpha; uniform vec3 uColor; varying vec2 vUv;
          void main(){ float d = length(vUv - 0.5) * 2.0; float ph = fract(uTime * 0.6);
            float ring = smoothstep(0.08, 0.0, abs(d - ph)) * (1.0 - ph);
            float core = smoothstep(0.22, 0.12, d);
            float a = (ring + core) * uAlpha; gl_FragColor = vec4(uColor * a, a); }`,
      }),
    [material],
  );
  const pulseGeo = useMemo(() => new PlaneGeometry(radius * 0.09, radius * 0.09), [radius]);
  useEffect(() => () => {
    pulseMat.dispose();
    pulseGeo.dispose();
  }, [pulseMat, pulseGeo]);

  const pulseRef = useRef<Group>(null);
  useEffect(() => {
    const id = route.region.id;
    return () => {
      const r = regionScreen[id];
      if (r) {
        r.label = 0;
        r.visible = false;
      }
    };
  }, [route]);
  const world = useMemo(() => new Vector3(), []);
  const toCam = useMemo(() => new Vector3(), []);

  useFrame((state, dt) => {
    const u = material.uniforms;
    const s = useStore.getState();
    const g = globeState;
    u.uTime.value += Math.min(dt, 0.1) * rig.timeScale * (route.kind === "import" ? 1 : 1);
    // Draw in, staggered per arc
    const draw = clamp01(g.draw * 1.4 - index * 0.04);
    u.uDraw.value = draw;
    // Emphasis by service hover and region hover
    let emphasis = 1;
    if (s.serviceHover) emphasis = s.serviceHover === route.kind ? 1.6 : 0.25;
    if (s.regionHover) emphasis = s.regionHover === route.region.id ? 2 : 0.3;
    if (g.mode === "contact") emphasis = s.contactRegion === route.region.id ? 2 : 0.35;
    const targetAlpha = presence.current * g.visibility * emphasis;
    u.uAlpha.value = damp(u.uAlpha.value, targetAlpha, 5, Math.min(dt, 0.1));
    u.uSpeed.value = s.serviceHover === route.kind ? 0.55 : 0.32;
    pulseMat.uniforms.uTime.value = u.uTime.value;
    const arrived = draw >= 0.999 ? 1 : 0;
    pulseMat.uniforms.uAlpha.value = u.uAlpha.value * arrived;

    if (pulseRef.current) {
      pulseRef.current.lookAt(pulseRef.current.parent!.localToWorld(end.clone().multiplyScalar(2)));
    }
    if (pulseRef.current) {
      pulseRef.current.getWorldPosition(world);
      const center = pulseRef.current.parent!.getWorldPosition(toCam.set(0, 0, 0));
      const normal = world.clone().sub(center).normalize();
      const facing = normal.dot(toCam.copy(state.camera.position).sub(world).normalize());
      const vis = arrived * clamp01((facing - 0.1) * 4) * clamp01(u.uAlpha.value * 1.5) * g.labels;
      const ndc = world.clone().project(state.camera);
      regionScreen[route.region.id] = {
        x: (ndc.x * 0.5 + 0.5) * state.size.width,
        y: (-ndc.y * 0.5 + 0.5) * state.size.height,
        visible: facing > 0.1 && u.uAlpha.value > 0.05,
        label: vis,
      };
    }
  });

  return (
    <>
      <mesh geometry={geometry} material={material} />
      <group ref={pulseRef} position={end}>
        <mesh geometry={pulseGeo} material={pulseMat} />
      </group>
    </>
  );
}

/** Mutable globe animation state shared by the dots and arcs */
const globeState = { draw: 0, visibility: 0, labels: 1, mode: "home" as GlobeMode };

const dotVertex = /* glsl */ `
uniform float uPixelRatio; uniform float uSize; uniform vec3 uHighlight; uniform float uHighlightAmt;
varying float vFacing; varying float vHi;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vec3 n = normalize(normalMatrix * normalize(position));
  vFacing = dot(n, normalize(-mv.xyz));
  vHi = smoothstep(0.25, 0.0, distance(normalize(position), uHighlight)) * uHighlightAmt;
  gl_PointSize = uSize * uPixelRatio * (10.0 / -mv.z) * (1.0 + vHi * 0.8);
  gl_Position = projectionMatrix * mv;
}
`;
const dotFragment = /* glsl */ `
uniform vec3 uColor; uniform vec3 uGold; uniform float uAlpha;
varying float vFacing; varying float vHi;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.3, d) * mix(0.12, 0.85, smoothstep(-0.1, 0.6, vFacing)) * uAlpha;
  gl_FragColor = vec4(mix(uColor, uGold, vHi), a);
}
`;

export default function Globe({
  mode,
  radius = 5,
  position = [0, 0, 0],
}: {
  mode: GlobeMode;
  radius?: number;
  position?: [number, number, number];
}) {
  const presence = usePresence();
  const quality = useStore((s) => s.quality);
  const density = TIERS[quality].globeDots;
  const [dots, setDots] = useState<Float32Array | null>(null);
  const group = useRef<Group>(null);
  const spin = useRef(group);

  useEffect(() => {
    let alive = true;
    loadLandDots()
      .then((d) => alive && setDots(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const dotGeo = useMemo(() => {
    if (!dots) return null;
    const n = dots.length / 2;
    const keep: number[] = [];
    for (let i = 0; i < n; i++) {
      if (density < 1 && (i * 0.618034) % 1 > density) continue;
      keep.push(...latLonToVec(dots[i * 2], dots[i * 2 + 1], radius));
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(keep), 3));
    return g;
  }, [dots, density, radius]);

  const dotMat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: dotVertex,
        fragmentShader: dotFragment,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uPixelRatio: { value: 1 },
          uSize: { value: 4.2 },
          uColor: { value: new Color(PALETTE.bone) },
          uGold: { value: new Color(PALETTE.grain) },
          uAlpha: { value: 0 },
          uHighlight: { value: new Vector3(...latLonToVec(HOME.lat, HOME.lon, 1)) },
          uHighlightAmt: { value: 0 },
        },
      }),
    [],
  );
  const occluderGeo = useMemo(() => new SphereGeometry(radius * 0.985, 48, 32), [radius]);
  const occluderMat = useMemo(() => new MeshBasicMaterial({ color: PALETTE.soil, transparent: true }), []);

  useEffect(
    () => () => {
      dotGeo?.dispose();
    },
    [dotGeo],
  );
  useEffect(
    () => () => {
      dotMat.dispose();
      occluderGeo.dispose();
      occluderMat.dispose();
    },
    [dotMat, occluderGeo, occluderMat],
  );

  const homePin = useMemo(() => new Vector3(...latLonToVec(HOME.lat, HOME.lon, radius)), [radius]);
  const regionVec = useMemo(() => new Vector3(), []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const s = useStore.getState();
    globeState.mode = mode;
    // Visibility and draw progress per mode
    let vis = 1;
    let draw = 1;
    if (mode === "home") {
      const t = s.live.homeT;
      vis = clamp01((t - 2.55) / 0.35) * (1 - clamp01((t - 3.8) / 0.4) * 0.55);
      draw = clamp01((t - 2.75) / 0.6);
      globeState.labels = t < 3.8 && state.size.width >= 768 ? 1 : 0;
    } else {
      globeState.labels = mode === "services" && state.size.width >= 768 ? 1 : 0;
      // Small screens: the globe sits behind the copy, keep it quiet
      if (state.size.width < 768) vis = 0.4;
    }
    globeState.visibility = damp(globeState.visibility, vis, 4, dt);
    globeState.draw = mode === "home" ? draw : damp(globeState.draw, 1, 0.9, dt);

    dotMat.uniforms.uAlpha.value = presence.current * globeState.visibility;
    dotMat.uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    occluderMat.color.copy(state.scene.fog?.color ?? new Color(PALETTE.soil));
    occluderMat.opacity = presence.current * globeState.visibility;

    // Highlight: hovered region, contact selection or home port
    const regionId = s.regionHover ?? (mode === "contact" ? s.contactRegion : null);
    const region = [...destinations, ...origins].find((r) => r.id === regionId);
    if (region) {
      regionVec.set(...latLonToVec(region.lat, region.lon, 1));
      dotMat.uniforms.uHighlight.value.lerp(regionVec, 0.2).normalize();
      dotMat.uniforms.uHighlightAmt.value = damp(dotMat.uniforms.uHighlightAmt.value, 1, 6, dt);
    } else {
      regionVec.set(...latLonToVec(HOME.lat, HOME.lon, 1));
      dotMat.uniforms.uHighlight.value.lerp(regionVec, 0.2).normalize();
      dotMat.uniforms.uHighlightAmt.value = damp(
        dotMat.uniforms.uHighlightAmt.value,
        mode === "contact" ? 1 : 0.5,
        4,
        dt,
      );
    }

    // Rotation: India faces the camera, slow drift
    if (group.current) {
      const base = (-INDIA_LON * Math.PI) / 180;
      const time = state.clock.elapsedTime * rig.timeScale;
      let drift = Math.sin(time * 0.06) * 0.35;
      if (mode === "home") drift = (s.live.homeT - 3.5) * 0.5;
      if (s.reducedMotion) drift = 0;
      // Hovering a door turns the globe a little toward the flow
      if (s.serviceHover === "import") drift += 0.25;
      if (s.serviceHover === "export") drift -= 0.25;
      group.current.rotation.y = damp(group.current.rotation.y, base + drift, 2, dt);
      group.current.rotation.x = damp(group.current.rotation.x, 0.28, 2, dt);
    }
  });
  void spin;

  return (
    <group position={position}>
      <group ref={group}>
        <mesh geometry={occluderGeo} material={occluderMat} renderOrder={-1} />
        {dotGeo && <points geometry={dotGeo} material={dotMat} />}
        {ROUTES.map((r, i) => (
          <Arc key={r.region.id} route={r} radius={radius} index={i} />
        ))}
        <HomePin position={homePin} radius={radius} />
      </group>
    </group>
  );
}

function HomePin({ position, radius }: { position: Vector3; radius: number }) {
  const ref = useRef<Group>(null);
  const presence = usePresence();
  const mat = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uAlpha: { value: 0 }, uColor: { value: new Color(PALETTE.grain) } },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform float uTime; uniform float uAlpha; uniform vec3 uColor; varying vec2 vUv;
          void main(){ float d = length(vUv - 0.5) * 2.0;
            float a = 0.0;
            for (int i = 0; i < 2; i++){ float ph = fract(uTime * 0.4 + float(i) * 0.5);
              a += smoothstep(0.06, 0.0, abs(d - ph)) * (1.0 - ph); }
            a += smoothstep(0.16, 0.08, d);
            a *= uAlpha; gl_FragColor = vec4(uColor * a, a); }`,
      }),
    [],
  );
  const geo = useMemo(() => new PlaneGeometry(radius * 0.16, radius * 0.16), [radius]);
  useEffect(() => () => {
    mat.dispose();
    geo.dispose();
  }, [mat, geo]);
  useFrame((state) => {
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    mat.uniforms.uAlpha.value = presence.current * globeState.visibility;
    if (ref.current) ref.current.lookAt(ref.current.parent!.localToWorld(position.clone().multiplyScalar(2)));
  });
  return (
    <group ref={ref} position={position}>
      <mesh geometry={geo} material={mat} />
    </group>
  );
}
