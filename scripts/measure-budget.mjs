#!/usr/bin/env node
// Budgets:
//   PRIMARY   = 3072 B (3 KB)   — fits in TCP slow-start initial window
//               with room for headers; the 14 KB rule's "fully usable
//               in one round-trip including on satellite" goal.
//   SECONDARY = 14336 B (14 KB) — the classic 14 KB rule. Hard fail.
//
// Reports both; exits non-zero only when SECONDARY is breached. PRIMARY
// breach is a visible "[OVER PRIMARY]" warning so we notice drift but
// don't block deploys for a couple of hundred bytes.

import { readFileSync, statSync, existsSync } from "fs";
import { gzipSync } from "zlib";

const PRIMARY = Number(process.env.BUDGET_BYTES ?? 3072);
const SECONDARY = Number(process.env.SECONDARY_BUDGET_BYTES ?? 14336);
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

  const cssMatch = htmlStr.match(reCss);
  let cssGz = 0;
  if (cssMatch) {
    cssGz = gzipSync(readFileSync(`${DIST}/assets/styles/${cssMatch[0]}`), {
      level: 9,
    }).length;
  }

  const webpMatch = htmlStr.match(reWebp);
  const webp = webpMatch
    ? statSync(`${DIST}/assets/images/${webpMatch[0]}`).size
    : 0;

  const total = htmlGz + cssGz + webp;
  const status =
    total > SECONDARY
      ? "OVER SECONDARY"
      : total > PRIMARY
        ? "OVER PRIMARY"
        : "OK";
  if (total > SECONDARY) fail = true;
  const cssLabel = cssMatch ? `CSS.gz=${cssGz}B` : "CSS=inlined";
  console.log(
    `/${loc}/  HTML.gz=${htmlGz}B  ${cssLabel}  WebP=${webp}B  TOTAL=${total}B (${(total / 1024).toFixed(2)}KB)  [${status}]`,
  );
}
console.log(
  `Primary budget: ${PRIMARY}B (${(PRIMARY / 1024).toFixed(0)} KB) — target`,
);
console.log(
  `Secondary budget: ${SECONDARY}B (${(SECONDARY / 1024).toFixed(0)} KB) — hard ceiling`,
);
process.exit(fail ? 1 : 0);
