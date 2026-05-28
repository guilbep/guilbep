---
title: "Installing Debian on macOS — yes, possible"
description: "Asahi-patched Debian on M1/M2 — a daily-driver Linux laptop, until Apple's SPTM closes the door."
draft: true
---

[← back to blog](..)

# Installing Debian on macOS — yes, possible

_Stub seeded with research — angle, sources, and concept skeleton are ready; prose still needs writing._

## TL;DR

In 2026, "Debian on a Mac" realistically means Asahi-patched Debian on an M1 or M2 — a polished daily-driver Linux with a world-class open GPU stack, no Thunderbolt, mediocre sleep, and zero help if you bought an M3 or M4.

## Why it matters

_(Draft prompt: every "Linux on Mac" search result is either pre-Asahi nostalgia (Boot Camp, rEFInd) or vendor blogposts. The honest 2026 picture is narrower and more interesting: bare-metal aarch64 Linux that beats macOS on dev ergonomics for a small, specific window of hardware.)_

## The core idea — concepts the post must cover

- Why this is exclusively the Asahi story in 2026: Intel Macs are EOL for new macOS; rEFInd/Boot Camp is a museum-piece path; the interesting work is arm64.
- **The Asahi boot model**: m1n1 bootloader, no firmware re-flashing, coexists with macOS, uses Apple's iBoot picker; nothing is "replaced".
- The Asahi installer flow: `curl` one-liner from macOS Terminal, APFS-aware resize, choose a "distro stub" (Fedora Asahi Remix is reference; Debian via Bananas).
- **Distribution landscape**: Fedora Asahi Remix (official), Ubuntu Asahi, Arch Asahi (deprecated), Debian via Bananas Team — and why upstream Debian can't ship it (out-of-tree kernel patches).
- **Chip-by-chip reality**: M1/M2 are daily-driver class; M3 is early-beta with no GPU; M4 is blocked on Apple's new SPTM firmware obfuscation.
- **GPU surprise**: conformant OpenGL 4.6, OpenGL ES 3.2, OpenCL 3.0, Vulkan 1.4 (Honeykrisp) — on M1/M2 the open-source stack is more conformant than Apple's own.
- What still doesn't work: Thunderbolt/USB4 (USB2-only over those ports), DisplayPort-alt-mode on USB-C, hibernation/S2idle quality, iMac speakers, Touch ID, ProMotion VRR (fixed 120 Hz only).
- **Governance change**: marcan stepped down Feb 2025, Alyssa Rosenzweig moved to Intel late 2025; project now run by a 7-person board — pace slowed but alive.
- Debian-specific story: `bananas-archive.debian.net` ships kernel + firmware-extraction tooling; install path is "Fedora installer stub then debootstrap" or use the Bananas installer.
- Realistic verdict framework: great for a Linux desktop on a quiet, long-battery laptop; bad for anyone needing Thunderbolt docks, eGPU, reliable sleep-on-lid, or M3/M4 hardware.

## The angle worth leaning into

Lean into the inversion: **the open-source Apple GPU driver is more OpenGL/Vulkan-conformant than Apple's own macOS driver**, and an M2 Air running Fedora Asahi (or Bananas Debian) is arguably the best small ARM Linux laptop you can buy in 2026 — provided you accept that Apple's post-M2 firmware lockdown (SPTM) is quietly closing that window, and the M4 may be where the Asahi era ends unless Apple blinks.

The dev-experience comparison vs **"macOS + Docker + Rosetta"** is the natural frame:

- Native arm64 toolchain, real cgroups, real KVM, no Docker-VM tax
- At the cost of: no Thunderbolt dock and unreliable lid-close

## Gotchas — misconceptions to call out

- **"Asahi is dead because marcan left."** It isn't — board-led, still upstreaming, 6.19 progress report is recent (Feb 2026).
- **"You have to wipe macOS."** False — Asahi coexists; macOS keeps its recovery partition and is required for firmware.
- **"Debian officially supports M1 Macs."** No — only unofficially via Bananas; mainline Debian arm64 installer won't boot a Mac.
- **"GPU is the weak spot."** On M1/M2 it's now a strong point; the weak spots are Thunderbolt, sleep, and anything M3+.
- **"It's a VM / it uses Rosetta."** No — it's bare-metal aarch64 Linux; macOS is not involved at runtime.

## References

**Primary (Asahi project):**

- [Feature Support Overview](https://asahilinux.org/docs/platform/feature-support/overview/) — canonical "what works per Mac model" matrix.
- [Progress Report: Linux 6.19 (Feb 2026)](https://asahilinux.org/2026/02/progress-report-6-19/) — most recent official progress post.
- [M3 Feature Support](https://asahilinux.org/docs/platform/feature-support/m3/) and [M4 Feature Support](https://asahilinux.org/docs/platform/feature-support/m4/) — per-chip status.
- [Partitioning Cheatsheet](https://asahilinux.org/docs/sw/partitioning-cheatsheet/) — authoritative install-time resize procedure and APFS-snapshot gotchas.
- [Device list](https://asahilinux.org/docs/hw/devices/device-list/) — per-model "supported / WIP / not yet" reference.

**Primary (governance + GPU):**

- Hector Martin, [Resigning as Asahi project lead (Feb 2025)](https://marcan.st/2025/02/resigning-as-asahi-linux-project-lead/) + [Passing the torch](https://asahilinux.org/2025/02/passing-the-torch/) — board context for "is the project alive?"
- [Asahi blog](https://asahilinux.org/blog/) — Honeykrisp Vulkan 1.3 launch and beyond.
- Alyssa Rosenzweig, [Apple GPU drivers in Asahi (part 7)](https://rosenzweig.io/blog/asahi-gpu-part-7.html) — the surprisingly-good GPU story.

**Primary (Debian-specific):**

- [Debian Wiki — InstallingDebianOn/Apple/M1](https://wiki.debian.org/InstallingDebianOn/Apple/M1).
- [bananas-archive.debian.net](https://bananas-archive.debian.net) — the actual unofficial Debian-on-Apple-Silicon repo + installer.

**Secondary:**

- XDA, [Fedora Asahi Remix overview](https://www.xda-developers.com/fedora-asahi-remix-only-linux-distribution/) — why Fedora is the upstream-blessed reference distro.
- Phoronix, [M3 with Asahi continues progress, no ETA (2026)](https://www.phoronix.com/news/Apple-M3-Asahi-Linux-2026) — independent reporting.
- Phoronix, [Microphone working on M2 Pro/Max (Dec 2025)](https://www.phoronix.com/news/Asahi-Linux-December-2025) — concrete late-2025/2026 hardware enablement.

— Pierre
