"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  Group,
  ShaderMaterial,
  TubeGeometry,
  Vector3,
} from "three";
import { usePresence } from "@/gl/hooks/usePresence";
import { useStore } from "@/store/useStore";
import { PALETTE } from "@/lib/palette";
import { rig } from "@/gl/rig";

/**
 * The farm loop motif in 3D: a thin gold closed line, slowly turning, with soft granule dust.
 * Calm and low contrast so text in front stays easy to read. Used on Team and as ambience.
 */
export default function LoopScene({
  position = [2.5, 0, -2],
  scale = 1,
  dust = 900,
}: {
  position?: [number, number, number];
  scale?: number;
  dust?: number;
}) {
  const presence = usePresence();
  const group = useRef<Group>(null);

  const { geo, mat } = useMemo(() => {
    const pts: Vector3[] = [];
    const n = 12;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      // Slightly irregular loop: soil, feed, cattle, back to soil
      const r = 3 + Math.sin(a * 2) * 0.35 + Math.cos(a * 3) * 0.2;
      pts.push(new Vector3(Math.cos(a) * r, Math.sin(a) * r * 0.82, Math.sin(a * 2) * 0.6));
    }
    const curve = new CatmullRomCurve3(pts, true, "centripetal");
    const geo = new TubeGeometry(curve, 400, 0.008, 5, true);
    const mat = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uAlpha: { value: 0 }, uColor: { value: new Color(PALETTE.grain) } },
      vertexShader: `varying float vU; void main(){ vU = uv.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform float uTime; uniform float uAlpha; uniform vec3 uColor; varying float vU;
        void main(){ float h = fract(uTime * 0.04); float d = vU - h; d -= floor(d + 0.5);
          float glow = exp(-pow(d * 6.0, 2.0)); float a = (0.35 + glow * 0.65) * uAlpha;
          gl_FragColor = vec4(uColor * a, a); }`,
    });
    return { geo, mat };
  }, []);

  const dustGeo = useMemo(() => {
    const p = new Float32Array(dust * 3);
    for (let i = 0; i < dust; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 3 + (Math.random() - 0.5) * 1.6;
      p[i * 3] = Math.cos(a) * r;
      p[i * 3 + 1] = Math.sin(a) * r * 0.82 + (Math.random() - 0.5) * 0.6;
      p[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(p, 3));
    return g;
  }, [dust]);
  const dustMat = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uAlpha: { value: 0 },
          uBone: { value: new Color(PALETTE.bone) },
          uMoss: { value: new Color(PALETTE.moss) },
        },
        vertexShader: `uniform float uTime; varying float vPh;
          void main(){ vec3 p = position; float ph = fract(sin(dot(p.xy, vec2(12.9,78.2))) * 43758.5); vPh = ph;
            p += vec3(sin(uTime * 0.2 + ph * 30.0), cos(uTime * 0.17 + ph * 20.0), 0.0) * 0.08;
            vec4 mv = modelViewMatrix * vec4(p,1.0); gl_PointSize = (2.0 + ph * 3.0) * (10.0 / -mv.z);
            gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `uniform float uAlpha; uniform vec3 uBone; uniform vec3 uMoss; varying float vPh;
          void main(){ vec2 uv = gl_PointCoord * 2.0 - 1.0; float r = dot(uv, uv); if (r > 1.0) discard;
            vec3 n = vec3(uv, sqrt(1.0 - r)); float l = max(dot(n, normalize(vec3(0.7, 0.4, 0.6))), 0.0);
            vec3 c = mix(uMoss * 1.6, uBone * 0.7, vPh) * (0.15 + l * 0.8);
            gl_FragColor = vec4(c, (1.0 - smoothstep(0.7, 1.0, r)) * 0.5 * uAlpha); }`,
      }),
    [],
  );

  useEffect(() => () => {
    [geo, mat, dustGeo, dustMat].forEach((d) => d.dispose());
  }, [geo, mat, dustGeo, dustMat]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime * rig.timeScale;
    const reduced = useStore.getState().reducedMotion;
    mat.uniforms.uTime.value = reduced ? 3 : t;
    dustMat.uniforms.uTime.value = reduced ? 0 : t;
    const dim = 1 - rig.dim * 0.6;
    mat.uniforms.uAlpha.value = presence.current * 0.75 * dim;
    dustMat.uniforms.uAlpha.value = presence.current * dim;
    if (group.current && !reduced) {
      group.current.rotation.z += Math.min(dt, 0.1) * 0.03 * rig.timeScale;
      group.current.rotation.y = Math.sin(t * 0.1) * 0.25;
    }
  });

  return (
    <group position={position} scale={scale}>
      <group ref={group} rotation={[0.35, 0, 0]}>
        <mesh geometry={geo} material={mat} />
        <points geometry={dustGeo} material={dustMat} />
      </group>
    </group>
  );
}
