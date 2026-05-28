---
title: "Globbing in regex inside nginx routes"
description: "There are no globs — location matching is a two-phase algorithm, and ^~ is the only escape hatch."
draft: true
---

[← back to blog](..)

# Globbing in regex inside nginx routes

_Stub seeded with research — angle, sources, and concept skeleton are ready; prose still needs writing._

## TL;DR

In nginx `location`, `=` and `^~` short-circuit; among regular prefixes longest wins; regex locations are tried in source order and beat plain prefixes — there are no globs, only PCRE.

## Why it matters

_(Draft prompt: nginx config bugs are silent — the wrong location matches, the request 404s or hits the wrong upstream, and `nginx -t` doesn't flag it. Understanding the two-phase selection algorithm cuts debugging time from hours to minutes.)_

## The core idea — concepts the post must cover

- The five location forms: `location /p`, `location = /p`, `location ^~ /p`, `location ~ re`, `location ~* re`.
- **The actual algorithm:** (1) `=` exact wins immediately; (2) longest prefix match is remembered; (3) if remembered prefix has `^~`, use it and skip regex; (4) regex locations tried in source order, first match wins; (5) fall back to remembered prefix.
- Regex order matters; prefix order does not (longest wins regardless of file order).
- Nginx has **no glob syntax** — `*` in `server_name` is a wildcard, not regex, and `try_files` arguments are literal URIs/paths with variable interpolation only.
- `$uri` is the normalised decoded URI after rewrites; regex captures use `$1..$9` or named groups.
- Internal redirects (from `rewrite`, `try_files`, `index`, `error_page`) re-run location selection.
- Nested `location` inside a regex location is forbidden in some cases; selection restarts on internal redirect.
- Debug path: `nginx -T` to dump merged config, `error_log ... debug` with `nginx-debug` binary, `rewrite_log on` for `[notice]`-level rewrite traces.
- Performance: regex locations are checked sequentially and are markedly slower under load than prefix matches.
- `server_name` selection (exact → longest leading `*` → longest trailing `*` → regex in order) is a **separate algorithm** from `location` — often confused with it.

## The angle worth leaning into

Nginx's location algorithm is **two-phase, not single-pass**: prefix matching is a "remember the best one" pass, then regex matching is a "first hit wins by file order" pass. That means rearranging two `location ~` blocks can silently change routing while rearranging two prefix blocks never does — and `^~` is the **only** knob that lets a prefix declare "I'm the answer, stop looking at regex."

Frame the post around that asymmetry — **set-like prefixes vs list-like regex** — and the rest of the rules fall out as consequences, including why `=` exists as a fast-path for hot URIs like `/` or `/healthz`.

## Gotchas — misconceptions to call out

- **"Longest match always wins"** — false once any regex is in play; regex beats a plain (non-`^~`) prefix even if the prefix is longer.
- **"Regex locations are tried by specificity"** — false; they are tried strictly in file order.
- **"`^~` boosts a prefix's priority over a better-matching exact `=`"** — false; `=` still wins, and `^~` only matters if its prefix is the longest matching prefix.
- **"`try_files $uri $uri/ /index.php?$args` patterns use globs"** — false; each arg is a URI/path, only variables expand.
- **"`if` inside `location` is a normal conditional"** — it's effectively a nested location with surprising semantics ("if is evil"); `rewrite` and `return` are the safe subset.

## References

**Primary (nginx docs):**

- [`location` directive](https://nginx.org/en/docs/http/ngx_http_core_module.html#location) — canonical statement of prefix vs regex syntax and algorithm.
- [`server_name`](https://nginx.org/en/docs/http/server_names.html) — clarifies how `server_name` regex selection differs from `location` (often conflated).
- [`try_files`](https://nginx.org/en/docs/http/ngx_http_core_module.html#try_files) — args are URI/file paths, not glob patterns.
- [`rewrite` module](https://nginx.org/en/docs/http/ngx_http_rewrite_module.html) — `rewrite`, `rewrite_log`, `if`; confirms regex is PCRE.
- [Debugging log](https://nginx.org/en/docs/debugging_log.html) — official debug log build/enable steps (`nginx-debug`, `error_log ... debug`).
- [Command-line switches](https://nginx.org/en/docs/switches.html) — documents `nginx -T` (test + dump full merged config) vs `-t`.
- [Trac #97](https://trac.nginx.org/nginx/ticket/97) — classic `try_files` + `alias` bug; evidence that `$uri` semantics surprise people.

**Secondary:**

- DigitalOcean, [Understanding nginx server and location block selection algorithms](https://www.digitalocean.com/community/tutorials/understanding-nginx-server-and-location-block-selection-algorithms) — best plain-language walkthrough.
- Martin Fjordvald, [Understanding the nginx configuration inheritance model](https://blog.martinfjordvald.com/understanding-the-nginx-configuration-inheritance-model/) — how `location`/`server` inheritance interacts with `try_files`.
- Martin Fjordvald, [nginx primer](https://blog.martinfjordvald.com/nginx-primer/) — framing of location as a routing decision, not pattern matching.
- Danila Vershinin, [Performance impact of nginx locations](https://www.getpagespeed.com/server-setup/nginx-locations-performance-impact-and-optimizations) — perf cost of regex locations and `^~` as an optimisation.
- Danila Vershinin, [Nginx rewrite rules](https://www.getpagespeed.com/server-setup/nginx/nginx-rewrite-rules) — `return` vs `rewrite`, internal-redirect loops.

— Pierre
