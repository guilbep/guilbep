#!/usr/bin/env node
// Convert src/blog/*.md into src/pages/blog*.njk so the multi-locale plugin
// can render them like any other page.
//
// Conventions:
//   src/blog/index.md       → src/pages/blog.njk            (key "blog")
//   src/blog/<slug>.md      → src/pages/blog/<slug>.njk     (key "blog/<slug>")
//
// Post frontmatter:
//   ---
//   title: "Post title"
//   date: 2026-05-26          # ISO date
//   description: "One-liner."  # optional
//   draft: true                # optional; if true, the post page is still
//                              # rendered (so a direct link works) but the
//                              # post is excluded from the index list.
//   ---
//
// The index page can contain a `<!-- posts -->` marker — the script replaces
// it with an HTML list of published posts (sorted newest first). If no marker
// is present and there's at least one published post, the list is inserted
// right after the first <h1>. With zero published posts, no list is rendered.

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

if (existsSync(OUT_POSTS_DIR)) rmSync(OUT_POSTS_DIR, { recursive: true, force: true });
mkdirSync(OUT_POSTS_DIR, { recursive: true });

const mdFiles = readdirSync(SRC_DIR).filter((f) => f.endsWith(".md"));

const posts = [];       // collected metadata for the index list
let indexEntry = null;  // { content, frontmatter } for index.md

for (const file of mdFiles) {
  const raw = readFileSync(join(SRC_DIR, file), "utf8");
  const { data: frontmatter, content } = matter(raw);
  const slug = basename(file, ".md");

  if (slug === "index") {
    indexEntry = { content, frontmatter };
    continue;
  }

  // Render the post page.
  const html = marked.parse(content);
  const njk = renderPagePartial(html);
  writeFileSync(join(OUT_POSTS_DIR, `${slug}.njk`), njk);
  console.log(`  ✓ ${file} → src/pages/blog/${slug}.njk`);

  if (!frontmatter.draft) {
    posts.push({
      slug,
      title: frontmatter.title ?? slug,
      date: frontmatter.date ? new Date(frontmatter.date) : null,
      description: frontmatter.description ?? "",
    });
  }
}

// Sort posts: dated newest-first, undated last.
posts.sort((a, b) => {
  if (a.date && b.date) return b.date.getTime() - a.date.getTime();
  if (a.date) return -1;
  if (b.date) return 1;
  return a.slug.localeCompare(b.slug);
});

// Build the index page.
if (indexEntry) {
  const listHtml = posts.length ? renderPostList(posts) : "";
  let indexHtml = marked.parse(indexEntry.content);

  // Marker replacement (preferred) vs auto-insert after first <h1>.
  if (indexHtml.includes("<!-- posts -->")) {
    indexHtml = indexHtml.replace("<!-- posts -->", listHtml);
  } else if (listHtml) {
    indexHtml = indexHtml.replace(/(<\/h1>)/, `$1\n${listHtml}`);
  }

  writeFileSync(OUT_INDEX, renderPagePartial(indexHtml));
  console.log(`  ✓ index.md → ${OUT_INDEX}  (${posts.length} published post${posts.length === 1 ? "" : "s"})`);
}

// Clean empty posts dir.
if (existsSync(OUT_POSTS_DIR) && readdirSync(OUT_POSTS_DIR).length === 0) {
  rmSync(OUT_POSTS_DIR, { recursive: true, force: true });
}

// ---------------------------------------------------------------------------

function renderPagePartial(bodyHtml) {
  return `{% extends "main.njk" %}\n\n{% block content %}\n<article class="prose">\n{% raw %}\n${bodyHtml}\n{% endraw %}\n</article>\n{% endblock %}\n`;
}

function renderPostList(items) {
  const fmtDate = (d) => {
    if (!d) return "";
    return d.toISOString().slice(0, 10); // YYYY-MM-DD, locale-neutral
  };
  const rows = items.map((p) => {
    const desc = p.description
      ? `<p class="post-desc">${escapeHtml(p.description)}</p>`
      : "";
    const date = p.date
      ? `<time class="post-date" datetime="${fmtDate(p.date)}">${fmtDate(p.date)}</time>`
      : "";
    return `  <li>\n    <a class="post-link" href="${p.slug}"><span class="post-title">${escapeHtml(p.title)}</span>${date}</a>\n    ${desc}\n  </li>`;
  });
  return `<ol class="post-list">\n${rows.join("\n")}\n</ol>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
