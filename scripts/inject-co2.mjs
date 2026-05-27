#!/usr/bin/env node
// Post-build: inject a per-page CO2-per-visit footer based on the page's
// gzipped size. Formula extrapolated linearly from the websitecarbon.com
// report for this site (5.76 KB → 0.001144 g CO2), which boils down to
// ~1.94e-7 g per byte on Cloudflare (sustainable-energy hosting).
//
// Approximation note: the displayed byte count is the pre-injection size,
// so the actual transferred page is ~50 B larger than reported. Good enough
// for a feel-good badge; precise to ~2 %.

import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { gzipSync } from "zlib";

const DIST = "dist";
const G_PER_BYTE = 0.001144116732462 / (5.76 * 1024); // ≈ 1.94e-7

function* htmlFiles(dir) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, f.name);
    if (f.isDirectory()) yield* htmlFiles(p);
    else if (f.name.endsWith(".html")) yield p;
  }
}

let total = 0;
for (const file of htmlFiles(DIST)) {
  let html = readFileSync(file, "utf8");
  if (html.includes('class="co2"')) continue; // idempotent
  if (!html.includes("</body>")) continue; // skip non-page output

  const bytes = gzipSync(html, { level: 9 }).length;
  const kb = (bytes / 1024).toFixed(2);
  const mg = (bytes * G_PER_BYTE * 1000).toFixed(2);

  const footer = `<footer class="co2"><small>≈ ${mg} mg CO₂ / visit · ${kb} KB compressed body</small></footer>`;
  html = html.replace("</body>", `${footer}</body>`);
  writeFileSync(file, html);
  total++;
  console.log(`  ✓ ${file.padEnd(45)}  ${kb} KB → ${mg} mg`);
}

console.log(`inject-co2: ${total} page(s) tagged`);
