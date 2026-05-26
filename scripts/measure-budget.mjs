#!/usr/bin/env node
import { readFileSync, statSync, existsSync } from "fs";
import { gzipSync } from "zlib";

const BUDGET = Number(process.env.BUDGET_BYTES ?? 15360);
const DIST = "dist";

if (!existsSync(DIST)) {
  console.error(`${DIST}/ missing — run 'make build' first`);
  process.exit(1);
}

const reCss = /main\.[a-f0-9]+\.css/;
const reWebp = /avatar\.[a-f0-9]+\.webp/;

let fail = false;
for (const loc of ["en", "fr"]) {
  const htmlPath = `${DIST}/${loc}/index.html`;
  const html = readFileSync(htmlPath);
  const htmlStr = html.toString();
  const htmlGz = gzipSync(html, { level: 9 }).length;

  // CSS: may be inlined in <style> (counted in HTML.gz) or external (separate request).
  const cssMatch = htmlStr.match(reCss);
  let cssGz = 0;
  if (cssMatch) {
    const css = readFileSync(`${DIST}/assets/styles/${cssMatch[0]}`);
    cssGz = gzipSync(css, { level: 9 }).length;
  }

  // Avatar: in the markup; counted in initial transfer even if loading="lazy".
  const webpMatch = htmlStr.match(reWebp);
  const webp = webpMatch
    ? statSync(`${DIST}/assets/images/${webpMatch[0]}`).size
    : 0;

  const total = htmlGz + cssGz + webp;
  const ok = total <= BUDGET;
  if (!ok) fail = true;
  const cssLabel = cssMatch ? `CSS.gz=${cssGz}B` : "CSS=inlined";
  console.log(
    `/${loc}/  HTML.gz=${htmlGz}B  ${cssLabel}  WebP=${webp}B  TOTAL=${total}B (${(total / 1024).toFixed(2)}KB)  [${ok ? "OK" : "OVER"}]`,
  );
}
console.log(`Budget: ${BUDGET}B (${(BUDGET / 1024).toFixed(0)} KB)`);
process.exit(fail ? 1 : 0);
