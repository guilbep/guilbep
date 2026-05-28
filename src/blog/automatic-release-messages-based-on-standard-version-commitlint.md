---
title: "Automatic release messages from conventional commits"
description: "standard-version is deprecated — release-please, semantic-release, or changesets are the modern picks."
draft: true
---

[← back to blog](..)

# Automatic release messages from conventional commits

_Stub seeded with research — the original "standard-version" angle is dead; the post should pivot to picking a successor._

## TL;DR

If your post still recommends standard-version, replace it: use **release-please** for GitHub repos, **semantic-release** for hands-off CI publishing, or **changesets** for monorepos.

## Why it matters (the headline finding)

**standard-version was deprecated on 15 May 2022.** Any post written today that endorses it without a correction will date badly on day one. Lead with the deprecation, then frame the piece as "how to choose a successor."

## Current state

- **standard-version** — deprecated; repo archived-in-spirit; npm page shows banner.
- **release-please (Google)** — de facto successor for GitHub. Parses Conventional Commits on the default branch, keeps a Release PR up to date, on merge tags + publishes the GitHub Release + writes `CHANGELOG.md`. Version bump derived from commit prefixes (`fix=patch`, `feat=minor`, `!`/BREAKING CHANGE=major).
- **semantic-release** — same model, skips the human PR gate. Every merge to the release branch can ship a version, publish to npm, post the GitHub Release. Best when commit hygiene is trusted and you want zero-click releases.
- **changesets** — decouples versioning from commit messages. Contributors add a markdown "changeset" file declaring intent (patch/minor/major + summary). A bot opens a "Version Packages" PR aggregating them. **Best monorepo story** (pnpm/Turborepo native).
- **commit-and-tag-version** — community fork of standard-version for teams who want the same CLI UX without the deprecation.
- **commitlint** is orthogonal — it enforces Conventional Commits at commit/PR time, pairs with any of the above; not a release tool itself.

## Angle worth leaning into

The post can frame the choice as a 2×2:

|                  | Human PR gate                | Fully automated      |
|------------------|------------------------------|----------------------|
| **Commit-driven**| release-please               | semantic-release     |
| **Intent-driven**| changesets                   | (rare; not advised)  |

## References

- [standard-version (npm) — deprecation banner](https://www.npmjs.com/package/standard-version).
- [Issue #919 — deprecation + successor discussion](https://github.com/conventional-changelog/standard-version/issues/919).
- [googleapis/release-please](https://github.com/googleapis/release-please) + [release-please-action](https://github.com/googleapis/release-please-action).
- [semantic-release](https://github.com/semantic-release/semantic-release) ([docs](https://semantic-release.gitbook.io/semantic-release/)).
- [changesets/changesets](https://github.com/changesets/changesets).
- [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog) — the underlying generator all three build on.
- [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) — the like-for-like CLI fork.

— Pierre
