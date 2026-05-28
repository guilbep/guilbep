---
title: "Why you should use VitePress (not VuePress) for documentation"
description: "VuePress is the legacy name; the Vue team itself moved to VitePress for Vue, Vite, Vitest, Pinia, VueUse."
draft: true
---

[← back to blog](..)

# Why you should use VitePress (not VuePress) for documentation

_Stub seeded with research — the post's original premise needs correcting; VuePress lineage now lives in VitePress._

## TL;DR

Recommending VuePress in 2026 means recommending a community-maintained, RC-stuck framework that the Vue team itself replaced with VitePress — pivot the post to VitePress, mention VuePress v2 only where its older plugin ecosystem still matters.

## Why it matters (the headline finding)

The author may not realise how completely the Vue team has moved on:

> **Vue 3, Vite, Vitest, Pinia, and VueUse all run on VitePress, not VuePress.**

If the post is genuinely about the *VuePress lineage*, the right framing is "Why a Vite-powered, Vue-flavoured SSG beats Docusaurus/MkDocs Material" — with VitePress as the actual recommendation.

## Current state

- **VuePress v1** — deprecated.
- **VuePress v2** — community-maintained (the `vuepress/` org, not `vuejs/`), ~30 RCs deep, no new npm releases in ~12 months. Effectively quasi-dormant.
- **VitePress** — Vue core team's blessed successor; "spiritual successor" per their own docs. Powers the entire Vue flagship stack.
- **The 2026 doc-SSG market**: Docusaurus (~3M weekly dl, React, Meta), VitePress (~2M, Vue), Starlight (Astro), Nextra (Next.js). VuePress is rarely on shortlists.
- **MkDocs Material entered maintenance mode in late 2025**; squidfunk is building "Zensical." That shifts Python-stack docs from default to wait-and-see.
- VitePress's built-in offline **MiniSearch** is a real differentiator vs Docusaurus (Algolia) and VuePress (plugin required).

## Angle worth leaning into

Reframe as a 2026 doc-SSG decision matrix:

| Stack          | SSG choice          | Notes                                      |
|----------------|---------------------|--------------------------------------------|
| Vue            | **VitePress**       | Built-in MiniSearch; Vue team's choice.    |
| React          | Docusaurus          | Mature; Algolia search; Meta-backed.       |
| Astro          | Starlight           | Lean; Astro-flavoured.                     |
| Next.js        | Nextra              | If already in Next.js.                     |
| Python         | (wait on Zensical)  | MkDocs Material now in maintenance.        |

## References

- [VitePress — What is VitePress](https://vitepress.dev/guide/what-is-vitepress) — Vue team's own statement that VitePress is the spiritual successor.
- [VuePress v2 site](https://v2.vuepress.vuejs.org/) — confirms community maintenance, Vue 3, RC status.
- [`vuejs/vuepress` on GitHub](https://github.com/vuejs/vuepress) — v1 deprecated, v2 handed off.
- Ben Sinclair, [VuePress 2 vs VitePress](https://world.hey.com/bensinclair/vuepress-2-vs-vitepress-7356e319) — practitioner writeup.
- [Documentation Generator Comparison 2025](https://okidoki.dev/documentation-generator-comparison) — side-by-side features.
- Docsio, [Material for MkDocs: Honest 2026 Review (Maintenance Mode)](https://docsio.co/blog/mkdocs-material) — notes the squidfunk → Zensical pivot.
- codbex, [Migration to VitePress from Jekyll and Material for MkDocs](https://www.codbex.com/technology/2024/12/17/migration-to-vitepress) — concrete migration narrative.

— Pierre
