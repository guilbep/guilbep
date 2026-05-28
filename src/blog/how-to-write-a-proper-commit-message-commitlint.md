---
title: "How to write a proper commit message (commitlint)"
description: "Conventional Commits is the contract; commitlint is the compiler; husky/lefthook is the trigger."
draft: true
---

[← back to blog](..)

# How to write a proper commit message (commitlint)

_Stub seeded with research — references and current-state notes ready; prose still needs writing._

## TL;DR

Conventional Commits is the contract, commitlint is the compiler, husky/lefthook is the build trigger — pick one, enforce in CI, stop arguing in PR review.

## Why it matters

_(Draft prompt: PR review arguments about commit-message style consume real time and never converge by taste. A linter + a one-line PR title rule eliminates the conversation entirely and makes downstream automation — changelogs, release tooling — possible.)_

## Current state (things 2024+ tutorials get wrong)

- **Husky v9 dropped `husky install` / `husky add`.** Setup is now `npx husky init` + a one-line shell hook. Older tutorials are stale.
- **Lefthook** (Evil Martians, ~1M weekly downloads) is the credible challenger — parallel hooks, no Node dependency. **simple-git-hooks** fills the "I just want one file" niche.
- **GitHub merge queues + squash-merge changed where validation matters.** PR title linting (via `action-semantic-pull-request`) is now as important as local hooks, because the squash commit replaces branch history.
- commitlint ships first-class CI support: `commitlint --last --verbose` for merge_group events, `--from/--to` for PR ranges. `commitlint/commitlint-github-action` is the standard.
- **AI commit messages** (JetBrains / Cursor / Copilot) drift into prose that breaks changelog tooling (release-please, semantic-release, changesets) without commitlint guardrails.

## Angle worth leaning into

**The "PR title is the commit" pattern.** With squash-merge + branch protection requiring a Conventional PR title, you get clean `main` history without asking contributors to learn anything. Pair with `commitlint --last` in the merge_group job as the safety net.

Worth contrasting with the purist "every commit must conform" stance — most teams don't need it, and forcing it punishes WIP commits during review.

## References

- [Conventional Commits 1.0.0 spec](https://www.conventionalcommits.org/en/v1.0.0/) — canonical spec; types, BREAKING CHANGE footer, parsing rules.
- [commitlint — local setup](https://commitlint.js.org/guides/local-setup.html) — official install/config with husky v9.
- [`@commitlint/config-conventional`](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional) — default ruleset implementing the spec.
- [Husky v9 docs](https://typicode.github.io/husky/) — new `husky init` flow.
- Chris Beams, [How to Write a Git Commit Message](https://cbea.ms/git-commit/) — the seven rules (50/72, imperative mood, subject/body separation). Canonical style essay.
- [Angular Commit Message Format](https://github.com/angular/angular/blob/main/contributing-docs/commit-message-guidelines.md) — origin of the `type(scope): subject` shape.
- [Lefthook](https://github.com/evilmartians/lefthook) — Go-based polyglot alternative to husky; parallel hooks, single `lefthook.yml`.

— Pierre
