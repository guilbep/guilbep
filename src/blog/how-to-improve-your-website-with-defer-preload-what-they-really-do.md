---
title: "How to improve your website with defer / preload — what they really do"
description: "Resource hints are budget allocations, not speedups — preload borrows bandwidth from something else."
draft: true
---

[← back to blog](..)

# How to improve your website with defer / preload — what they really do

_Stub seeded with research — angle, sources, and concept skeleton are ready; prose still needs writing._

## TL;DR

Resource hints are budget allocations, not speedups — `preload` borrows bandwidth from something else, `preconnect` borrows a socket; use them only when the preload scanner can't see the resource and you've measured the late discovery.

## Why it matters

_(Draft prompt: every "speed up your site" article tells you to preload, defer, prefetch — without saying what each actually triggers. The result is sites that preload three things and slow LCP by 400 ms via priority inversion. This post replaces vibes with semantics.)_

## The core idea — concepts the post must cover

- What each hint physically triggers: DNS lookup, TCP+TLS handshake, byte fetch, parse, compile, execute — and which stage each hint stops at.
- `defer` vs `async` vs `type=module` execution ordering, and the fact that inline scripts can't defer.
- **Preload scanner**: what the browser already discovers for free, so preload doesn't add value.
- The `as` attribute is mandatory; wrong `as` value causes double-fetch; `crossorigin` is required for fonts.
- `modulepreload` vs `preload as=script` — module-graph resolution.
- **Fetch Priority API**: reorders queue, doesn't increase bandwidth; default priorities per resource type.
- Preconnect socket cost (~10 s idle hold) and the 2–4 origin practical limit.
- `prefetch` is for NEXT navigation, lowest priority, idle-time only.
- **103 Early Hints**: server-driven preload during TTFB.
- Measurement: Lighthouse "Preload key requests" / "Preconnect to required origins" audits, DevTools Network priority column, Coverage panel, RUM via `PerformanceResourceTiming` and LCP attribution.

## The angle worth leaning into

Lead with **"preload as a curse"**: show a real waterfall where preloading three things demotes the LCP image from High to Medium priority and slows LCP by 400 ms.

Then pivot to the modern alternative stack:

- `fetchpriority="high"` on the LCP `<img>` (no preload needed).
- `modulepreload` for ESM graphs.
- 103 Early Hints for server-known critical assets.

The argument: classic `<link rel=preload>` is becoming a **legacy escape hatch** for the three cases the preload scanner genuinely can't reach — CSS-discovered fonts, JS-injected requests, and late-discovered hero images outside the initial HTML.

## Gotchas — misconceptions to call out

- **"Preload makes things faster."** Only if the resource is high-value AND discovered late. Otherwise it competes with truly critical bytes (priority inversion).
- **"`dns-prefetch` and `preconnect` are interchangeable."** Preconnect is a superset but expensive; dns-prefetch is a cheap fallback for origins you're less sure about.
- **"`defer` = `async`, just newer."** Defer preserves order and waits for parse; async fires whenever, breaking dependent scripts.
- **"Preloading a font without `crossorigin` is fine."** It double-fetches because font requests are always CORS.
- **"Prefetch speeds up the current page."** It doesn't; it's a bet on the next navigation and runs at idle priority.

## References

**Primary (web.dev — Osmani / Djirdeh / Wagner / Meenan):**

- [Preload critical assets](https://web.dev/articles/preload-critical-assets) — canonical preload explainer; `as` attribute mandate, double-fetch trap.
- [Preconnect and dns-prefetch](https://web.dev/articles/preconnect-and-dns-prefetch) — preconnect = DNS+TCP+TLS; dns-prefetch = DNS only; preconnect holds sockets ~10s.
- [Fetch Priority API](https://web.dev/articles/fetch-priority) — `fetchpriority="high|low|auto"`; priority hints reorder queue, don't grant bandwidth.
- [How the browser preload scanner can speed up loading](https://web.dev/articles/preload-scanner) — what's discovered for free vs what preload actually buys.
- [stale-while-revalidate](https://web.dev/articles/stale-while-revalidate) — adjacent technique often confused with prefetch.

**Primary (Jake Archibald):**

- Jake Archibald, [Deep dive into the murky waters of script loading](https://www.html5rocks.com/en/tutorials/speed/script-loading/) — definitive `async` vs `defer` vs `type=module` ordering reference.

**Primary (specs + MDN):**

- MDN, [`rel=preload`](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload) and [`rel=modulepreload`](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/modulepreload) — modulepreload fetches AND parses AND resolves the module graph.
- Chrome Developers, [Early Hints (HTTP 103)](https://developer.chrome.com/docs/web-platform/early-hints) — server-driven preload during TTFB.
- WICG, [Priority Hints explainer](https://github.com/WICG/priority-hints) — default browser priorities per resource type.
- Chrome Developers, [Speculative loading rules](https://developer.chrome.com/docs/web-platform/prerender-pages) — modern replacement for `rel=prerender`.

**Primary (practitioners):**

- Andy Davies, [Are you using `<link rel="preload">` properly?](https://andydavies.me/blog/2019/02/12/preloading-fonts-and-the-puzzle-of-priorities/) — clearest writeup of the font-preload double-fetch trap.
- Harry Roberts, [The three Cs: Concatenate, Compress, Cache](https://csswizardry.com/2020/05/the-three-c-concatenate-compress-cache/) — practical priority tables; demonstrates net-negative preload of already-discoverable resources.

— Pierre
