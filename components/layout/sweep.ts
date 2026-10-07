"use client";

import { PALETTE } from "@/lib/palette";

/**
 * Raw WebGL2 granule sweep drawn on a fixed canvas above the page. Granules grow cell by cell
 * along the direction of travel until they cover the screen (progress 0 to 1), then shrink in
 * the same direction to reveal the new page (1 to 2). Cheap: one full screen triangle.
 */
const VERT = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uProgress; uniform float uDir; uniform float uCell;
uniform vec3 uSoil; uniform vec3 uLoam; uniform vec3 uMoss; uniform vec3 uGold;
out vec4 o;
float hash(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
void main(){
  vec2 frag = gl_FragCoord.xy;
  vec2 id = floor(frag / uCell);
  vec2 uv = fract(frag / uCell) * 2.0 - 1.0;
  float r = hash(id);
  float xn = (id.x * uCell) / uRes.x;
  if (uDir < 0.0) xn = 1.0 - xn;
  float yn = (id.y * uCell) / uRes.y;
  float wave = sin(yn * 3.0) * 0.04;
  float a;
  if (uProgress <= 1.0) {
    float f = uProgress * 1.7 - 0.35;
    a = clamp((f - xn - r * 0.3 - wave) / 0.22, 0.0, 1.0);
  } else {
    float f = (uProgress - 1.0) * 1.7 - 0.35;
    a = 1.0 - clamp((f - xn - r * 0.3 - wave) / 0.22, 0.0, 1.0);
  }
  // Granule: an ellipse per cell, slightly rotated, grows to cover the whole cell
  float ang = r * 6.2831;
  mat2 R = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
  vec2 q = R * uv; q.x *= 1.0 + r * 0.35;
  float rad = a * 1.6;
  float d = length(q);
  float cover = 1.0 - smoothstep(rad - 0.08, rad, d);
  if (cover <= 0.001) discard;
  vec3 col = mix(uSoil, uLoam, r * 0.8);
  col = mix(col, uMoss * 0.6, step(0.93, r) * 0.6);
  // Lit edge on growing granules, a gold glint at the sweep front
  float lit = (1.0 - a) * step(0.0001, a);
  col += uGold * lit * 0.55 * step(0.82, r);
  col += vec3(0.04) * max(dot(normalize(vec3(q, 0.6)), normalize(vec3(0.6, 0.5, 0.6))), 0.0) * (1.0 - a);
  o = vec4(col, cover);
}`;

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

export class Sweep {
  private gl: WebGL2RenderingContext;
  private prog: WebGLProgram;
  private u: Record<string, WebGLUniformLocation | null> = {};
  private canvas: HTMLCanvasElement;

  static create(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2", { premultipliedAlpha: false, antialias: false, alpha: true });
    if (!gl) return null;
    try {
      return new Sweep(canvas, gl);
    } catch {
      return null;
    }
  }

  private constructor(canvas: HTMLCanvasElement, gl: WebGL2RenderingContext) {
    this.canvas = canvas;
    this.gl = gl;
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link");
    this.prog = prog;
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(prog);
    ["uRes", "uProgress", "uDir", "uCell", "uSoil", "uLoam", "uMoss", "uGold"].forEach(
      (n) => (this.u[n] = gl.getUniformLocation(prog, n)),
    );
    gl.uniform3fv(this.u.uSoil, hex(PALETTE.soil));
    gl.uniform3fv(this.u.uLoam, hex(PALETTE.loam));
    gl.uniform3fv(this.u.uMoss, hex(PALETTE.moss));
    gl.uniform3fv(this.u.uGold, hex(PALETTE.grain));
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.round(window.innerWidth * dpr);
    const h = Math.round(window.innerHeight * dpr);
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    this.gl.viewport(0, 0, w, h);
    this.gl.uniform2f(this.u.uRes, w, h);
    this.gl.uniform1f(this.u.uCell, Math.round(26 * dpr));
  }

  draw(progress: number, dir: number) {
    const gl = this.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (progress <= 0 || progress >= 2) return;
    gl.uniform1f(this.u.uProgress, progress);
    gl.uniform1f(this.u.uDir, dir);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
