---
title: "A personal site in 2 KB"
description: "How pierreguilbert.com lands at ~2 KB gzipped per page — inline CSS, no JS, no fonts, no JavaScript runtime, one round-trip."
draft: true
---

[← back to blog](..)

# A personal site in 2 KB (WIP)

*Case study — pierreguilbert.com is the site you're reading. The numbers below are real and the techniques are reproducible.*

## TL;DR

`/en/` is **2090 bytes gzipped** (~2.04 KB). `/fr/` is **2133 bytes**. Both fit inside the TCP slow-start initial congestion window (~14 KB) on the first round trip. The page has zero JavaScript at runtime, zero web fonts, zero blocking external requests, and a CO₂ footer that's computed at build time from the gzipped page size.

The build target is **3 KB primary / 14 KB secondary**. Both pages clear primary with headroom.

## The numbers

```txt
/en/  HTML.gz=2090B  CSS=inlined  WebP=0B  TOTAL=2090B (2.04 KB)  [OK]
/fr/  HTML.gz=2133B  CSS=inlined  WebP=0B  TOTAL=2133B (2.08 KB)  [OK]
Primary budget: 3072 B (3 KB) — target
Secondary budget: 14336 B (14 KB) — hard ceiling
```

Measured by `scripts/measure-budget.mjs` after each production build. The measurement is the body bytes (gzip-encoded) — headers add another ~200-400 bytes on the wire. Cloudflare upgrades the actual transfer to zstd, shaving another ~10-15%.

## What's in the 2 KB

The shape of one page, end-to-end:

1. **One HTML document** containing the layout, header (PG mark + nav + locale switcher + github/email links), the page content, and a CO₂ footer.
2. **Critical CSS inlined** inside a single `<style>` block. No external stylesheet request. Source lives in `src/assets/css/main.css` as editable, hashed, minified through the asset pipeline; injected via the plugin's `inline_asset()` helper at render time.
3. **No `<script>` tags at all.** No analytics, no framework, no hydration, no Vite client (production build only).
4. **SVG favicon** (with PNG `apple-touch-icon` for iOS). The SVG is ~250 bytes.
5. **No web fonts** — `system-ui` for body, `ui-monospace, Menlo, monospace` for the mark, code, dates, and chrome.
6. **No images on the landing page** — the social links are mono text ("github", "email") instead of icon SVGs. Cheaper per byte than the SVGs, and more accessible to screen readers without the `aria-label` dance.

## The techniques that earned their keep

### Inline the critical CSS

The plugin exposes `inline_asset(logicalPath)` that resolves a logical path through the asset manifest, reads the processed file, and returns its raw contents. In the head template:

```eta
<style><%~ inline_asset('/assets/styles/main.css') %><% if (page.key.startsWith('blog/')) { %><%~ inline_asset('/assets/styles/blog.css') %><% } %></style>
```

The CSS still lives as a normal file (you can edit it, hash it, minify it). The plugin minifies + hashes during the asset pass, and `inline_asset()` pulls in the processed bytes at render time. Result: **zero render-blocking stylesheet request.**

The blog post pages add `blog.css` on top (prose styles for the markdown body), but only for `page.key === 'blog'` or `page.key.startsWith('blog/')` — the landing page stays lean.

### No JavaScript at all

The site does not need JavaScript to function. The only "interactivity" is the locale switcher, which is just `<a href="/fr/…">`. The view-transitions API gives cross-document fade animations with literally zero JS:

```css
@view-transition { navigation: auto; }
@media (prefers-reduced-motion: no-preference) {
  ::view-transition-old(root) { animation: vt-fade-out 160ms ease both; }
  ::view-transition-new(root) { animation: vt-fade-in  260ms ease both; }
}
```

Earlier I'd added `view-transition-name: site-header` on the `<header>` to keep it stable across pages. Chrome would briefly flash white during the cross-fade because the named snapshot didn't inherit the page background. Safari was fine. Removed the explicit `view-transition-name` — the whole page now animates as one root snapshot, no flicker. Cost: nothing; the visual result is identical.

### Theme via CSS variables + media query

Dark mode is `@media (prefers-color-scheme: dark)` swapping a small set of CSS custom properties. No JS toggle, no theme detection script, no FOUC. The user's OS preference is the source of truth.

```css
:root { --fg:#1a1a1a; --bg:#fff; --accent:#0f766e; --border:#ececec; --muted:#6b7280; }
@media (prefers-color-scheme: dark) {
  :root { --fg:#e9e9e9; --bg:#0f1011; --accent:#5eead4; --border:#2a2c30; --muted:#8b8f94; }
}
```

### CO₂ badge from gzipped page size

After the build, `scripts/inject-co2.mjs` walks `dist/**/*.html`, gzips each one in memory, runs `bytes × G_PER_BYTE` against the websitecarbon.com linear-extrapolation constant, and injects a footer:

```html
<footer class="co2"><small>≈ 0.39 mg CO₂ / visit · 1.97 KB compressed body</small></footer>
```

The number is per-page and changes with the page's actual transfer cost. It's the closest thing to a public accountability mechanism for the perf budget.

## What I tried and dropped

* **A picture / avatar on the landing page.** I'd scoped a `data_uri()` approach to inline a 200×200 WebP (~3 KB) directly into the HTML so it'd arrive in the first round-trip. The numbers worked. But removing the picture entirely was even better — and the page felt cleaner. The plugin still has `data_uri()` for cases where an LCP image is mandatory; I just don't need one.
* **PDF CVs (`PierreGuilbertCV_*.pdf`) and a `pierreguilbert.vcf` vCard.** Dropped — the email link does the job, and PDFs hosted on a personal site are 2010-era. The deploy script explicitly `rm -f`s them on the server so old crawls don't stumble on stale files.
* **GitLab/Twitter/Facebook/LinkedIn icons.** Cut to `github` + `email` as mono text. Net: ~6 fewer SVGs to inline, smaller header, less to maintain.
* **Per-locale `site.webmanifest`.** Dropped via `emitWebmanifest: false` in the plugin config. The site isn't a PWA; the manifest just added a request to the critical path with nothing on the other side.

## Why the 14 KB rule still matters

TCP starts conservative. Modern stacks typically begin with an initial congestion window (IW) of roughly 10 TCP segments, standardised in RFC 6928. On Ethernet-sized paths that works out to roughly **14 KB** of payload before the sender has to stop and wait for acknowledgements.

That number matters more than most frontend discussions admit.

If the entire page fits inside the initial congestion window, the browser can receive the whole document in a **single round trip**. If it spills over the limit, the sender must wait for ACKs before transmitting more data, adding at least one additional RTT before the page can fully render.

On a low-latency fibre connection, that might mean:

* **100 ms RTT:** ~100 ms vs ~200 ms
* **300 ms RTT:** ~300 ms vs ~600 ms

But the effect becomes dramatically more visible on satellite links.

Geostationary (GEO) satellites orbit at roughly:

35{,}786\ \mathrm{km}

above the equator. A signal has to travel from Earth to orbit and back multiple times during a TCP exchange, producing a practical baseline RTT of roughly:

500\text{–}600\ \mathrm{ms}

before terrestrial routing or processing overhead is even considered.

Historically, older TCP stacks used initial windows of only 2–4 segments. On GEO links that meant painfully slow ramp-up behaviour: each additional congestion window expansion required another half-second round trip. Large pages became latency amplifiers.

RFC 6928's move to `IW=10` was partly motivated by exactly these high-latency environments. A larger initial flight lets modern TCP "front-load" more useful data before waiting for ACKs, dramatically reducing slow-start penalties on long-fat networks.

A 2 KB page therefore behaves disproportionately well on GEO satellite internet:

* it fits entirely inside the initial congestion window,
* arrives in the first flight,
* avoids additional slow-start rounds,
* and minimises the cost of the satellite RTT itself.

The difference between a 2 KB page and a 200 KB page on terrestrial broadband is mostly aesthetic. On a GEO satellite connection, it's architectural.

There are caveats, though. Satellite links tend to have higher bit-error rates than terrestrial fibre. Traditional TCP interprets packet loss as congestion, collapsing the congestion window even when the loss is radio corruption rather than queue pressure. GEO optimisation stacks therefore often combine larger initial windows with Performance Enhancing Proxies (PEPs), TCP acceleration, selective acknowledgements, and aggressive buffering tuned for high Bandwidth-Delay Product (BDP) paths.

Still, the first principle survives every protocol generation: fewer round trips win.

The 14 KB rule isn't nostalgia from the HTTP/1.1 era. It's a physics budget.

A 2 KB page has ~12 KB of headroom for headers, TLS overhead, and slow-start variability — enough that "first round trip = full page" is reliable, not aspirational.

## Sources and prior art

**The 14 KB rule's origin:**

* [RFC 6928 — Increasing TCP's Initial Window](https://datatracker.ietf.org/doc/html/rfc6928) — the IETF doc that justifies `IW=10` segments (~14.6 KB after headers). The actual primary source.
* [Why your website should be under 14kB in size (endtimes.dev)](https://endtimes.dev/why-your-website-should-be-under-14kb-in-size/) — the 2022 article that crystallised the "14 KB" framing for a generation of devs.

**The "inline critical CSS" canon:**

* Patrick Hamann, [CSS and the Critical Path (CSSConf EU 2014)](https://speakerdeck.com/patrickhamann/css-and-the-critical-path-cssconfeu-september-2014) — the original talk that put "inline critical CSS, defer the rest" into mainstream practice at The Guardian.
* Filament Group, [The Simplest Way to Load CSS Asynchronously](https://www.filamentgroup.com/lab/load-css-simpler/) + [How we make RWD sites load fast as heck](https://www.filamentgroup.com/lab/performance-rwd.html) — Scott Jehl's foundational inline-then-async pattern, explicitly targeting that first 14 KB roundtrip.
* web.dev, [Understand the critical rendering path](https://web.dev/learn/performance/understanding-the-critical-path).

**For scale context:**

* [HTTP Archive Web Almanac 2025 — Page Weight](https://almanac.httparchive.org/en/2025/page-weight) — current median page is **~2.6 MB mobile / 2.9 MB desktop**. A 2 KB page is ~1300× lighter than median.
* web.dev, [RAIL model](https://web.dev/articles/rail) + [Web Vitals](https://web.dev/articles/vitals) — the "perceived instant" thresholds a single-roundtrip page trivially clears.

**CO₂ math:**

* Website Carbon Calculator, [How does it work?](https://www.websitecarbon.com/how-does-it-work/) + [FAQ](https://www.websitecarbon.com/faq/) — Wholegrain's Sustainable Web Design Model v4 (July 2025) methodology for g CO₂e/visit. The badge math extrapolates linearly from their formula.

**Compression landscape:**

* Paul Calvano, [Choosing Between gzip, Brotli and Zstandard (2024)](https://paulcalvano.com/2024-03-19-choosing-between-gzip-brotli-and-zstandard-compression/) — HTTP Archive co-maintainer; share-of-traffic numbers for br/zstd/gzip. At 2 KB the encoding hardly matters, but Cloudflare's zstd upgrade still shaves ~10–15% off.

**Notable extreme-perf neighbours:**

* [motherfuckingwebsite.com](https://motherfuckingwebsite.com/) → [bettermotherfuckingwebsite.com](http://bettermotherfuckingwebsite.com/) → [perfectmotherfuckingwebsite.com](https://perfectmotherfuckingwebsite.com/) — the lineage progenitor; same ethos, progressively less brutalist styling.
* [1MB Club](https://1mb.club/) and [250kb Club](https://250kb.club/) — curated lists; a 2 KB page sits well inside the 10 KB tier.
* [Dan Luu (danluu.com)](https://danluu.com/) — famously fast plain-HTML blog; see his [Web bloat](https://danluu.com/web-bloat/) post.
* [Low-tech Magazine (solar.lowtechmagazine.com)](https://solar.lowtechmagazine.com/) — dithered images, runs off a solar-powered Pi; the platonic ideal of "perf as values."

**HTTP/3 footnote:**

The 14 KB number is a TCP-IW=10 artefact. QUIC's initial flight is also typically ~10 packets (~14 KB), so the rule survives the transition — see Cloudflare's [CUBIC + HyStart++ in quiche](https://blog.cloudflare.com/cubic-and-hystart-support-in-quiche/) for the modern picture.

## Try it yourself

The site's source is small enough to read: [github.com/guilbep/pierreguilbert.com](https://github.com/guilbep/pierreguilbert.com). The plugin is [vite-ssr-i18n-basic](https://github.com/guilbep/vite-ssr-i18n-basic). The build commands that produced the numbers above:

```bash
make build       # vite build + post-build CO₂ injection
make measure     # check transfer budget against 3 KB / 14 KB
make preview     # serve dist/ locally on port 3001
```

— Pierre
