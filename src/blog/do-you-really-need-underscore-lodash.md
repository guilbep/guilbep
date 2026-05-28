---
title: "Do you really need underscore/lodash?"
description: "The platform ate lodash — keep five functions, drop the dependency."
draft: true
---

[← back to blog](..)

# Do you really need underscore/lodash?

_Stub seeded with research — references and current-state notes ready; prose still needs writing._

## TL;DR

In 2026, the platform ate lodash — keep five functions, drop the dependency (or swap to `es-toolkit/compat` for one import line).

## Why it matters

_(Draft prompt: every Node/browser codebase still has a `lodash` import. Most of what it pulls in now exists natively, ships with ~3× the bytes, and lodash-es tree-shakes worse than developers expect. The argument is no longer "ditch lodash" but "shrink your toolkit to what the platform missed.")_

## Current state

- **Natives now cover the bulk**: `Object.groupBy` / `Map.groupBy`, `Array.prototype.findLast` / `findLastIndex`, `Array.prototype.at`, `structuredClone`, `Object.hasOwn`, `Object.fromEntries`, `Promise.withResolvers`, `String.prototype.replaceAll` — all Baseline in evergreen browsers; `Object.groupBy` cleared Baseline March 2024.
- **ES2025 Iterator Helpers** (`.map/.filter/.take/.drop/.reduce/.toArray`, lazy) shipped in Chrome/Firefox/Safari and Node 22+ — removes the last big "chainable lazy pipeline" reason to reach for lodash.
- **lodash-es tree-shakes poorly in practice**: internal cross-deps drag siblings in unless you use per-path imports or the babel plugin. Full lodash is ~70 KB min+gzip; even cherry-picked imports routinely add 5–15 KB. Per-function, **es-toolkit benches ~2–3× faster and ~96% smaller** (e.g. `sample` 88 B vs 2 KB).
- **Public framework migrations**: Vue core, Storybook, the UnJS stack (Nuxt/Nitro/h3) all actively moving to es-toolkit or natives; React/Remix never shipped lodash as a dep.
- **Where lodash (or es-toolkit) still earns its keep**: correct `debounce` / `throttle` with leading/trailing/maxWait, robust `isEqual` deep equality (Dates, RegExp, typed arrays, cycles), `cloneDeepWith` customisers, `merge` with array semantics, `get`/`set` with safe path access (pending TC39 records & tuples).

## Angle worth leaning into

Lead with **"the five things lodash still does that JS doesn't"**: `debounce`, `throttle`, `isEqual`, `cloneDeepWith`, `merge`. Then show how `es-toolkit` delivers those at ~3% of the bytes — reframing the post from "ditch lodash" to **"shrink your toolkit to what the platform missed."**

## References

- [You-Dont-Need-Lodash-Underscore](https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore) — canonical cheat sheet mapping every lodash method to its native equivalent; ships an ESLint plugin to enforce migration.
- [youmightnotneed.com/lodash](https://youmightnotneed.com/lodash) — side-by-side lodash vs vanilla snippets; the lighter quick-reference.
- MDN, [`Object.groupBy()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy) — Baseline since March 2024; kills lodash `_.groupBy` for evergreen targets.
- TC39, [proposal-iterator-helpers](https://github.com/tc39/proposal-iterator-helpers) — Stage 4, in ES2025, Baseline March 2025.
- LogRocket, [es-toolkit — a lodash alternative](https://blog.logrocket.com/es-toolkit-lodash-alternative/) — documents the 97%-smaller-per-function claim and the `es-toolkit/compat` drop-in path.
- Vue core, [issue #13646: replace lodash with es-toolkit/compat](https://github.com/vuejs/core/issues/13646) — concrete framework-level migration.
- Storybook, [issue #28611: tracking lodash replacement](https://github.com/storybookjs/storybook/issues/28611) — another major OSS project ripping lodash out.

— Pierre
