---
title: "How to improve speed (DNS, TLS handshake, geo-distribution, route)"
description: "RTT is the budget you spend, not the server — and most of it is gone before your backend logs a line."
draft: true
---

[← back to blog](..)

# How to improve speed (DNS, TLS handshake, geo-distribution, route)

_Stub seeded with research — angle, sources, and concept skeleton are ready; prose still needs writing._

## TL;DR

Most of "make the page fast" is shaving round-trips before your server is even reached: cut the handshakes (TLS 1.3, QUIC, 0-RTT), shorten the wire (Anycast DNS, CDN PoPs, smart routing), and measure each phase with Resource Timing — not just TTFB.

## Why it matters

_(Draft prompt: a typical "my server is 20 ms" engineer ignores the 200–800 ms of pre-TTFB on a cold connection from a distant client. The latency budget is dominated by protocol handshakes and physical distance, not backend code.)_

## The core idea — concepts the post must cover

- **Cold-request waterfall**: DNS → TCP SYN/SYN-ACK → TLS ClientHello/ServerHello (+cert) → request → TTFB → download.
- **RTT as a hard floor**: speed of light in fibre ≈ 200,000 km/s; NYC↔Sydney one-way ~80 ms, RTT ~160 ms; multiply by handshake round-trips.
- Per-phase realistic budgets at 30 / 100 / 300 ms RTT (local / continental / intercontinental).
- TCP needs 1 RTT; TLS 1.2 adds 2 RTT; TLS 1.3 adds 1 RTT; TLS 1.3 resumption = 0-RTT; QUIC = 1-RTT cold, 0-RTT resumed.
- DNS: recursive resolver hops, TTL economics, Anycast DNS (Route53, 1.1.1.1, NS1), `dns-prefetch` and `preconnect` hints.
- Geo-distribution: CDN PoPs terminate TLS close to user, turning a 300 ms intercontinental handshake into ~30 ms regional; origin shielding for cache-miss cost.
- BGP reality: shortest AS-path ≠ lowest latency; private backbones and smart routing (Argo, AWS Global Accelerator) beat default BGP.
- Connection reuse: HTTP/2 and HTTP/3 multiplexing amortise handshake cost across requests; head-of-line blocking differences.
- 0-RTT replay safety: only GETs / idempotent requests; servers must enforce anti-replay windows.
- Measurement stack: `curl -w "%{time_namelookup} %{time_connect} %{time_appconnect} %{time_starttransfer} %{time_total}\n"`, Resource Timing API, WebPageTest waterfall, Chrome DevTools "Network" timing breakdown, RUM via `PerformanceObserver`.

## The angle worth leaning into

Lead with **"RTT is the budget you spend, not the server."** Frame the whole post as an accounting exercise: a 200 ms RTT user has ~1.0 s of latency **spent on protocol** (1×DNS + 1×TCP + 2×TLS 1.2 = 4 RTT = 800 ms) before your backend logs a single line.

Every mitigation is a line-item refund: TLS 1.3 saves 1 RTT, resumption saves another, QUIC collapses TCP+TLS into one, a PoP cuts the RTT itself in half.

The punchline: scaling your origin from 50 ms to 20 ms saves **30 ms**; moving the handshake from Frankfurt to São Paulo for a Brazilian user saves **250 ms**. **The CDN isn't a cache — it's a handshake terminator.**

## Gotchas — misconceptions to call out

- **"My server responds in 20 ms, so the site is fast."** Ignores the 200–800 ms of pre-TTFB on a cold connection from a distant client.
- **"A CDN is just a cache."** Its bigger win is often terminating TCP+TLS at the edge, not bytes served from cache.
- **"HTTPS is slow."** True in TLS 1.0/1.2-no-resumption era; TLS 1.3 + session tickets + QUIC make HTTPS *faster* than HTTP on cold connections (HSTS skips the http→https redirect RTT).
- **"DNS doesn't matter, it's cached."** First visit, expired TTL, or carrier resolvers add 50–200 ms; Anycast DNS measurably wins.
- **"Just upgrade bandwidth."** Past ~5 Mbps, page load is RTT-bound, not throughput-bound (Belshe/Grigorik data).

## References

**Primary (canonical):**

- Ilya Grigorik, [High Performance Browser Networking](https://hpbn.co/) (free online) — chapters 4 (TCP), 5 (UDP/QUIC), 9 (TLS); handshake math, BDP, why latency dominates past ~5 Mbps.
- Ilya Grigorik, [Latency: The New Web Performance Bottleneck](https://www.igvita.com/2012/07/19/latency-the-new-web-performance-bottleneck/) — clearest statement of the thesis; Mike Belshe data on bandwidth-vs-RTT scaling.

**Primary (Cloudflare):**

- [Even faster connection establishment with QUIC 0-RTT resumption](https://blog.cloudflare.com/even-faster-connection-establishment-with-quic-0-rtt-resumption/) — concrete RTT savings, replay caveats.
- [Introducing 0-RTT](https://blog.cloudflare.com/introducing-0-rtt/) — TLS 1.3 0-RTT mechanics, idempotency requirement.
- [A deep dive into Argo Smart Routing](https://blog.cloudflare.com/argo/) — real numbers on BGP-vs-overlay routing (~30% TTFB).
- [Anycast primer](https://blog.cloudflare.com/a-brief-anycast-primer/) — why Anycast DNS + HTTP shortens the first RTT.

**Primary (RFCs):**

- [RFC 8446 (TLS 1.3)](https://www.rfc-editor.org/rfc/rfc8446) — §2.2 (0-RTT), §4.2.11 (PSK resumption), §E.5 (replay considerations).
- [RFC 9000 (QUIC)](https://www.rfc-editor.org/rfc/rfc9000) — combined transport + crypto handshake; why QUIC is 1-RTT (or 0-RTT).

**Primary (measurement):**

- Geoff Huston, [A look at QUIC use](https://blog.apnic.net/2023/06/19/a-look-at-quic-use/) — independent measurement of QUIC adoption vs TCP+TLS in the wild.
- [WebPageTest docs](https://docs.webpagetest.org/) — waterfall colour legend (DNS / Connect / SSL / TTFB / Download).
- MDN, [`PerformanceResourceTiming`](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming) — field mapping for in-browser measurement.

— Pierre
