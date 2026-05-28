---
title: "How to improve your website with efficient caching (HTTP headers)"
description: "Two patterns are all you need: immutable hashed URLs forever, mutable URLs revalidated — everything else is variation."
draft: true
---

[← back to blog](..)

# How to improve your website with efficient caching (HTTP headers)

_Stub seeded with research — angle, sources, and concept skeleton are ready; prose still needs writing._

## TL;DR

Cache aggressively and forever for fingerprinted URLs; cache mutable URLs briefly and validate with ETags — everything else is a variation on those two patterns.

## Why it matters

_(Draft prompt: most engineers set `Cache-Control` by superstition. The two failure modes are equally bad — stale content (users see last week's HTML) or no caching at all (every visit hits the origin). One mental model fixes both.)_

## The core idea — concepts the post must cover

- **Freshness vs. validation**: cached responses are either "fresh" (used directly) or "stale" (must revalidate). `max-age` controls the first; ETag/Last-Modified the second.
- **Shared vs. private cache**: what `private`, `public`, and `s-maxage` actually do (`s-maxage` implies shared-cacheable).
- **`no-cache` means "revalidate before use", NOT "don't cache"** — that's `no-store`.
- The 304 Not Modified flow: conditional request via `If-None-Match` / `If-Modified-Since`, server returns 304 with no body, cache refreshes freshness.
- ETag types: strong vs. weak (`W/"..."`) and why weak is usually what you want for compressed responses.
- **`Vary` semantics**: cache key is (URL + Vary header values). `Vary: User-Agent` is a cache-buster; `Vary: Accept-Encoding` is necessary; `Vary: Cookie` is a footgun.
- `immutable`: skips the revalidation browsers do on explicit reload (Cmd-R); only meaningful within freshness window.
- `stale-while-revalidate` and `stale-if-error`: async refresh + resilience patterns at the edge.
- `must-revalidate` vs. default: forbids serving stale even when network is broken.
- **CDN-specific layer**: `Surrogate-Control` (Fastly), `CDN-Cache-Control` (RFC 9213 three-tier model: CDN / proxy / browser).
- **Decision matrix by asset class**: HTML (short `max-age` + revalidate, or `no-cache` + ETag); hashed JS/CSS bundles (`max-age=31536000, immutable`); unversioned images (medium `max-age` + SWR); API JSON (often `private, no-store` or per-resource ETag).

## The angle worth leaning into

Lean into the **two-tier mental model** Jake Archibald advocates: **immutable hashed URLs vs. server-revalidated mutable URLs.** Use **stale-while-revalidate** as the bridge that makes the "mutable" tier feel instant without serving dangerously stale content.

Then close on the **three-headers future**:

- `Cache-Control` for browsers
- `CDN-Cache-Control` (RFC 9213) for the edge
- `Surrogate-Control` for legacy Fastly setups

The single-header era is ending because browser caches and CDN caches have genuinely different needs.

## Gotchas — misconceptions to call out

- **"`no-cache` means don't cache it."** It means cache it, but revalidate every time. The "don't cache" directive is `no-store`.
- **"`Cache-Control: public` is required to be cacheable."** False — responses are cacheable by default if they have freshness info; `public` only overrides specific cases (e.g. authenticated requests).
- **"ETags make caching work better."** Only if your origin actually returns 304 — many frameworks regenerate the body anyway, saving bandwidth but not server work. Mismatched ETags across a load-balanced fleet defeat caching entirely.
- **"Setting `max-age=31536000` everywhere is the best practice."** Only safe for content-addressed (hashed) URLs. On mutable URLs it guarantees stale content for up to a year.
- **"CDNs respect my `Cache-Control` headers exactly."** They don't. Cloudflare caches by file extension by default; Fastly defers to `Surrogate-Control` over `Cache-Control` when both are present.

## References

**Primary (RFCs):**

- [RFC 9111 — HTTP Caching](https://www.rfc-editor.org/rfc/rfc9111) — normative spec (replaces 7234); directive semantics, freshness calculation, validation.
- [RFC 5861 — stale-while-revalidate / stale-if-error](https://www.rfc-editor.org/rfc/rfc5861) — short; worth reading in full.
- [RFC 8246 — HTTP Immutable Responses](https://www.rfc-editor.org/rfc/rfc8246) — defines `immutable` precisely; originated from Facebook (via Patrick McManus at Mozilla).

**Primary (MDN + canon):**

- MDN, [`Cache-Control`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) — best directive-by-directive reference.
- MDN, [HTTP caching guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching) — companion overview.
- Mark Nottingham, [Caching Tutorial](https://www.mnot.net/cache_docs/) — canonical explainer by the editor of RFC 9111.
- Mark Nottingham, [Caching Header Best Practices](https://www.mnot.net/blog/2017/03/16/browser-caching) — practical guidance from the spec editor.
- Jake Archibald, [Caching best practices & max-age gotchas](https://jakearchibald.com/2016/caching-best-practices/) — the two-pattern essay. Required reading.

**Primary (CDNs):**

- Cloudflare, [Cache-Control directives](https://developers.cloudflare.com/cache/concepts/cache-control/) + [Default cache behaviour](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/) — what a major CDN actually interprets and caches.
- Fastly, [Cache freshness & VCL semantics](https://www.fastly.com/documentation/guides/concepts/edge-state/cache/) + [Surrogate-Control](https://www.fastly.com/documentation/reference/http/http-headers/Surrogate-Control/) — CDN-only header pattern.

**Secondary:**

- web.dev, [HTTP cache](https://web.dev/articles/http-cache) — decision-tree style guide; source for the "asset class matrix" framing.
- Harry Roberts, [Cache-Control for Civilians](https://csswizardry.com/2019/03/cache-control-for-civilians/) — practical breakdown of directive combinations.
- web.dev, [stale-while-revalidate](https://web.dev/articles/stale-while-revalidate) — clean explanation with timeline diagrams.

— Pierre
