import sharp from "sharp";
import { readFileSync } from "fs";

const buf = readFileSync("src/assets/images/avatar.jpg");
const sizes = [240, 220, 200, 180, 160];
const qualities = [72, 68, 65, 60];

console.log("WebP sizes (bytes) — rows: dimension, cols: quality");
console.log("dim/q   " + qualities.map((q) => String(q).padStart(6)).join(""));
for (const dim of sizes) {
  const row = [`${dim}x${dim}`.padEnd(8)];
  for (const q of qualities) {
    const out = await sharp(buf)
      .resize(dim, dim)
      .webp({ quality: q, effort: 6 })
      .toBuffer();
    row.push(String(out.length).padStart(6));
  }
  console.log(row.join(""));
}
