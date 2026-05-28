---
title: "How to do an interactive rebase"
description: "Rebase is a programmable script — autosquash, rerere, and --exec turn the scary parts into muscle memory."
draft: true
---

[← back to blog](..)

# How to do an interactive rebase

_Stub seeded with research — angle, sources, and concept skeleton are ready; prose still needs writing._

## TL;DR

Interactive rebase is a scripted replay of your commits — the todo file is editable, every step is logged in the reflog, and `--autosquash` + `rerere` turn most of the scary parts into muscle memory.

## Why it matters

_(Draft prompt: most engineers avoid `rebase -i` because "losing commits" feels possible. It isn't — the reflog keeps them for weeks. Once you trust the safety net, the workflow stops being scary and starts being productive.)_

## The core idea — concepts the post must cover

- Mental model: rebase = "replay each commit as a cherry-pick on top of `<onto>`"; the todo file is the script.
- Invocation forms: `git rebase -i <upstream>`, `-i HEAD~N`, `-i --root`, `--onto <newbase> <upstream> <branch>`.
- Per-line verbs: `pick`, `reword`, `edit` (stops mid-rebase for `--amend` / splitting), `squash`, `fixup` (and `fixup -c` to keep the message in editor), `drop`, `exec`, `break`, plus `label`/`reset`/`merge` for `--rebase-merges`.
- Splitting a commit: `edit` → `git reset HEAD^` → stage in pieces → multiple `git commit`s → `git rebase --continue`.
- Autosquash workflow: `git commit --fixup=<sha>` / `--squash=<sha>` / `--fixup=amend:<sha>` then `git rebase -i --autosquash <base>`; set `rebase.autosquash=true` globally.
- Useful flags: `--autostash`, `--update-refs` (stacked branches), `--keep-base`, `--committer-date-is-author-date`, `-x "cmd"` (repeatable).
- Conflict mid-rebase loop: edit → `git add` → `git rebase --continue`; abort with `--abort`; skip a commit with `--skip`; `ORIG_HEAD` always points to pre-rebase tip.
- Recovery: `git reflog` → find `rebase (start)` / `rebase (finish)` / `HEAD@{n}` → `git reset --hard <sha>`; unreachable objects survive ~30–90 days.
- When NOT to rebase: any branch others have pulled; use `revert` instead. If you must force-push your own topic branch, use `--force-with-lease` (or `--force-if-includes`).
- Friction reducers: `git config --global rerere.enabled true`, `rebase.autoStash true`, `rebase.updateRefs true`, `pull.rebase true`; `--rebase-merges` to keep merge topology.

## The angle worth leaning into

Lean into the **"rebase as a programmable script"** angle via `--exec` and `--rebase-merges`. Most engineers never realise the todo file is a tiny DSL — you can:

- Interleave `exec npm test` between every commit to guarantee a bisect-clean history.
- Use `break` to pause without picking an `edit` target.
- Combine `label`/`reset`/`merge` to surgically re-stitch a merge commit.

Bonus depth: pair `rerere.enabled=true` with a long-lived topic branch and a nightly `git rebase --autosquash --exec "make test" origin/main` — conflicts resolve themselves on the second pass, and every commit on the resulting history is green.

## Gotchas — misconceptions to call out

- **"Rebase deletes my commits."** It doesn't — old commits stay in the reflog for weeks; nothing is truly lost until GC.
- **"`squash` and `fixup` are the same."** `fixup` discards the squashed commit's message; `squash` opens the editor to combine them.
- **"I have to manually reorder lines to clean up fixups."** `--autosquash` (plus `commit --fixup=`) does it for you.
- **"Rebasing is unsafe in collaboration."** It's safe on private/topic branches; the rule is about already-shared history, and `--force-with-lease` covers solo topic-branch updates.
- **"Conflicts during rebase mean I have to start over."** `--abort` returns you to `ORIG_HEAD`; `rerere` means you only resolve each conflict once across repeated rebases.

## References

**Primary (git docs):**

- [`git-rebase`](https://git-scm.com/docs/git-rebase) — canonical reference for every todo verb (pick/reword/edit/squash/fixup/drop/exec/break/label/reset/merge), plus `--autosquash`, `--rebase-merges`, `--exec`, `--keep-base`, `--update-refs`.
- [Pro Git Ch. 7.6 — Rewriting History](https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History) — canonical narrative tutorial; structural model.
- [Pro Git Ch. 7.13 — Rerere](https://git-scm.com/book/en/v2/Git-Tools-Rerere) — Scott Chacon on `rerere.enabled=true`, `.git/rr-cache`, replaying resolutions.
- [`git-rerere`](https://git-scm.com/docs/git-rerere) — `rerere forget`, `gc.rerereResolved`, manual recording.
- [kernel.org git-rebase mirror](https://www.kernel.org/pub/software/scm/git/docs/git-rebase.html) — maintainer-authoritative; nuances of `--committer-date-is-author-date` / `--ignore-date`; formal autosquash spec (`squash!`/`fixup!`/`amend!` prefixes).

**Primary (workflow):**

- Kamal Marhubi, [`git rebase --exec`: tests pass at each commit](https://kamalmarhubi.com/blog/2016/03/08/git-rebase-exec-make-sure-your-tests-pass-at-each-commit-and-other-rebase-goodies/) — canonical "bisect-friendly history" post; chained `-x` examples.
- Thoughtbot, [Auto-squashing Git Commits](https://thoughtbot.com/blog/autosquashing-git-commits) — clean walkthrough of `commit --fixup=<sha>` → `rebase -i --autosquash`.
- Andrew Lock, [Smoother rebases with auto-squashing Git commits](https://andrewlock.net/smoother-rebases-with-auto-squashing-git-commits/) — `--autostash` and editor-skip flow (`GIT_SEQUENCE_EDITOR=:`).
- GitButler, [Fixing up Git with Autosquash](https://blog.gitbutler.com/git-autosquash) — modern overview including `fixup -c` / `amend!` (Git 2.32).
- Opensource.com, [Recover from an unsuccessful rebase with git reflog](https://opensource.com/article/23/1/git-reflog) — step-by-step reset-to-`ORIG_HEAD` and reflog entry decoding.

**Secondary:**

- Atlassian, [Merging vs. Rebasing](https://www.atlassian.com/git/tutorials/merging-vs-rebasing) — canonical articulation of "never rebase public history" + `--force-with-lease`.
- [git-rebase 2.28 docs](https://git-scm.com/docs/git-rebase/2.28.0) — `--rebase-merges` (replacement for deprecated `--preserve-merges`); `label`/`reset`/`merge` todo verbs.

— Pierre
