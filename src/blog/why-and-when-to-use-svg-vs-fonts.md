---
title: "Why and when to use SVG vs fonts"
description: "Inline SVG won the war; Material Symbols variable font is the only icon font that earned its way back."
draft: true
---

[← back to blog](..)

# Why and when to use SVG vs fonts

_Stub seeded with research — references and current-state notes ready; prose still needs writing._

## TL;DR

Use inline SVG by default, an SVG sprite with `<use>` for large sets on MPAs, and reach for Material Symbols variable font only when you need hundreds of tunable icons in one cached file — avoid classic icon fonts for accessibility reasons.

## Why it matters

_(Draft prompt: the 2015-era "SVG vs icon fonts" debate looks settled, but Material Symbols brought variable-font icons back into the picture. The 2026 answer isn't one technique — it's three, picked by use case.)_

## Current state

- **Inline SVG is the 2026 default** for UI icons: `currentColor` inheritance, per-path styling/animation, no extra request, full a11y via `<title>` / `aria-label` / `role="img"`.
- **Material Symbols (variable font) is the legitimate comeback** — one font file, three styles plus four axes (FILL, wght, GRAD, opsz); great when you ship hundreds of icons and want runtime weight/fill animation without a build step.
- **Classic icon-font a11y is still the blocker** (Font Awesome, legacy Material Icons): glyphs in the Private Use Area can be announced as random characters by some screen readers; ligature-based fonts break when the font fails to load (raw text leaks).
- **SVG sprite + `<use href="sprite.svg#id">`** is the caching sweet spot for large icon sets in classic multi-page apps; inline SVG (often via a component) wins in component frameworks where the bundler dedupes and tree-shakes.
- **Performance trade-off has flipped**: HTTP/2-3 makes "fewer requests" a weak argument; render cost and CLS from late-loading icon fonts now matter more than payload count.

## Angle worth leaning into

**Inline SVG won the war, but Material Symbols is the only icon font that earned its way back.** Frame the post around accessibility ruling out generic icon fonts, with variable-font Material Symbols as the narrow exception.

## References

- Chris Coyier, [Inline SVG vs Icon Fonts](https://css-tricks.com/icon-fonts-vs-svg/) (CSS-Tricks) — canonical comparison.
- Tyler Sticka, [Bulletproof Accessible Icon Buttons](https://cloudfour.com/thinks/bulletproof-accessible-icon-buttons/) (Cloud Four) — `aria-label` + `aria-hidden` pattern.
- Florian Geierstanger, [Icon Fonts are a Pain in the A11y](https://florian-geierstanger.de/blog/icon-fonts-pain-in-the-a11y/) — documents screen readers reading icon-font glyphs as garbled text.
- [Material Symbols (Google Fonts)](https://fonts.google.com/icons) + [docs](https://developers.google.com/fonts/docs/material_symbols) — variable-font icons with axes.
- web.dev, [Optimize WebFont loading and rendering](https://web.dev/articles/optimize-webfont-loading) — FOIT/FOUT, CLS implications.
- Jake Archibald, [SVGOMG](https://jakearchibald.github.io/svgomg/) — SVGO frontend for shipping smaller inline/sprite SVGs.
- MDN, [`<use>` and SVG sprites](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use) — external-sprite caching pattern.

— Pierre
