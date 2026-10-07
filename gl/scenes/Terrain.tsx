"use client";

import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, PlaneGeometry, ShaderMaterial } from "three";
import { hash2D } from "@/gl/shaders/noise.glsl";
import { usePresence } from "@/gl/hooks/usePresence";
import { useStore } from "@/store/useStore";
import { TIERS } from "@/lib/quality";
import { PALETTE } from "@/lib/palette";
import { clamp01, damp } from "@/lib/motion";
import { rig } from "@/gl/rig";

/**
 * Procedural farmland. Furrows run away from the camera. A low sun rakes across the rows from
 * the right so every ridge has a lit face and a shadowed face. In the Stock chapter the soil
 * dissolves into straw coloured ground (uStraw).
 */
const vertex = /* glsl */ `
uniform float uTime;
varying vec3 vWorld;
varying float vMacro;
${hash2D}
float macro(vec2 p){ return (fbm(p * 0.08) - 0.5) * 1.6 + (fbm(p * 0.35) - 0.5) * 0.25; }
float ridge(float x){ float s = 0.5 + 0.5 * sin(x * 6.2831 / 0.9); return pow(s, 1.6) * 0.2; }
void main(){
  vec3 p = position;
  // Flatten a corridor down the middle so the camera rail never clips the ground
  float m = macro(p.xz) * (0.2 + 0.8 * smoothstep(3.0, 12.0, abs(p.x)));
  p.y += m + ridge(p.x + sin(p.z * 0.05) * 0.6);
  vMacro = m;
  vec4 w = modelMatrix * vec4(p, 1.0);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

const fragment = /* glsl */ `
uniform vec3 uSoil;
uniform vec3 uLoam;
uniform vec3 uClay;
uniform vec3 uStrawCol;
uniform vec3 uFog;
uniform float uStraw;
uniform float uPresence;
uniform float uDim;
uniform vec3 uCam;
varying vec3 vWorld;
varying float vMacro;
${hash2D}
void main(){
  vec2 xz = vWorld.xz;
  // Analytic ridge slope for crisp shading at any vertex density
  float x = xz.x + sin(xz.y * 0.05) * 0.6;
  float k = 6.2831 / 0.9;
  float s = 0.5 + 0.5 * sin(x * k);
  float dhdx = 1.6 * pow(max(s, 1e-3), 0.6) * 0.5 * cos(x * k) * k * 0.2;
  vec3 n = normalize(vec3(-dhdx, 1.0, 0.0) + vec3(fbm(xz * 3.0) - 0.5, 0.0, fbm(xz * 3.0 + 7.0) - 0.5) * 0.35);
  vec3 L = normalize(vec3(1.0, 0.28, -0.35));
  float diff = max(dot(n, L), 0.0);
  float shadow = smoothstep(0.0, 0.25, diff);

  // Clods and crumbs
  float grainN = hash12(floor(xz * 40.0));
  float clod = fbm(xz * 6.0);
  vec3 soil = mix(uSoil, uLoam, clod) * (0.8 + grainN * 0.4);
  soil = mix(soil, uClay * 0.45, smoothstep(0.55, 0.9, fbm(xz * 0.6)) * 0.5);

  // Straw dissolve
  float d = fbm(xz * 0.7 + 3.0);
  float straw = smoothstep(d - 0.08, d + 0.08, uStraw * 1.2 - 0.1);
  vec3 strawCol = uStrawCol * (0.55 + 0.45 * fbm(vec2(xz.x * 25.0, xz.y * 2.0)));
  vec3 base = mix(soil, strawCol, straw);

  vec3 sun = vec3(1.0, 0.82, 0.6);
  vec3 col = base * (0.06 + diff * 1.25 * sun * shadow) + base * vec3(0.12, 0.14, 0.12) * (n.y * 0.5);
  // Fog toward the theme background
  float dist = length(vWorld - uCam);
  float fog = smoothstep(6.0, 46.0, dist);
  col = mix(col, uFog, fog);
  col *= 1.0 - uDim * 0.6;
  gl_FragColor = vec4(col, uPresence);
}
`;

export default function Terrain({ y = -4.2 }: { y?: number }) {
  const quality = useStore((s) => s.quality);
  const segs = TIERS[quality].terrainSegments;
  const presence = usePresence();

  const geometry = useMemo(() => {
    const g = new PlaneGeometry(44, 80, segs, segs);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -30);
    return g;
  }, [segs]);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        uniforms: {
          uTime: { value: 0 },
          uSoil: { value: new Color(PALETTE.soil).multiplyScalar(1.6) },
          uLoam: { value: new Color(PALETTE.loam).multiplyScalar(1.8) },
          uClay: { value: new Color(PALETTE.clay) },
          uStrawCol: { value: new Color(PALETTE.grain).lerp(new Color(PALETTE.bone), 0.3).multiplyScalar(0.55) },
          uFog: { value: new Color(PALETTE.soil) },
          uStraw: { value: 0 },
          uPresence: { value: 0 },
          uDim: { value: 0 },
          uCam: { value: rig.position.clone() },
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

  useFrame((state, delta) => {
    const u = material.uniforms;
    const homeT = useStore.getState().live.homeT;
    u.uStraw.value = damp(u.uStraw.value, clamp01((homeT - 1.45) / 0.55), 4, Math.min(delta, 0.1));
    u.uPresence.value = presence.current;
    u.uDim.value = rig.dim;
    u.uCam.value.copy(state.camera.position);
    const bg = state.scene.fog?.color;
    if (bg) u.uFog.value.copy(bg);
  });

  return <mesh geometry={geometry} material={material} position={[0, y, 0]} frustumCulled={false} />;
}
