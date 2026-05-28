---
title: "vite-ssr-i18n-basic, shipped"
description: "A tiny Vite + Eta plugin that turns locale JSON + .eta templates into a multi-locale static site under 3 KB per page."
draft: true
---

[← back to blog](..)

# vite-ssr-i18n-basic, shipped

_Case-study draft — first-hand from the migration that produced this post itself._

## TL;DR

`vite-ssr-i18n-basic@3.0.0` is a small Vite plugin that takes Eta templates + per-locale JSON and emits one HTML file per page per locale, plus sitemaps, 404s, and webmanifests. The site you're reading is built with it, ships at ~2 KB gzipped per page, and uses zero JavaScript at runtime.

→ [npm](https://www.npmjs.com/package/vite-ssr-i18n-basic) · [GitHub](https://github.com/guilbep/vite-ssr-i18n-basic)

## What it does

```js
import { defineConfig } from "vite";
import { createMultiLocalePlugin } from "vite-ssr-i18n-basic";

export default defineConfig({
  plugins: [
    createMultiLocalePlugin({
      locales: ["en", "fr"],
      defaultLocale: "en",
      siteUrl: "https://pierreguilbert.com",
    }),
  ],
});
```

That's it. Drop `.eta` templates in `src/pages/`, `src/layouts/`, `src/partials/`. Drop translations in `src/data/<locale>.json`. Run `vite build`. Get `dist/en/`, `dist/fr/`, plus `sitemap-en.xml`, `sitemap-fr.xml`, `sitemap-index.xml`, `<locale>/404.html`, `<locale>/site.webmanifest`, and a root `index.html` that detects browser language.

The plugin exposes a few template helpers worth knowing about — `t(key, params?)` for translation, `inline_asset(logicalPath)` for inlining critical CSS into the document, `data_uri(path)` for the same trick with small images, `getLocalizedUrl()` / `getRouteUrl()` / `isCurrentLocale()` for hreflang + nav.

The whole renderer is ~300 lines plus a thin asset processor.

## Why 3.0.0 — the rename + the engine swap

The 2.x line was called `vite-ssr-nunjucks-i18n-basic`. The name baked the templating engine into the package identifier, which was fine until it stopped being true.

The trigger: Nunjucks's last release was **April 2023**. Three years of silence on the upstream. I'd been getting away with it because Nunjucks works — but every "is this still maintained?" check I had to do in a code review was telling me the answer was going to be no eventually.

I considered Squirrelly first. The data didn't support it: its last release was July 2024, ~2 years stale. Squirrelly's own author had moved on to **Eta** (latest release April 2026). The migration target was obvious; the cost was that Eta's syntax is EJS-like (`<% %>`), not Jinja-like (`{% %}`).

Mechanical conversion of nine `.njk` files (4 site + 5 plugin-internal):

```
{% extends "main.njk" %}        →  <% layout('/layouts/main') %>
{% block content %}…{% endblock %} →  body content (layout uses <%~ body %>)
{% include "head.njk" %}        →  <%~ include('/partials/head') %>
{% if x %} … {% endif %}        →  <% if (x) { %> … <% } %>
{% for x in xs %}               →  <% for (const x of xs) { %>
{{ var }}                        →  <%= var %>     (escaped)
{{ var | safe }}                 →  <%~ var %>     (raw)
{{ list | dump | safe }}         →  <%~ JSON.stringify(list) %>
```

With `useWith: true` in the Eta config, render-context fields are exposed as bare identifiers — `<%= foo %>` instead of `<%= it.foo %>`. Same ergonomics as Nunjucks.

After conversion, the site's per-locale gzipped transfer was **byte-identical** to the Nunjucks build: 2090 bytes for `/en/`, 2133 bytes for `/fr/`. That's the cleanest possible signal that the migration didn't sneak in any change other than syntax — same minifier output for the same rendered HTML.

While I had the lid open: dropped `nunjucks` (and its 4 transitive deps), added `eta@^4.6.0`. **Zero new vulnerabilities** — the 5 audit findings on the plugin repo are all in `@lhci/cli` dev tooling, unchanged.

## Where it fits

The niche: **marketing pages, docs landings, personal sites where every KB matters and the locale set is small and static.**

Adjacent options in 2026 and where they land:

| Tool | Per-page baseline | i18n story | Cost |
|---|---|---|---|
| **vite-ssr-i18n-basic** | ~2 KB | Convention: `pages/foo.eta` + `data/<locale>.json` → `/<locale>/foo.html` | Zero framework tax |
| [Astro + @astrojs/i18n](https://docs.astro.build/en/guides/internationalization/) | 10–50 KB (HTML + hydration runtime if islands) | Strong: routing, fallbacks, `getLocaleByPath` | Full framework, content collections, config |
| [Eleventy (11ty)](https://www.11ty.dev/) | Pure HTML, can be sub-3 KB | DIY via `@11ty/eleventy-plugin-i18n` or pagination over locale data | Own config, own dev server, separate from Vite |
| [Hugo multilingual](https://gohugo.io/content-management/multilingual/) | Tiny HTML, no JS | Excellent: per-locale content trees, translations | Go binary, opinionated layout, outside JS/Vite |
| [Next.js i18n routing](https://nextjs.org/docs/app/building-your-application/routing/internationalization) | 80–200 KB (React + framework) | Routing primitives only; messages via next-intl/react-intl | Full framework |
| [@intlify/unplugin-vue-i18n](https://github.com/intlify/bundle-tools) | ~10–20 KB i18n runtime to the client | Runtime translation, not pre-rendered per locale | Different shape entirely — SPA/SSR, not SSG |

**Astro and Next ship framework runtime even on "static" pages; this plugin ships zero JS by design.** Hugo matches on size but forces a non-JS toolchain. Eleventy is the closest spiritual neighbour but isn't Vite-native — no shared dev server, no HMR, no shared asset pipeline.

The gap filled: a **Vite-first, JSON-in / HTML-out, per-locale emitter with no framework tax**.

## What's not in the box

- **No LSP, no editor support shipped with the plugin.** I built a [separate Zed extension (`zed-eta`)](https://github.com/guilbep/zed-eta) for syntax highlighting + JS injection inside `<% %>` blocks. VSCode users have [`shadowtime2000/eta-vscode`](https://github.com/shadowtime2000/eta-vscode); EJS extensions also handle `.eta` if you alias the file type.
- **No CMS, no markdown helpers in the core.** The blog you're reading uses a small `scripts/build-blog.mjs` that walks `src/blog/*.md`, runs them through `marked` + `gray-matter`, and writes `.eta` wrappers into `src/pages/blog/`. ~50 lines. The plugin treats them like any other page.
- **No content-collection schema, no draft preview, no JS hydration.** This is a static-HTML plugin. If you want any of those, Astro is the right tool.

## What it cost to build

The plugin was extracted from a private project (an EPFL static site I help maintain), generalised, and published. The 3.0.0 release flow:

- Trusted publisher set up on npm against `guilbep_martinier`
- GitHub Actions workflow on tag push (`v*.*.*`) runs `npm publish --provenance --access public`
- No `NPM_TOKEN` secret; OIDC exchange handles auth
- Old `vite-ssr-nunjucks-i18n-basic@2.4.0` deprecated with `npm deprecate "Renamed: install vite-ssr-i18n-basic instead"`

## Try it

```bash
npm install vite-ssr-i18n-basic
```

The [README](https://github.com/guilbep/vite-ssr-i18n-basic#readme) has a quick-start with a full `vite.config.js`, the required directory layout, and the Eta template cheatsheet. If you've used 2.x, the [CHANGELOG entry for 3.0.0](https://github.com/guilbep/vite-ssr-i18n-basic/blob/main/CHANGELOG.md) is the migration guide.

— Pierre
