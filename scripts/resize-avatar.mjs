import sharp from "sharp";
import { readFileSync, renameSync, statSync } from "fs";

// Avatar source file. The current src/assets/images/avatar.jpg has already been
// resized in place — restart from a higher-resolution source if you want bigger.
const SRC = "src/assets/images/avatar.jpg";
const DIM = 200; // CSS-displayed size is 140px → 1.43× DPR cover on 2× screens
const JPG_QUALITY = 80; // fallback for non-WebP browsers
const WEBP_QUALITY = 72;

const buf = readFileSync(SRC);

const tmpJpg = "src/assets/images/avatar-resized.jpg";
const outWebp = "src/assets/images/avatar.webp";

await sharp(buf)
  .resize(DIM, DIM)
  .jpeg({ quality: JPG_QUALITY, progressive: true, mozjpeg: true })
  .toFile(tmpJpg);

await sharp(buf)
  .resize(DIM, DIM)
  .webp({ quality: WEBP_QUALITY, effort: 6 })
  .toFile(outWebp);

renameSync(tmpJpg, SRC);

console.log(`jpg  ${DIM}x${DIM} q=${JPG_QUALITY}: ${statSync(SRC).size} B`);
console.log(
  `webp ${DIM}x${DIM} q=${WEBP_QUALITY}: ${statSync(outWebp).size} B`,
);
