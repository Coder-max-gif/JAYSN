/**
 * Asset pipeline. Reads client originals from /public/raw (never modified) and writes web
 * versions to /public/media, keeping the folder structure.
 *
 *   Images (jpg, png, tif, webp, heic*): AVIF and WebP at 640, 1280, 1920 and 2560 wide
 *   Models (glb, gltf): gltf-transform optimize with Draco geometry and KTX2 textures
 *   Video (mp4, mov, m4v, webm): prints ffmpeg commands (H.264 mp4 and VP9 webm, muted loop,
 *   1080p and 720p, plus a poster frame). ffmpeg is not assumed to be installed.
 *
 *   npm run assets
 */
import { readdirSync, statSync, mkdirSync, existsSync } from "node:fs";
import { join, relative, dirname, extname, basename } from "node:path";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const RAW = "public/raw";
const OUT = "public/media";
const WIDTHS = [640, 1280, 1920, 2560];

if (!existsSync(RAW)) {
  console.log(`Nothing to do: ${RAW} does not exist. See docs/assets.md for the folder layout.`);
  process.exit(0);
}

const files = [];
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (!f.startsWith(".")) files.push(p);
  }
};
walk(RAW);

const videoCmds = [];
let images = 0;
let models = 0;

for (const file of files) {
  const rel = relative(RAW, file);
  const ext = extname(file).toLowerCase();
  const name = basename(file, ext).toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const outDir = join(OUT, dirname(rel));
  mkdirSync(outDir, { recursive: true });

  if ([".jpg", ".jpeg", ".png", ".tif", ".tiff", ".webp", ".heic", ".heif"].includes(ext)) {
    const img = sharp(file, { failOn: "none" }).rotate();
    const meta = await img.metadata();
    for (const w of WIDTHS) {
      if (meta.width && w > meta.width * 1.05 && w !== WIDTHS[0]) continue;
      const base = join(outDir, `${name}-${w}`);
      await img.clone().resize({ width: w, withoutEnlargement: true }).avif({ quality: 52, effort: 6 }).toFile(`${base}.avif`);
      await img.clone().resize({ width: w, withoutEnlargement: true }).webp({ quality: 74 }).toFile(`${base}.webp`);
    }
    // Tiny blurred placeholder for loading states
    await img.clone().resize({ width: 24 }).blur(1).webp({ quality: 40 }).toFile(join(outDir, `${name}-lqip.webp`));
    console.log(`image  ${rel}  (${meta.width}x${meta.height})`);
    images++;
  } else if ([".glb", ".gltf"].includes(ext)) {
    const out = join(outDir, `${name}.glb`);
    try {
      execFileSync(
        process.platform === "win32" ? "npx.cmd" : "npx",
        ["gltf-transform", "optimize", file, out, "--compress", "draco", "--texture-compress", "ktx2"],
        { stdio: "inherit", shell: process.platform === "win32" },
      );
    } catch {
      console.log(`model  ${rel}  KTX2 needs the KTX-Software toolkit. Retrying with WebP textures.`);
      execFileSync(
        process.platform === "win32" ? "npx.cmd" : "npx",
        ["gltf-transform", "optimize", file, out, "--compress", "draco", "--texture-compress", "webp"],
        { stdio: "inherit", shell: process.platform === "win32" },
      );
    }
    console.log(`model  ${rel}`);
    models++;
  } else if ([".mp4", ".mov", ".m4v", ".webm", ".mkv"].includes(ext)) {
    const o = join(outDir, name).replace(/\\/g, "/");
    const i = file.replace(/\\/g, "/");
    for (const [h, crf, vp9crf] of [
      [1080, 23, 33],
      [720, 25, 36],
    ]) {
      videoCmds.push(
        `ffmpeg -y -i "${i}" -an -vf "scale=-2:${h},fps=30" -c:v libx264 -profile:v high -pix_fmt yuv420p -crf ${crf} -preset slow -movflags +faststart "${o}-${h}.mp4"`,
        `ffmpeg -y -i "${i}" -an -vf "scale=-2:${h},fps=30" -c:v libvpx-vp9 -b:v 0 -crf ${vp9crf} -row-mt 1 "${o}-${h}.webm"`,
      );
    }
    videoCmds.push(`ffmpeg -y -ss 1 -i "${i}" -frames:v 1 -vf "scale=1600:-2" -q:v 3 "${o}-poster.jpg"`);
  }
}

console.log(`\n${images} images and ${models} models written to ${OUT}.`);
if (videoCmds.length) {
  console.log(`\nVideos: run these ffmpeg commands (muted, looping, 1080p and 720p, plus a poster):\n`);
  videoCmds.forEach((c) => console.log(c));
}
