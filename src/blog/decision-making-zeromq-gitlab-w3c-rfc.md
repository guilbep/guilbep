---
title: "Decision-making: ZeroMQ, GitLab, W3C, RFC"
description: "Four ready-made decision primitives from open-source — pick the lightest one your team will actually use."
draft: true
---

[← back to blog](..)

# Decision-making: ZeroMQ, GitLab, W3C, RFC

_Stub seeded with research — references and current-state notes ready; prose still needs writing._

## TL;DR

Open-source governance gives you four ready-made decision primitives — C4, DRI, rough consensus, and the RFC — pick the lightest one your team will actually use.

## Why it matters

_(Draft prompt: most teams reinvent decision-making badly. Four well-tested patterns already exist in open-source land. This post is a guided tour of which to borrow when.)_

## Current state

- **DRI, ADR, and RFC-style docs are mainstream startup hygiene** in 2026. Pragmatic Engineer's survey shows broad adoption across Stripe, Cloudflare, Uber, GitLab.
- **Square's RFC process and Oxide's RFD are the most-copied modern variants**; both add named approvers and a public commit log to the IETF-style template.
- **ADRs (Nygard, 2011)** remain the lightweight default; Spotify's "Y-statements" variant compresses Context-Decision-Consequence into one sentence.
- **"Disagree and commit" (Bezos, 2017)** has been absorbed almost universally; GitLab's twist is the trailing **"...and disagree"** — allowing continued internal challenge after committing.
- **AI-era addition**: teams now write model-selection ADRs and "prompt RFDs" (Oxide, Anthropic-style governance memos) covering eval criteria, fallback models, prompt-change review — treating model choice as an architectural decision.

## Angle worth leaning into

**The real fork is consensus-seeking (W3C, IETF) vs. DRI-with-comment (GitLab, Oxide, Amazon).**

- **Standards bodies** optimise for *legitimacy* across rivals.
- **Product teams** optimise for *speed* with a single accountable owner.

**Most startups think they want consensus and actually want DRI-with-comment.** Naming that out loud collapses 80% of governance overhead.

## References

- [ZeroMQ RFC 42/C4 — Collective Code Construction Contract](https://rfc.zeromq.org/spec/42/) — Pieter Hintjens' formal protocol; the canonical "merge-first, fix-forward" pattern.
- [GitLab Handbook — Making Decisions](https://handbook.gitlab.com/handbook/leadership/making-decisions/) — DRI model + the explicit "disagree, commit, and disagree" idiom.
- [W3C Process Document (2025)](https://www.w3.org/policies/process/) — updated August 2025; formalises consensus, Formal Objections, the new Council appeals path.
- [IETF RFC 7282 — On Consensus and Humming](https://www.rfc-editor.org/rfc/rfc7282) — Pete Resnick on rough consensus: addressing objections, not counting preferences.
- [Amazon Working Backwards — PR/FAQ](https://workingbackwards.com/concepts/working-backwards-pr-faq-process/) + [AWS Two-Pizza Teams](https://aws.amazon.com/executive-insights/content/amazon-two-pizza-team/) — narrative memo + small autonomous unit as the decision substrate.
- Squarespace Engineering, [The Power of "Yes, if"](https://engineering.squarespace.com/blog/2019/the-power-of-yes-if) — iteration on an RFC template with named approvers.
- [Oxide RFD 1 — Requests for Discussion](https://rfd.shared.oxide.computer/rfd/0001) — synthesises Golang/Rust/Joyent/Kubernetes proposal flows into a public-by-default decision log.
- Michael Nygard, [Documenting Architecture Decisions](https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions) + [Fowler bliki — ADR](https://martinfowler.com/bliki/ArchitectureDecisionRecord.html) — the lightweight default.

— Pierre
