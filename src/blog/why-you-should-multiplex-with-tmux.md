---
title: "Why you should multiplex with tmux"
description: "tmux's real value isn't split panes — it's a session that outlives your laptop lid."
draft: true
---

[← back to blog](..)

# Why you should multiplex with tmux

_Stub seeded with research — angle (persistence over panes) is ready; prose still needs writing._

## TL;DR

tmux's real value isn't split panes — it's a session that outlives your laptop lid, your Wi-Fi, and your SSH client.

## Why it matters

_(Draft prompt: the "tmux for split panes" sales pitch is the weak pitch — modern terminal emulators and Zellij do panes better. The compounding habit is persistent sessions on remote hosts. Lead there.)_

## Current state

- **tmux is alive** — Nicholas Marriott actively maintains it via OpenBSD; the GitHub portable tree auto-syncs. Slow, conservative evolution; not abandonware.
- **Zellij** is the credible modern challenger — Rust, batteries-included defaults, WASM plugin sandbox, floating/pinned panes (0.42). Trade-off: heavier footprint, less ubiquitous on random servers.
- **WezTerm** folds the multiplexer into the terminal emulator itself (GPU + Lua config + SSH multiplexing domains). Local-first; most users still run tmux inside their SSH targets.
- **TPM ecosystem** is stable but quiet — resurrect/continuum, vim-tmux-navigator, tmux-yank, catppuccin/dracula themes remain the standard stack; minimal churn since 2024.
- **mosh + tmux** is still the canonical recipe for flaky links / mobile / SSH-from-anywhere — now resurfacing in "agentic coding from a phone" posts.

## Angle worth leaning into

**Lead with persistence, not panes.** Pane/window UX is what Zellij and WezTerm now do better out of the box. What keeps tmux unbeatable is being a **~200 KB binary already installed on every server you'll ever SSH into**, hosting a session that survives disconnects.

Optional secondary angle: frame Zellij as "tmux for people who refuse to read a man page" — honest about why a beginner in 2026 might skip tmux entirely, while explaining why you (the author) still don't.

## References

- [tmux GitHub wiki](https://github.com/tmux/tmux/wiki) — canonical reference; FAQ edited by Nicholas Marriott in April 2026, confirming active maintenance.
- Brian P. Hogan, [tmux 2: Productive Mouse-Free Development](https://pragprog.com/titles/bhtmux2/tmux-2/) (Pragmatic, 2016) — still the standard book-length intro.
- [tmux-plugins/tpm](https://github.com/tmux-plugins/tpm), [tmux-resurrect](https://github.com/tmux-plugins/tmux-resurrect), [tmux-continuum](https://github.com/tmux-plugins/tmux-continuum) — de facto plugin stack; resurrect snapshots sessions, continuum auto-saves/restores.
- [Zellij vs tmux decision guide](https://tmuxai.dev/tmux-vs-zellij/) and [Zellij vs tmux (FOSSLinux, 2026)](https://www.fosslinux.com/156189/zellij-vs-tmux-the-modern-terminal-multiplexer-for-linux.htm) — balanced 2026 comparisons.
- [WezTerm Multiplexing docs](https://wezterm.org/multiplexing.html) — built-in mux + SSH multiplexing domains.
- [mosh + tmux: Uninterrupted Remote Sessions](https://hoop.dev/blog/mosh-and-tmux-uninterrupted-remote-terminal-sessions) and Rajiv Prabhakar, [SSH Considered Harmful](https://software.rajivprab.com/2019/07/14/ssh-considered-harmful/) — the canonical "agentic coding from anywhere" stack.

— Pierre
