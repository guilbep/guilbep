---
title: "iframe post/publish logic to set scrollHeight properly"
description: "Treating iframe height as a subscription, not a value — and the security trap of taking anyone's word for it."
draft: true
---

[← back to blog](..)

# iframe post/publish logic to set scrollHeight properly

_Stub seeded with research — angle, sources, and concept skeleton are ready; prose still needs writing._

## TL;DR

Iframes can't auto-size cross-origin, so use a `ResizeObserver` inside the iframe to `postMessage` height updates to the parent, with strict origin checks and rAF coalescing — and re-measure after `document.fonts.ready` and image decode to survive the late-layout traps.

## Why it matters

_(Draft prompt: every embed widget hits this — the iframe loads, looks right, then a webfont swaps in and the parent page has an empty 80 px gutter or a cut-off CTA. The fix is philosophical, not technical: treat height as a stream, not an event.)_

## The core idea — concepts the post must cover

- Why iframes are isolated browsing contexts and the same-origin policy blocks DOM reads across origins.
- `iframe` has no intrinsic content-driven height; HTML/CSS sizing collapses to attribute/CSS, not `scrollHeight`.
- The producer/consumer split: child posts measurements, parent applies them to the iframe element.
- Choosing the right measurement: `document.documentElement.scrollHeight` vs `document.body.scrollHeight` vs `getBoundingClientRect().height` of a tagged root — and when each lies (margin collapse, absolute children, transforms).
- `ResizeObserver` on `document.documentElement` (or a known wrapper) is the modern primitive; fall back to MutationObserver + window resize only for legacy.
- Debounce/coalesce via `requestAnimationFrame` to avoid `ResizeObserver` loop errors and message floods.
- Handshake protocol: child announces "ready", parent acks with its origin, then steady-state height messages flow.
- `postMessage` security: never `'*'` in production; verify `event.origin` AND `event.source`; namespace messages (`{ type: 'embed:height', value: N }`).
- Race conditions: `load` fires before web fonts, lazy images, and async-rendered components settle.
- Image/font readiness: `img.decode()`, `document.fonts.ready`, and re-measure after each.
- Sandboxing: `sandbox="allow-scripts"` (without `allow-same-origin`) still permits postMessage — design for the most-restricted case.
- Setting `iframe.scrolling="no"` and CSS `border:0; width:100%` so only height is dynamic.
- Server-side hint: ship an initial `style="height:Xpx"` from the embed snippet to reduce CLS before JS boots.

## The angle worth leaning into

**First paint lies.** Most naive implementations measure once at `load` and ship a height that's correct for system fonts — then the webfont swaps in (or a lazy hero image decodes) and every paragraph reflows by a few pixels. Invisible on desktop, catastrophic on a 320 px mobile column. **Treat height as a subscription, not a value.**

Pair this with the security angle: accepting `postMessage` from an iframe without origin verification is one of the most common ways embed widgets get turned into clickjacking / spoofing vectors. Attackers can iframe your embed and replay arbitrary heights to manipulate parent-page layout. Same primitive, both problems.

## Gotchas — misconceptions to call out

- **"I can just read `iframe.contentWindow.document.body.scrollHeight` from the parent."** Only works same-origin; silently throws cross-origin.
- **"The `load` event means the content is its final size."** Fonts, images, and async render passes happen after `load`.
- **"`targetOrigin: '*'` is fine, it's just a height number."** A malicious iframe can spoof messages; always validate origin and `source` to avoid UI redress.
- **"MutationObserver is enough to detect size changes."** It catches DOM mutations but not CSS/layout-driven resizes (viewport changes, container queries, font swaps).
- **"One measurement at DOMContentLoaded is enough."** Height is a stream, not an event.

## References

**Primary (specs + MDN):**

- MDN, [`Window.postMessage()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) — `targetOrigin`, message event structure, `event.origin`/`event.source` verification pattern.
- MDN, [`ResizeObserver`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) — API reference, `contentRect` vs `borderBoxSize`, the "ResizeObserver loop" warning.
- HTML Living Standard, [The iframe element](https://html.spec.whatwg.org/multipage/iframe-embed-object.html#the-iframe-element) — spec rationale for iframe isolation.
- HTML Standard, [Cross-document messaging](https://html.spec.whatwg.org/multipage/web-messaging.html) — normative source for postMessage semantics, structured cloning, origin checks.
- W3C, [Resize Observer](https://www.w3.org/TR/resize-observer/) — spec, including the deliver-notifications algorithm.
- MDN, [Same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy) — why the parent can't read `iframe.contentDocument.body.scrollHeight` cross-origin.
- MDN, [CSS Font Loading API / `document.fonts.ready`](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Font_Loading_API) — the gate for the "fonts swap and break my measurement" failure mode.

**Primary (practitioners):**

- Surma, [ResizeObserver: it's like document.onresize for elements](https://web.dev/articles/resize-observer) — why `window.onresize` and MutationObserver are inadequate substitutes.
- David Bradshaw, [iframe-resizer](https://github.com/davidjbradshaw/iframe-resizer) — the de-facto OSS implementation; their docs enumerate every edge case in production.

**Secondary:**

- [Bocoup, Cross-domain messaging with postMessage](https://bocoup.com/blog/cross-domain-messaging-with-postmessage) — older but cited everywhere; clear `targetOrigin: '*'` warnings.
- [Iframely docs on responsive embeds](https://iframely.com/docs/iframes) — practical guidance on aspect-ratio fallbacks and oEmbed conventions.

— Pierre
