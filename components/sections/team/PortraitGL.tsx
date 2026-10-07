"use client";

import { useEffect, useRef } from "react";
import { PALETTE } from "@/lib/palette";
import { useStore } from "@/store/useStore";

/**
 * Portrait with a custom shader: duotone (soil and bone) by default, resolving to full colour
 * from the pointer outward like a spotlight, with a small ripple that settles. Works with the
 * client photo, or with a drawn placeholder (initials, never a generated face) until then.
 */
const VERT = `#version 300 es
in vec2 p; out vec2 vUv; void main(){ vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;
const FRAG = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uTex; uniform vec2 uPointer; uniform float uReveal; uniform float uRipple; uniform float uTime;
uniform vec3 uDark; uniform vec3 uLight; uniform float uAspect;
void main(){
  vec2 uv = vUv;
  vec2 d = uv - uPointer; d.x *= uAspect;
  float dist = length(d);
  // Ripple that decays
  uv += normalize(d + 1e-4) * sin(dist * 40.0 - uTime * 8.0) * 0.006 * uRipple * smoothstep(0.6, 0.0, dist);
  vec3 c = texture(uTex, vec2(uv.x, 1.0 - uv.y)).rgb;
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  vec3 duo = mix(uDark, uLight, smoothstep(0.05, 0.95, l));
  float spot = smoothstep(uReveal, uReveal * 0.45, dist);
  o = vec4(mix(duo, c, spot), 1.0);
}`;

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

function drawPlaceholder(name: string, w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, PALETTE.loam);
  g.addColorStop(1, PALETTE.soil);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const r = ctx.createRadialGradient(w / 2, h * 0.38, 0, w / 2, h * 0.38, w * 0.7);
  r.addColorStop(0, "rgba(138,90,59,0.55)");
  r.addColorStop(1, "rgba(138,90,59,0)");
  ctx.fillStyle = r;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(201,162,75,0.5)";
  ctx.setLineDash([6, 6]);
  ctx.strokeRect(w * 0.08, h * 0.08, w * 0.84, h * 0.84);
  const display = getComputedStyle(document.documentElement).getPropertyValue("--ff-display").trim() || "serif";
  const initials = name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  ctx.fillStyle = PALETTE.bone;
  ctx.textAlign = "center";
  ctx.font = `italic 400 ${Math.round(w * 0.36)}px ${display}`;
  ctx.fillText(initials, w / 2, h * 0.56);
  ctx.fillStyle = PALETTE.grain;
  ctx.font = `500 ${Math.round(w * 0.032)}px monospace`;
  ctx.fillText("PORTRAIT TO BE SUPPLIED", w / 2, h * 0.86);
  return c;
}

export default function PortraitGL({
  name,
  label,
  src,
  className,
}: {
  name: string;
  /** Alt text: name and role */
  label?: string;
  src?: string;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { antialias: false });
    if (!gl) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    const sh = (t: number, s: string) => {
      const x = gl.createShader(t)!;
      gl.shaderSource(x, s);
      gl.compileShader(x);
      return x;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n: string) => gl.getUniformLocation(prog, n);
    gl.uniform3fv(U("uDark"), hex(PALETTE.soil));
    gl.uniform3fv(U("uLight"), hex(PALETTE.bone));
    gl.uniform1f(U("uAspect"), canvas.width / canvas.height);

    const tex = gl.createTexture();
    const upload = (source: TexImageSource) => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    };
    upload(drawPlaceholder(name, 400, 500));
    if (src) {
      const img = new Image();
      img.onload = () => upload(img);
      img.src = src;
    }

    const state = { px: 0.5, py: 0.5, reveal: 0, ripple: 1, t0: performance.now(), inside: false };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      state.px = (e.clientX - r.left) / r.width;
      state.py = (e.clientY - r.top) / r.height;
      state.inside = state.px >= -0.2 && state.px <= 1.2 && state.py >= -0.2 && state.py <= 1.2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    const loop = () => {
      const t = (performance.now() - state.t0) / 1000;
      const reduced = useStore.getState().reducedMotion;
      const target = reduced ? 1.5 : state.inside ? 0.55 : 0.32;
      state.reveal += (target - state.reveal) * 0.08;
      state.ripple = reduced ? 0 : Math.max(0, 1 - t / 1.2);
      gl.uniform2f(U("uPointer"), state.inside ? state.px : 0.5, state.inside ? state.py : 0.4);
      gl.uniform1f(U("uReveal"), state.reveal);
      gl.uniform1f(U("uRipple"), state.ripple);
      gl.uniform1f(U("uTime"), t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
  }, [name, src]);

  return <canvas ref={ref} className={className} role="img" aria-label={label ?? name} />;
}
