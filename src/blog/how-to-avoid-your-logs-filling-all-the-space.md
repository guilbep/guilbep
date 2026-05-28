---
title: "How to avoid your logs filling all the space"
description: "Cap Docker's default driver, pick logrotate XOR journald per source, ship structured JSON off-box with Vector."
draft: true
---

[← back to blog](..)

# How to avoid your logs filling all the space

_Stub seeded with research — references and current-state notes ready; prose still needs writing._

## TL;DR

Rotate locally with logrotate/journald, cap Docker's default driver, and ship structured JSON off-box with Vector — before disk-full ever becomes the on-call page.

## Why it matters

_(Draft prompt: "disk full from logs" is one of the most common incident postmortems and one of the most boring to fix. The Docker default + the "cron rm" anti-pattern cover ~80% of real cases.)_

## Current state

- **logrotate is still the workhorse** for app-written files (`/var/log/nginx/*.log`); **journald** owns anything from `systemd` units. Don't double-rotate — pick one per source.
- **Docker's default `json-file` driver has no size cap** — a chatty container can fill `/var/lib/docker` overnight. Fix is two lines in `daemon.json` (`max-size`, `max-file`) or switch to the `local` driver (zstd + rotation by default since 20.10).
- **Vector has effectively become the default "ship off-box" agent** for new deploys: Rust, vendor-agnostic, ~2× Fluent Bit throughput. Fluent Bit still wins on memory at the edge; Promtail only if you're all-in on Loki.
- **Structured JSON-lines logs compress 60–80% with gzip/zstd** and let you drop verbose fields at the shipper (VRL in Vector) before paying for storage — bigger disk win than any rotation policy.
- **"Cron job that `rm`s logs older than 30 days"** is the most common pattern in the wild and the most common cause of half-truncated logs and missed incidents. Use rotation primitives instead.

## Angle worth leaning into

**Lead with the Docker default-fills-disk footgun** — highest-impact, lowest-effort fix; almost every reader has it misconfigured.

Close with: **"Past hobby scale, rotate-locally is a delaying tactic; ship-and-forget via Vector is the real answer."**

## References

- [`logrotate(8)` (man7.org)](https://man7.org/linux/man-pages/man8/logrotate.8.html) — canonical; `size`, `daily/weekly`, `compress`, `copytruncate`, `maxage`, `rotate N`.
- [`journald.conf` (freedesktop.org)](https://www.freedesktop.org/software/systemd/man/latest/journald.conf.html) — `SystemMaxUse`, `SystemKeepFree`, `SystemMaxFileSize`; default cap is 10% of FS, capped at 4 GB.
- [Docker — json-file logging driver](https://docs.docker.com/engine/logging/drivers/json-file/) — confirms default driver has no rotation; documents `max-size` / `max-file`.
- [Docker — Configure logging drivers](https://docs.docker.com/engine/logging/configure/) — daemon-wide defaults via `/etc/docker/daemon.json`; the one-line fix.
- [Vector — overview (Is It Observable)](https://isitobservable.io/observability/vector-the-telemetry-agent-by-datadog) — Rust pipeline, 46 sources / 59 sinks, vendor-neutral.
- [Fluent Bit vs Vector vs Logstash benchmark 2025 (Onidel)](https://onidel.com/blog/log-shipping-benchmark-2025) — throughput numbers.
- [OpenTelemetry Logs spec](https://opentelemetry.io/docs/specs/otel/logs/) — structured-log model.
- [Last9 — Docker logging drivers compared](https://last9.io/blog/docker-logging-drivers/) — `json-file` vs `local` vs `journald` in practice.

— Pierre
