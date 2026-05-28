---
title: "Why you should secure your SSH gate"
description: "Pubkey-only sshd is fine; not exposing sshd at all is better."
draft: true
---

[← back to blog](..)

# Why you should secure your SSH gate

_Stub seeded with research — references and current-state notes ready; prose still needs writing._

## TL;DR

Pubkey-only sshd is fine; **not exposing sshd at all is better** — and either way, five lines of sshd_config kill the background-radiation attacks.

## Why it matters

_(Draft prompt: every public SSH endpoint sees ~50,000 background login attempts a week. The 2015 answer was "harden sshd_config." The 2026 answer is "delete the public attack surface." Both work, the latter is stronger.)_

## Current state

- **Modern sshd_config consensus is narrow and boring**: `Protocol 2`, `PermitRootLogin no`, `PasswordAuthentication no`, `KbdInteractiveAuthentication no`, `PubkeyAuthentication yes`, curve25519/chacha20 only, PAM line disabled — matches Mozilla and CIS almost verbatim.
- **SSH certificates** (signed by an internal CA, short TTL, `principals` instead of `authorized_keys`) are the quiet upgrade path at scale: Facebook/Netflix/Uber-style. Smallstep and HashiCorp Vault made it accessible to small teams.
- **The centre of gravity has shifted from "harden sshd" to "don't expose sshd"**: Tailscale SSH, Cloudflare Access for SSH, AWS SSM Session Manager, Teleport, Boundary — all kill the public listener entirely.
- fail2ban / sshguard / endlessh are still useful but increasingly framed as **log-noise reducers, not security controls**; with pubkey-only auth, brute force is already mathematically dead.
- **Moving off port 22** is the most argued-about line: it isn't security, but it cuts log volume ~99% and lets fail2ban catch the rare targeted scanner faster. Most ops people now grudgingly endorse it.

## Angle worth leaning into

Lead with the inversion: **"The strongest sshd_config in 2026 is `ListenAddress 100.64.0.0/10`"** — i.e. the win isn't hardening, it's deletion of the public attack surface.

Five-settings checklist (`PermitRootLogin no`, `PasswordAuthentication no`, `KbdInteractiveAuthentication no`, `PubkeyAuthentication yes`, curve25519/chacha20 only) as the fallback for readers who can't move to a mesh VPN yet.

## References

- OpenBSD, [`sshd_config(5)` man page](https://man.openbsd.org/sshd_config) — canonical reference for every directive.
- [Mozilla InfoSec OpenSSH Guidelines](https://infosec.mozilla.org/guidelines/openssh) — battle-tested modern/intermediate sshd_config profiles.
- [CIS Benchmark — Linux SSH section](https://www.cisecurity.org/benchmark/distribution_independent_linux) — auditable line-by-line hardening (`LoginGraceTime`, `MaxAuthTries`, `ClientAlive*`, `LogLevel VERBOSE`).
- [Tailscale SSH announcement](https://tailscale.com/blog/tailscale-ssh) + [Protect SSH with Tailscale](https://tailscale.com/docs/reference/ssh-over-tailscale) — the "stop exposing port 22" pitch.
- [fail2ban docs](https://github.com/fail2ban/fail2ban/wiki) + [sshguard docs](https://www.sshguard.net/docs/) — reactive log-tail-and-ban tools; still the default reflex on a fresh VPS.
- [Endlessh tarpit (skeeto)](https://github.com/skeeto/endlessh) — slow-banner SSH tarpit on port 22; move real sshd to a high port.
- [NIST IR 7966 — SSH access management](https://csrc.nist.gov/pubs/ir/7966/final) — enterprise angle: untracked SSH keys are the real long-tail risk.

— Pierre
