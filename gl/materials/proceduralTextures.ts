import { CanvasTexture, RepeatWrapping, SRGBColorSpace, NoColorSpace } from "three";
import { PALETTE } from "@/lib/palette";

/** Small tiling noise texture for bump and roughness detail on granules and pellets. */
export function makeGrainBump(size = 128, porous = false) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    let v = 128 + (Math.random() - 0.5) * (porous ? 120 : 40);
    if (porous && Math.random() < 0.04) v = 20; // pores
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  // Soften so it reads as surface, not static
  ctx.filter = "blur(0.6px)";
  ctx.drawImage(c, 0, 0);
  const t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  t.colorSpace = NoColorSpace;
  return t;
}

/** Printed label for the procedural bag. Wordmark, product, weight. Not a copy of any real pack. */
export function makeBagLabel(opts: { product: string; line: string; weight: string; warm: boolean }) {
  const w = 1024;
  const h = 1400;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  const css = getComputedStyle(document.documentElement);
  const display = css.getPropertyValue("--ff-display").trim() || "serif";
  const mono = css.getPropertyValue("--ff-mono").trim() || "monospace";

  // Woven bag base
  ctx.fillStyle = opts.warm ? "#d9cfb6" : PALETTE.bone;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = PALETTE.soil;
  for (let y = 0; y < h; y += 6) ctx.fillRect(0, y, w, 2);
  for (let x = 0; x < w; x += 6) ctx.fillRect(x, 0, 2, h);
  ctx.globalAlpha = 1;

  // Band
  ctx.fillStyle = opts.warm ? PALETTE.clay : PALETTE.moss;
  ctx.fillRect(0, 880, w, 220);

  // Seed mark
  ctx.strokeStyle = PALETTE.soil;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(w / 2, 250, 46, 78, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(w / 2, 172);
  ctx.lineTo(w / 2, 328);
  ctx.stroke();

  ctx.fillStyle = PALETTE.soil;
  ctx.textAlign = "center";
  ctx.font = `400 150px ${display}`;
  ctx.fillText("JAYSN AGRO", w / 2, 480);
  ctx.font = `500 30px ${mono}`;
  ctx.fillText("JAYSN AGRO INDIA PRIVATE LIMITED", w / 2, 540);
  ctx.font = `italic 400 120px ${display}`;
  ctx.fillText(opts.product, w / 2, 730);
  ctx.font = `500 40px ${mono}`;
  ctx.fillText(opts.line, w / 2, 800);
  ctx.fillStyle = PALETTE.bone;
  ctx.font = `400 130px ${display}`;
  ctx.fillText(opts.weight, w / 2, 1035);
  ctx.fillStyle = PALETTE.soil;
  ctx.font = `500 26px ${mono}`;
  ctx.fillText("MADE IN MAHARASHTRA, INDIA", w / 2, 1220);
  ctx.fillText("BATCH ________   NET WT AS MARKED", w / 2, 1270);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
