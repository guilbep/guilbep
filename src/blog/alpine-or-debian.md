---
title: "Alpine or Debian?"
description: "Why the Alpine-vs-Debian frame is outdated, and what the real 2026 axis looks like."
draft: true
---

[← back to blog](..)

# Alpine or Debian?

_Stub seeded with research — angle, sources, and concept skeleton are ready; prose still needs writing._

## TL;DR

In 2026, Debian-slim is the safe default, distroless (or Chainguard/Wolfi) is the right answer if you can give up a shell, and Alpine is a specialist choice for static Go/Rust binaries — not a general-purpose win.

## Why it matters

_(Draft prompt: "use Alpine, it's smaller" is the wrong default for most workloads. The size advantage often evaporates after toolchains and source-compiled wheels, and the musl-vs-glibc differences cause production-only bugs that don't show up until you ship.)_

## The core idea — concepts the post must cover

- Compressed vs uncompressed image size, and what % of pull/runtime cost is actually the base layer.
- musl vs glibc: ABI/runtime implications, not just "smaller".
- DNS behaviour diffs: parallel queries, search-domain/ndots, AAAA NXDOMAIN handling, historical TCP gap.
- Locale support: musl has minimal locale data; affects Unicode-collation / `LC_ALL` code paths.
- Thread stack defaults (~128 KB musl vs MBs glibc) and the segfault failure mode.
- Wheel/binary availability: `manylinux` (glibc) vs `musllinux` (PEP 656); JVM/Node native-addon equivalent.
- Build-toolchain weight: `build-base`, `gcc`, headers can erase Alpine's size advantage in multi-stage builds.
- CVE accounting: distroless and Chainguard win on scanner counts because there's nothing to flag — not necessarily because it's "more secure".
- Security update model: Alpine's 6-month branches + own tracker vs Debian's LTS + backports + DSA.
- Distroless variants (`static`, `base`, `cc`, runtime-specific) and the no-shell debugging cost (`ko`, `kubectl debug`, ephemeral containers).
- glibc-based slim alternatives (`debian:*-slim`, Wolfi, Ubuntu Chiseled) as the middle ground.

## The angle worth leaning into

**Alpine's original selling point — small and secure — has been overtaken on both axes.**

On size: `distroless/static` (~2 MB) and `scratch` beat Alpine (~5–7 MB) for any statically-linked binary, and `debian-slim` + multi-stage builds match Alpine for most interpreted apps once toolchains and source-compiled wheels are counted.

On security: the scanner-count win belongs to distroless and nightly-rebuilt Chainguard/Wolfi images (often 0 CVEs by construction), while Alpine still ships BusyBox, an apk database, and a shell.

Alpine's remaining defensible niche is narrow: musl-static Go/Rust where you want `apk add` available for ops, embedded/IoT, or CI runners. The post can lean into: **"the Alpine-vs-Debian frame is itself outdated — the real 2026 axis is glibc-slim vs distroless, with Alpine as a third option only when its specific tradeoffs match your workload."**

## Gotchas — misconceptions to call out

- **"Alpine is always smaller."** Only at the base layer. After adding `build-base`, Python headers, or a JDK, Debian-slim often ends up comparable or smaller per deployed app.
- **"Alpine is more secure because it has fewer packages."** Fewer packages ≠ fewer exploitable bugs; musl has had its own DNS/TLS-adjacent CVEs, and distroless beats Alpine on attack surface.
- **"musl is a drop-in glibc replacement."** It is not — DNS, locales, NSS, threading, and dynamic-loader semantics all differ and cause production-only bugs.
- **"Switching to Alpine will speed up my Python/Node app."** The opposite is common: slower allocator, smaller stacks, source-compiled deps, no manylinux wheels.
- **"Scanner shows 0 CVEs, therefore it's secure."** Distroless/Chainguard images often hide app-level CVEs from scanners that only see OS packages; you still need SBOM + dep scanning.

## References

**Primary (the Python-on-Alpine canon):**

- Itamar Turner-Trauring, [Using Alpine can make Python Docker builds 50× slower](https://pythonspeed.com/articles/alpine-docker-python/) — canonical primary source on the build-time pain (no manylinux wheels, must compile from source).
- Home Assistant devs, [Improving Python's speed by 40% on Alpine](https://developers.home-assistant.io/blog/2020/07/13/alpine-python/) — runtime perf write-up; pinpoints `-Os` vs `-O2` and musl malloc as causes.

**Primary (musl differences):**

- [musl wiki: Functional differences from glibc](https://wiki.musl-libc.org/functional-differences-from-glibc.html) — authoritative list of musl deviations (DNS, locales, threads, nsswitch).
- [Alpine wiki: Musl](https://wiki.alpinelinux.org/wiki/Musl) + [docker-alpine caveats](https://github.com/gliderlabs/docker-alpine/blob/master/docs/caveats.md) — Alpine's own statement of musl/BusyBox tradeoffs and known DNS caveats.
- bell-sw, [Solving DNS issues in musl](https://bell-sw.com/blog/how-to-deal-with-alpine-dns-issues/) — practical workarounds + the DNS-over-TCP history (fixed in musl 1.2.4 / Alpine 3.18).
- [Python bug #32307: musl thread stack size](https://bugs.python.org/issue32307) + [muslstack](https://github.com/yaegashi/muslstack) — the 128 KB (formerly 80 KB) default pthread stack vs glibc's 2–10 MB.

**Primary (distroless / hardened):**

- [GoogleContainerTools/distroless](https://github.com/GoogleContainerTools/distroless) — official distroless repo: image variants (static, base, cc, java, nodejs), no shell/package-manager rationale.
- Chainguard, [Hardened Container Images: Low-to-No CVEs by Design](https://www.chainguard.dev/unchained/hardened-container-images-images-for-a-secure-supply-chain) — argument for nightly-rebuilt minimal images as a third option.

**Primary (security workflows):**

- [Alpine security tracker](https://security.alpinelinux.org/) and [Debian backports](https://backports.debian.org/) — the two distros' actual CVE workflows.

**Secondary:**

- Chainguard, [glibc vs musl](https://edu.chainguard.dev/chainguard/chainguard-images/about/images-compiled-programs/glibc-vs-musl/) — vendor-neutral comparison in container context.
- [Why lowering ndots breaks Alpine pods but not Debian](https://dev.to/bianbbc87/why-lowering-ndots-breaks-alpine-pods-but-not-debian-a-deep-dive-into-glibc-vs-musl-resolvers-1lhb) — concrete Kubernetes failure mode from musl's parallel resolver.
- [HN thread on the pythonspeed article](https://news.ycombinator.com/item?id=38798233) — sanity check on community sentiment and edge cases.

— Pierre
