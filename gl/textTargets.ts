/**
 * Samples pixel positions of text rendered in the display font to an offscreen canvas.
 * Returns points in world units centred on the origin, fitted to `worldWidth`.
 */
export function sampleTextTargets(opts: {
  lines: string[];
  worldWidth: number;
  /** Approximate number of samples wanted */
  density?: number;
}): Float32Array {
  const { lines, worldWidth } = opts;
  const family =
    getComputedStyle(document.documentElement).getPropertyValue("--ff-display").trim() || "serif";
  const fontPx = 240;
  const lineH = fontPx * 0.92;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return new Float32Array();
  ctx.font = `400 ${fontPx}px ${family}`;
  const widths = lines.map((l) => ctx.measureText(l).width);
  const w = Math.ceil(Math.max(...widths) + 40);
  const h = Math.ceil(lineH * lines.length + 60);
  canvas.width = w;
  canvas.height = h;
  ctx.font = `400 ${fontPx}px ${family}`;
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 5; // a little extra weight so the formed word reads clearly
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "center";
  lines.forEach((l, i) => {
    const y = 30 + fontPx * 0.78 + i * lineH;
    ctx.fillText(l, w / 2, y);
    ctx.strokeText(l, w / 2, y);
  });
  const data = ctx.getImageData(0, 0, w, h).data;
  const step = 2;
  const pts: number[] = [];
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      if (data[(y * w + x) * 4 + 3] > 140) pts.push(x, y);
    }
  }
  const scale = worldWidth / w;
  const out = new Float32Array((pts.length / 2) * 3);
  for (let i = 0, j = 0; i < pts.length; i += 2, j += 3) {
    out[j] = (pts[i] - w / 2) * scale;
    out[j + 1] = -(pts[i + 1] - h / 2) * scale;
    out[j + 2] = 0;
  }
  return out;
}
