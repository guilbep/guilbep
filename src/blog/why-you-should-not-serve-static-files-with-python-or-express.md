---
title: "Why you should not serve static files with Python or Express"
description: "Even at low traffic, a CDN or reverse proxy is cheaper, safer, and faster than burning app-server cycles on GET /logo.svg."
draft: true
---

[← back to blog](..)

# Why you should not serve static files with Python or Express

_Stub seeded with research — references and current-state notes ready; prose still needs writing._

## TL;DR

Your framework can serve static files; that doesn't mean it should — even at low traffic, a CDN or reverse proxy is cheaper, safer, and faster than burning app-server cycles on `GET /logo.svg`.

## Why it matters

_(Draft prompt: "but my framework can serve static" hides real costs — worker slots burned on `/favicon.ico`, application logs full of asset noise, no edge cache, no sendfile, no HTTP/3. Two architectures eliminate all of that.)_

## Current state

- **Throughput**: clean nginx/Caddy serve **2–3× more static req/s** than the best Node static middleware, and similarly outpace ASGI/WSGI servers like uvicorn/gunicorn. The gap is **structural** (C, `sendfile(2)`, zero-copy, mature caches), not a tuning problem.
- **App servers don't have the right primitives**: no `sendfile`/`mmap` by default, no edge cache, no built-in conditional GET/ETag pipeline tuned for hot paths, and every request burns event-loop ticks or a worker slot that should be running app logic.
- **CDN-native hosting** (Cloudflare Pages, Vercel static, Netlify, S3+CloudFront) makes the problem disappear: static is served from the edge, the origin app never sees the request, TLS/HTTP3/Brotli/cache headers are someone else's job.
- **Two reasonable architectures in 2026**:
  1. **Reverse proxy** (nginx/Caddy) co-located with the app, serving `/static/*` directly.
  2. **Static fully offloaded** to a CDN/object store on `cdn.example.com`; app server only handles dynamic routes.
- **"It works for my low-traffic site"** hides real costs: each static request still consumes a worker slot, fills application logs with noise, blocks GIL/event-loop ticks during burst traffic, and bypasses the layer where compression/cache headers belong.

## Angle worth leaning into

The cleanest 2026 framing: **static files don't belong on your app server at all — they belong on a CDN.**

- **Nginx-in-front** is the legacy good answer.
- **"Build artefact pushed to an edge bucket, app server only serves JSON"** is the current one.

## References

- [Express — Production best practices: performance and reliability](https://expressjs.com/en/advanced/best-practice-performance/) — Express docs explicitly recommend running behind a reverse proxy.
- [Django — How to deploy static files](https://docs.djangoproject.com/en/5.2/howto/static-files/deployment/) — Django's position: runserver's static handling is "grossly inefficient and probably insecure".
- [Python — `http.server` docs](https://docs.python.org/3/library/http.server.html) — explicit "not recommended for production" warning.
- [WhiteNoise docs](https://whitenoise.readthedocs.io/en/stable/django.html) — the pragmatic middle ground for Django, but the docs themselves push CDN offload for scale.
- CentminMod, [Nginx vs Node.js static Siege benchmark](https://centminmod.com/siegebenchmarks/2013/020313/index.html) — clean nginx ~15,600 req/s vs node-static ~7,500.
- [Caddy 2.8 vs Nginx 1.26 static benchmark (2026)](https://dev.to/johalputt/caddy-28-vs-nginx-126-static-file-serving-speed-benchmark-2026-2o1e) — Caddy ~22% faster on small files over HTTP/2; both orders of magnitude past any Node static server.
- wersdoerfer, [Benchmarking nginx vs caddy vs uvicorn for static](https://wersdoerfer.de/blogs/ephes_blog/benchmark-nginx-caddy-uvicorn/) — confirms the gap holds for ASGI too.

— Pierre
