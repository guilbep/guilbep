---
title: "Why CSS variables beat SCSS variables"
description: "SCSS vars disappear at build time; CSS vars live in the browser — and theming happens in the browser."
draft: true
---

[← back to blog](..)

# Why CSS variables beat SCSS variables

_Stub seeded with research — references and current-state notes ready; prose still needs writing._

## TL;DR

SCSS variables disappear at build time; CSS variables live in the browser — and theming, dark mode, and component scoping all happen in the browser.

## Why it matters

_(Draft prompt: a lot of stylesheets still ship SCSS variables for design tokens. The 2026 default has moved — Tailwind 4's pivot is the canonical signal. Frame as "Sass for compile-time authoring, CSS vars for everything the user can see change.")_

## Current state

- **Universal browser support**: CSS custom properties are baseline everywhere; IE is gone, `prefers-color-scheme` sits around 97% global reach. The "but support" objection is dead.
- **Tailwind 4's pivot is the canonical signal**: tokens defined in CSS via `@theme` are emitted as `--color-*` custom properties at runtime; the JS `tailwind.config.js` model is no longer the default. The ecosystem has moved.
- **Runtime mutation is the killer feature**: dark mode, accent colour, density, user prefs, CMS-driven themes — SCSS vars are baked at compile time and physically cannot do this without recompiling and shipping new CSS.
- **Cascade + scoping**: custom properties inherit through the DOM, can be redeclared on any selector (`.card`, `[data-theme="dark"]`, `@media`), and read in JS via `getComputedStyle`. SCSS vars are lexically scoped to the `.scss` file and erased at build time.
- **What SCSS still wins at**: `@mixin`, `@function`, `@each`/`@for` loops, real math, module system, colour manipulation (`color.adjust`, `mix`). CSS is catching up (`color-mix()`, relative colour syntax, `@scope`) but isn't fully there.

## Angle worth leaning into

**SCSS vars are `const`, CSS vars are `let` for the browser.**

Lead with the **Tailwind 4 pivot** as the "ecosystem has decided" moment, then land on the nuanced take: they solve different problems — Sass for compile-time authoring ergonomics (loops, mixins, math), CSS vars for everything the user can see change.

## References

- MDN, [Using CSS custom properties (variables)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) — canonical reference; `--var`/`var()`, cascade, scoping, JS interop.
- Chris Coyier, [A Complete Guide to Custom Properties](https://css-tricks.com/a-complete-guide-to-custom-properties/) — exhaustive primer; explicitly contrasts with preprocessor vars.
- CSS-Tricks, [What is the difference between CSS variables and preprocessor variables?](https://css-tricks.com/difference-between-types-of-css-variables/) — short head-to-head.
- Sass docs, [Breaking Change — CSS Variable Syntax](https://sass-lang.com/documentation/breaking-changes/css-vars/) — Sass acknowledging the shift.
- [Tailwind CSS v4.0 release notes](https://tailwindcss.com/blog/tailwindcss-v4) + [Theme variables docs](https://tailwindcss.com/docs/theme) — `@theme`, JS config now optional.
- CodyHouse, [Why we prefer CSS Custom Properties to SASS variables](https://codyhouse.co/blog/post/css-custom-properties-vs-sass-variables) — design-system team explaining the switch.
- CSS { In Real Life }, [Quick and Easy Dark Mode with CSS Custom Properties](https://css-irl.info/quick-and-easy-dark-mode-with-css-custom-properties/) — pairs well with the new `light-dark()` function.

— Pierre
