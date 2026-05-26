#!/usr/bin/env node
// Rasterise src/assets/images/mark.svg into the icon set we actually ship.
// Because the source is a flat SVG mark (not a photograph), each output is
// 1–3 KB instead of 30–60 KB.
//
// Outputs:
//   public/favicon.svg                            (already copied from src)
//   public/favicon.ico                            16x16, single-resolution
//   public/assets/images/favicon/favicon-16x16.png
//   public/assets/images/favicon/favicon-32x32.png
//   public/assets/images/favicon/apple-touch-icon.png   180x180
//   public/assets/images/favicon/android-chrome-192x192.png
//   public/assets/images/favicon/android-chrome-384x384.png  (PWA, for Lighthouse)

import { copyFileSync, mkdirSync, readFileSync, writeFileSync, statSync } from "fs";
import { join } from "path";
import sharp from "sharp";
import toIco from "to-ico";

const SRC = "src/assets/images/mark.svg";
const FAVICON_DIR = "public/assets/images/favicon";

mkdirSync(FAVICON_DIR, { recursive: true });

// 1. Make sure /favicon.svg in public matches the source.
copyFileSync(SRC, "public/favicon.svg");

const svgBuf = readFileSync(SRC);

async function rasterise(size, outPath) {
  await sharp(svgBuf, { density: 384 })   // render SVG at high DPI then downscale
    .resize(size, size, { fit: "contain" })
    .png({ compressionLevel: 9, palette: true })
    .toFile(outPath);
}

await rasterise(16, join(FAVICON_DIR, "favicon-16x16.png"));
await rasterise(32, join(FAVICON_DIR, "favicon-32x32.png"));
await rasterise(180, join(FAVICON_DIR, "apple-touch-icon.png"));
await rasterise(192, join(FAVICON_DIR, "android-chrome-192x192.png"));
await rasterise(384, join(FAVICON_DIR, "android-chrome-384x384.png"));

// 2. Build /favicon.ico from a single 16x16 PNG.
const ico16 = await sharp(svgBuf, { density: 384 })
  .resize(16, 16)
  .png({ compressionLevel: 9 })
  .toBuffer();
const icoBuf = await toIco([ico16]);
writeFileSync("public/favicon.ico", icoBuf);

// 3. Report.
const files = [
  "public/favicon.svg",
  "public/favicon.ico",
  join(FAVICON_DIR, "favicon-16x16.png"),
  join(FAVICON_DIR, "favicon-32x32.png"),
  join(FAVICON_DIR, "apple-touch-icon.png"),
  join(FAVICON_DIR, "android-chrome-192x192.png"),
  join(FAVICON_DIR, "android-chrome-384x384.png"),
];
let total = 0;
for (const f of files) {
  const size = statSync(f).size;
  total += size;
  console.log(`  ${size.toString().padStart(6)} B  ${f}`);
}
console.log(`  ${"".padStart(6)}    ────────`);
console.log(`  ${total.toString().padStart(6)} B  total`);
