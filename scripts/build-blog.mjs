#!/usr/bin/env node
// Convert src/blog/*.md into src/pages/blog/*.njk so the multi-locale
// plugin can render them like any other page. Conventions:
//
//   src/blog/index.md            → src/pages/blog.njk           (route key: "blog")
//   src/blog/<slug>.md           → src/pages/blog/<slug>.njk    (route key: "blog/<slug>")
//
// Each generated .njk extends src/layouts/main.njk and drops the rendered
// HTML inside a .prose wrapper. The plugin still handles head/header/footer
// + i18n chrome.
//
// Re-runs idempotently; safe to call before every build (see `prebuild`).

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, rmSync } from "fs";
import { join, basename } from "path";
import matter from "gray-matter";
import { marked } from "marked";

const SRC_DIR = "src/blog";
const OUT_INDEX = "src/pages/blog.njk";
const OUT_POSTS_DIR = "src/pages/blog";

if (!existsSync(SRC_DIR)) {
  console.log(`build-blog: ${SRC_DIR}/ missing — nothing to do`);
  process.exit(0);
}

// Wipe and recreate the posts directory so deletions are honored.
if (existsSync(OUT_POSTS_DIR)) {
  rmSync(OUT_POSTS_DIR, { recursive: true, force: true });
}
mkdirSync(OUT_POSTS_DIR, { recursive: true });

const mdFiles = readdirSync(SRC_DIR).filter((f) => f.endsWith(".md"));
let count = 0;

for (const file of mdFiles) {
  const raw = readFileSync(join(SRC_DIR, file), "utf8");
  const { data: frontmatter, content } = matter(raw);
  const html = marked.parse(content);

  // Wrap into a Nunjucks page that extends the main layout.
  // The HTML is rendered via Nunjucks's `safe` filter — wrap in `{% raw %}`
  // to keep marked's output verbatim (no Nunjucks tag interpretation).
  const njk = `{% extends "main.njk" %}\n\n{% block content %}\n<article class="prose">\n{% raw %}\n${html}\n{% endraw %}\n</article>\n{% endblock %}\n`;

  const slug = basename(file, ".md");
  const outPath =
    slug === "index" ? OUT_INDEX : join(OUT_POSTS_DIR, `${slug}.njk`);
  writeFileSync(outPath, njk);
  count++;
  console.log(`  ✓ ${file} → ${outPath}`);
}

// Clean up empty post dir if there were no real posts.
if (readdirSync(OUT_POSTS_DIR).length === 0) {
  rmSync(OUT_POSTS_DIR, { recursive: true, force: true });
}

console.log(`build-blog: rendered ${count} markdown file(s)`);
