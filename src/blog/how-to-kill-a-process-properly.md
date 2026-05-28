---
title: "How to kill a process properly"
description: "SIGTERM asks nicely, SIGKILL doesn't ask — and if your app is PID 1 in a container, neither works as you think."
draft: true
---

[← back to blog](..)

# How to kill a process properly

_Stub seeded with research — references and current-state notes ready; prose still needs writing._

## TL;DR

SIGTERM asks nicely, SIGKILL doesn't ask — and if your app is PID 1 in a container without an init proxy, neither one works the way you think.

## Why it matters

_(Draft prompt: most engineers ship containers that silently fail to honour `docker stop` / `kubectl delete pod`, eat the full 10–30 s grace period, and lose in-flight requests on every deploy. The fix is one line. The understanding is one diagram.)_

## Current state

- **Signal vocabulary**:
  - **SIGINT (2)** — Ctrl+C, interactive interrupt
  - **SIGHUP (1)** — terminal hangup, idiomatically "reload config" (nginx, sshd)
  - **SIGQUIT (3)** — Ctrl+\, terminate with core dump; nginx uses it for graceful drain
  - **SIGTERM (15)** — polite "please exit"; default for `kill` / `docker stop` / kubelet
  - **SIGKILL (9)** — uncatchable forced termination; no cleanup, no defers, no atexit
- **"Ask, wait, kill" is the universal contract**:
  - systemd: `KillSignal=` (default SIGTERM), wait `TimeoutStopSec=` (default 90 s), `FinalKillSignal=` (SIGKILL).
  - Docker: SIGTERM → SIGKILL after `--time` (default 10 s).
  - Kubernetes: preStop → SIGTERM → wait `terminationGracePeriodSeconds` (default 30 s) → SIGKILL. **preStop time counts against the grace period** — common footgun.
- **PID 1 trap**: the kernel does **not** apply default signal actions to PID 1, so a process running as PID 1 in a container with no SIGTERM handler simply ignores it and gets SIGKILLed after the grace period. **Fix**: `docker --init`, or use `tini`/`dumb-init` as `ENTRYPOINT`, or trap SIGTERM explicitly. **Shell-script entrypoints are the classic offender** — bash doesn't forward signals to children unless you `exec` or `trap`.
- macOS sends the same POSIX signals; `launchd` uses `ExitTimeOut` (default 20 s).
- **Modern runtimes expect you to opt in**: Go (`signal.NotifyContext` + `server.Shutdown`), Node (`process.on('SIGTERM', …)` + `server.close()`) — both pair with connection draining (stop accepting, finish in-flight, exit).

## Angle worth leaning into

**The PID 1 trap is the highest-leverage story.** The fix is one line (`--init`, `tini`, or `exec` in entrypoint).

Pair it with the **k8s 30-second rule**: if your shutdown takes longer than `terminationGracePeriodSeconds`, you are losing data on every rollout — full stop.

## References

- [`signal(7)` (man7.org)](https://man7.org/linux/man-pages/man7/signal.7.html) — canonical reference; SIGKILL/SIGSTOP uncatchable; everything else catchable.
- SUSE, [SIGKILL vs SIGTERM: Master Process Termination](https://www.suse.com/c/observability-sigkill-vs-sigterm-a-developers-guide-to-process-termination/) — solid 2026-era overview with k8s context.
- Google Cloud, [Kubernetes best practices: terminating with grace](https://cloud.google.com/blog/products/containers-kubernetes/kubernetes-best-practices-terminating-with-grace) — authoritative on preStop → SIGTERM → wait → SIGKILL.
- Kubernetes, [Container Lifecycle Hooks](https://kubernetes.io/docs/concepts/containers/container-lifecycle-hooks/) — preStop semantics; preStop time counts against `terminationGracePeriodSeconds`.
- Hynek Schlawack, [Why Your Dockerized Application Isn't Receiving Signals](https://hynek.me/articles/docker-signals/) — best explainer of the PID 1 trap.
- [`tini` (krallin/tini)](https://github.com/krallin/tini) — the init proxy Docker bundles via `--init`; rationale and zombie-reaping.
- [`systemd.kill` man page](https://www.freedesktop.org/software/systemd/man/latest/systemd.kill.html) — `KillSignal=`, `KillMode=`, `TimeoutStopSec=`, `FinalKillSignal=`.
- VictoriaMetrics, [Graceful Shutdown in Go: Practical Patterns](https://victoriametrics.com/blog/go-graceful-shutdown/) — `signal.NotifyContext` pattern.

— Pierre
