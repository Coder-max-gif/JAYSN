import { noise3D } from "./noise.glsl";

/**
 * Hero granule field. Vertex shader driven (no GPGPU): every particle position is a pure
 * function of its attributes and a handful of phase uniforms, so it runs on any WebGL2 device.
 * See decisions.md for why this was chosen over FBO ping pong.
 *
 * Phases: drift (curl noise) -> gather (text targets) -> hold (breathing) -> release (dune field)
 * Scroll: uFall drops and compresses the field toward the furrows (hand off to Soil).
 */
export const granulesVertex = /* glsl */ `
uniform float uTime;
uniform float uGather;
uniform float uRelease;
uniform float uFall;
uniform float uPixelRatio;
uniform float uSize;
uniform float uFocus;
uniform float uPresence;
uniform vec3 uPointer;
uniform float uPush;
uniform float uFloor;

attribute vec3 aTarget;
attribute vec3 aField;
attribute vec4 aRand; // x size, y shape (0 prill, 1 pellet), z colour pick, w phase

varying vec3 vColor;
varying float vShape;
varying float vAngle;
varying float vBlur;
varying float vAlpha;
varying float vGold;

${noise3D}

const vec3 BONE = vec3(0.929, 0.910, 0.855);
const vec3 GRAIN = vec3(0.788, 0.635, 0.294);
const vec3 MOSS = vec3(0.235, 0.290, 0.165);
const vec3 CLAY = vec3(0.541, 0.353, 0.231);

float dune(vec2 p, float t){
  return sin(p.x * 0.55 + p.y * 0.35 + t * 0.15) * 0.22
       + sin(p.x * 1.3 - p.y * 0.8 - t * 0.1) * 0.08
       + sin(p.y * 1.9 + t * 0.2) * 0.04;
}

void main(){
  float t = uTime;
  float ph = aRand.w;

  // Drift: slow curl flow in dark space
  vec3 drift = position;
  if (uGather < 0.999) {
    vec3 flow = curlish(position * 0.12 + vec3(0.0, 0.0, t * 0.035));
    drift += flow * 1.6 + vec3(sin(t * 0.2 + ph * 6.28) * 0.3, cos(t * 0.17 + ph * 6.28) * 0.3, 0.0);
  }

  // Per particle stagger so the gather sweeps instead of snapping
  float g = clamp(uGather * 1.35 - ph * 0.35, 0.0, 1.0);
  g = 1.0 - pow(1.0 - g, 3.0);
  vec3 target = aTarget + vec3(
    sin(t * 1.3 + ph * 40.0) * 0.012,
    cos(t * 1.1 + ph * 30.0) * 0.012,
    sin(t * 0.9 + ph * 20.0) * 0.03);
  vec3 p = mix(drift, target, g);

  // Release into a dune field, poured from the word
  float r = clamp(uRelease * 1.4 - ph * 0.4, 0.0, 1.0);
  r = r < 0.5 ? 4.0 * r * r * r : 1.0 - pow(-2.0 * r + 2.0, 3.0) / 2.0;
  vec3 field = aField;
  field.y += dune(aField.xz, t);
  // Arc the path so granules fall rather than slide
  vec3 mid = mix(p, field, 0.5) + vec3(0.0, 0.6 * (1.0 - ph), 0.0);
  vec3 a = mix(p, mid, r);
  vec3 b = mix(mid, field, r);
  p = mix(a, b, r);

  // Scroll: fall and compress toward the furrows
  float f = clamp(uFall * (1.0 + ph * 0.6), 0.0, 1.0);
  f = f * f * (3.0 - 2.0 * f);
  p.y = mix(p.y, uFloor + (p.y - uFloor) * 0.12, f);
  p.x *= 1.0 - f * 0.18;

  // Pointer push with falloff
  vec3 d = p - uPointer;
  float dist = length(d.xy);
  float push = smoothstep(1.9, 0.0, dist) * uPush;
  p.xy += normalize(d.xy + 1e-4) * push * 0.9;
  p.z += push * 0.6;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;

  // Depth of field: blur grows away from the focus distance
  float depth = -mv.z;
  float coc = clamp(abs(depth - uFocus) * 0.11, 0.0, 1.0);
  vBlur = coc;
  float size = uSize * (0.55 + aRand.x * 0.9) * (1.0 + coc * 1.6);
  gl_PointSize = size * uPixelRatio * (10.0 / depth);

  // Colour inside the palette. Gold is rare.
  float c = aRand.z;
  vec3 col = c < 0.38 ? MOSS * 1.35 : c < 0.66 ? CLAY * 1.1 : c < 0.9 ? BONE * 0.72 : GRAIN * 1.55;
  vGold = c >= 0.9 ? 1.0 : 0.0;
  vColor = col;
  vShape = aRand.y;
  vAngle = ph * 6.2831 + t * 0.05 * (ph - 0.5);
  vAlpha = uPresence * (1.0 - coc * 0.55) * smoothstep(60.0, 8.0, depth);
}
`;

export const granulesFragment = /* glsl */ `
varying vec3 vColor;
varying float vShape;
varying float vAngle;
varying float vBlur;
varying float vAlpha;
varying float vGold;
uniform float uDim;

void main(){
  vec2 uv = gl_PointCoord * 2.0 - 1.0;
  uv.y = -uv.y;
  // Pellets: rotated ellipse. Prills: circle.
  float s = sin(vAngle), c = cos(vAngle);
  vec2 q = mat2(c, -s, s, c) * uv;
  float stretch = mix(1.0, 1.9, vShape);
  q.x *= stretch;
  float r2 = dot(q, q);
  float edge = 1.0 - vBlur * 0.6;
  float alpha = 1.0 - smoothstep(edge * 0.82, 1.0, r2);
  if (alpha < 0.01) discard;

  // Fake sphere normal, warm low sun from the right
  vec3 n = normalize(vec3(q, sqrt(max(0.0, 1.0 - min(r2, 1.0)))));
  vec3 L = normalize(vec3(0.85, 0.35, 0.45));
  float diff = max(dot(n, L), 0.0);
  float rim = pow(1.0 - n.z, 2.5) * max(dot(normalize(n.xy + 1e-4), normalize(L.xy)), 0.0);
  float spec = pow(max(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0), 18.0) * (0.25 + vGold * 0.6);
  vec3 sun = vec3(1.0, 0.86, 0.66);
  vec3 col = vColor * (0.12 + diff * 0.95 * sun) + rim * sun * 0.45 + spec * sun;
  col *= 1.0 - uDim * 0.6;
  gl_FragColor = vec4(col, alpha * vAlpha);
}
`;
