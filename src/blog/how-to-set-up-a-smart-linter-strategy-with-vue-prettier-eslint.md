---
title: "How to set up a smart linter strategy with Vue (Prettier / ESLint)"
description: "ESLint 9 flat config + eslint-plugin-vue + Prettier — and stop running Prettier inside ESLint."
draft: true
---

[← back to blog](..)

# How to set up a smart linter strategy with Vue (Prettier / ESLint)

_Stub seeded with research — references and current-state notes ready; prose still needs writing._

## TL;DR

In 2026, the pragmatic Vue stack is still **ESLint 9 (flat) + eslint-plugin-vue** with **Prettier** doing formatting separately — Biome and Oxlint are great for `.ts`/`.js`, but neither yet covers Vue templates.

## Why it matters

_(Draft prompt: every Vue project hits the lint stack debate. Most write-ups are stale (pre-flat-config) or vendor-coloured. The 2026 honest picture: ESLint 9 won the migration, Biome/Oxlint compete on script-blocks only, and `eslint-plugin-prettier` is a legacy footgun.)_

## Current state

- **ESLint 9 flat config is the default**. `eslint-plugin-vue` ships `flat/*` presets, pairs with `@vue/eslint-config-typescript`. Legacy `.eslintrc` setups actively discouraged.
- **`@antfu/eslint-config`** remains the de-facto "batteries-included, Prettier-free" choice in the Vue ecosystem (ESLint stylistic rules + dprint for non-JS blocks).
- **create-vue** still scaffolds the conservative path: ESLint + optional Prettier via `@vue/eslint-config-prettier` — Prettier formats, ESLint lints, no `eslint-plugin-prettier`.
- **Biome (2.x)** is fast and increasingly default for React/TS, but `.vue` template linting/formatting is still experimental — script-block only, can't yet replace `eslint-plugin-vue`.
- **Oxlint (oxc)** lints `<script>` blocks and is 10–50× faster than ESLint, but template rules and full `eslint-plugin-vue` parity are out of scope until the embedded-framework RFC lands. Common pattern: Oxlint-first, ESLint for Vue-specific rules.

## Angle worth leaning into

**Stop running Prettier inside ESLint.** `eslint-plugin-prettier` is the legacy footgun. The modern split is:

- **ESLint** for correctness
- **Prettier** (or **dprint** via antfu) for formatting
- **Oxlint** as an optional pre-ESLint fast pass

The Biome-vs-rest debate is mostly moot for Vue users until template support ships.

## References

- [eslint-plugin-vue User Guide](https://eslint.vuejs.org/user-guide/) — official plugin; `flat/recommended`, `flat/essential`, ESLint 9 flat-config usage.
- [`@antfu/eslint-config`](https://github.com/antfu/eslint-config) — Anthony Fu's opinionated Prettier-free flat config; first-class Vue SFC support.
- [Discussion #799 — formatting `<style>` without Prettier](https://github.com/antfu/eslint-config/discussions/799) — concrete recipe for Vue/Svelte/Astro style-block formatting.
- [`@vue/eslint-config-prettier`](https://github.com/vuejs/eslint-config-prettier) — canonical "let Prettier format, let ESLint lint" wiring used by create-vue.
- [Biome vs ESLint vs Oxlint 2026](https://www.pkgpulse.com/guides/biome-vs-eslint-vs-oxlint-2026) — side-by-side comparison; the Vue-template gap on both Biome and Oxlint.
- [Oxlint: better Vue support (issue #15761)](https://github.com/oxc-project/oxc/issues/15761) + [RFC: Embedded Framework Support for Oxlint](https://github.com/oxc-project/oxc/discussions/21936) — current state and roadmap.
- [Tales from the Void: March 2026 Recap (VoidZero)](https://voidzero.dev/posts/whats-new-mar-2026) — oxfmt's improved Vue SFC formatting signal.

— Pierre
