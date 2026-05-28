---
title: "Accessibility (a11y) — the parts that actually matter"
description: "Six error types cause 96% of real exclusion — fix those with semantic HTML and a CI axe check."
draft: true
---

[← back to blog](..)

# Accessibility (a11y) — the parts that actually matter

_Stub seeded with research — empirical backbone (WebAIM Million) is ready; prose still needs writing._

## TL;DR

Six error types cause most real-world exclusion — fix those with semantic HTML, native form controls, and a CI axe check, and you've beaten 95% of the web.

## Why it matters

_(Draft prompt: a11y discourse tends toward heroic ARIA and 200-item checklists. The data says otherwise — five years of WebAIM Million reports show the same six failures dominate ~96% of detected errors. The 80/20 is empirical, not opinion.)_

## Current state

- **WCAG 2.2** is the operative standard in 2026 (published Oct 2023, updated Dec 2024, now **ISO/IEC 40500:2025**). It'll remain the de facto legal baseline through ~2029–2031.
- **WCAG 3.0** is still a Working Draft (March 2026 revision, 174 outcomes). Candidate Recommendation not anticipated before Q4 2027 — don't chase it.
- **WebAIM Million 2025**: 94.8% of top 1M homepages fail. Same six failures account for ~96% of detected errors year after year:
  1. **Low contrast** — 79.1% of pages
  2. **Missing alt text** — 55.5%
  3. **Empty links**
  4. **Missing document language**
  5. **Missing form labels**
  6. **Bad table markup**
- Tooling has converged: `@axe-core/playwright` for CI gates, `eslint-plugin-jsx-a11y` for build-time lint, Chrome/Firefox DevTools accessibility panels for inspection. **Automation catches ~30–40% of real WCAG violations** — a floor, not a ceiling.
- Web Almanac 2024: median Lighthouse a11y score 84% (up from 83% in 2019). Slow grind, not a wave. Contrast and language tags remain stubborn.

## Angle worth leaning into

**Lead with "accessible by default."** `<button>`, `<label for>`, real headings, sufficient contrast. Frame ARIA as a **patch, not a strategy**.

The WebAIM data does the polemical work for you: the failures are **boring, fixable, and unchanged for five years**. The post can be ruthlessly short — "here are six fixes, run axe in CI, you're done."

## References

- [WCAG 2.2 Overview (W3C/WAI)](https://www.w3.org/WAI/standards-guidelines/wcag/) — canonical spec.
- [W3C WCAG 3 March 2026 Working Draft](https://www.w3.org/WAI/news/2026-03-03/wcag3/) — latest 3.0 draft.
- [WebAIM Million 2025 report](https://webaim.org/projects/million/2025) — empirical backbone.
- Adrian Roselli, [accessibility tag](https://adrianroselli.com/tag/accessibility) — practitioner blog; "Barriers from Links with ARIA" (Jan 2026), "Using CSS to Enforce Accessibility".
- MDN, [Accessibility tree](https://developer.mozilla.org/en-US/docs/Glossary/Accessibility_tree) — underpins "semantic HTML beats ARIA".
- [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing) — official `@axe-core/playwright` integration in CI.
- [Web Almanac 2024 — Accessibility](https://almanac.httparchive.org/en/2024/accessibility) — 17M-domain scan.

— Pierre
