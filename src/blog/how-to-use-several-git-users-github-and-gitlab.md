---
title: "How to use several git users (work/home GitHub & GitLab)"
description: "Let includeIf + IdentitiesOnly stop you pushing a personal commit from a work account."
draft: true
---

[← back to blog](..)

# How to use several git users (work/home GitHub & GitLab)

_Stub seeded with research — angle, sources, and concept skeleton are ready; prose still needs writing._

## TL;DR

Put work repos under `~/work/`, personal under `~/personal/`, then let `includeIf` in `~/.gitconfig` swap your email, signing key, and SSH command automatically — and set `IdentitiesOnly yes` so SSH doesn't betray you by offering the wrong key first.

## Why it matters

_(Draft prompt: the failure mode is silent. A personal commit lands in a work repo with `user.email = pierre@…personal.com` — visible to every reviewer, indexed by GitHub forever. Or the opposite: a work email leaks into an open-source contribution. Manual `git config` per repo is too brittle; automate it.)_

## The core idea — concepts the post must cover

- Directory convention: `~/work/` vs `~/personal/` as the foundation `includeIf` keys off.
- `[includeIf "gitdir:~/work/"] path = ~/.gitconfig-work` — trailing slash, tilde expansion, case sensitivity (`gitdir/i`).
- Per-identity config file: `user.email`, `user.name`, `user.signingKey`, optionally `core.sshCommand`.
- SSH host aliases: `Host github-work` / `HostName github.com` / `IdentityFile ~/.ssh/id_work` / `IdentitiesOnly yes`.
- Rewriting remote URL to use the alias (`git@github-work:org/repo.git`) — UI clones need editing.
- Alternative: `core.sshCommand = "ssh -i ~/.ssh/id_work -o IdentitiesOnly=yes"` per-directory via `includeIf` — no SSH alias needed.
- Commit signing: separate GPG (or SSH) key per identity; `user.signingKey` + `commit.gpgsign = true`.
- HTTPS credential scoping: `credential.useHttpPath = true`, per-URL `[credential "https://github.com/org-work"]` blocks; macOS Keychain caveats.
- Verification ritual: `git config user.email` in repo, `git log --format='%ae %h' -5`, `ssh -T git@github-work`.
- GitLab parity: same pattern, plus per-instance host aliases for self-hosted.
- Safety net: pre-commit hook that aborts if `user.email` matches a forbidden regex for the repo's path.

## The angle worth leaning into

The modern move is to stop juggling files entirely: use 1Password's (or `ssh-agent`'s) SSH agent with `gpg.format = ssh` so the **same hardware-backed key both authenticates the push and signs the commit**, then drive identity selection purely from `includeIf` + `core.sshCommand`.

Bonus gotcha worth a callout: `hasconfig:remote.*.url:git@github.com:acme/**` lets you key the identity off the **remote URL** instead of the directory — useful when you can't enforce a tidy `~/work/` layout (shared machine, tools cloning into `/tmp`, etc.).

## Gotchas — misconceptions to call out

- **"I added two keys to ssh-agent, that's enough."** False — agent offers keys in arbitrary order; GitHub authenticates the first valid one and you push as the wrong user. `IdentitiesOnly yes` is mandatory.
- **"Setting `user.email` globally and overriding per-repo is the same thing."** Works but is manual and error-prone; `includeIf` makes it automatic for every new clone.
- **"The same SSH key can be on both GitHub accounts."** GitHub explicitly rejects this — each public key can belong to only one user account.
- **"GPG signing and SSH auth use the same key."** They're independent; configure `user.signingKey` separately, upload the signing public key to the right account.
- **"`includeIf` matches the current working directory."** It matches the repo's `.git` location (`gitdir`), not `cwd`. Symlinks and `gitdir:` vs `gitdir/i:` (case-insensitive on macOS APFS) trip people up.

## References

**Primary (git docs):**

- [`git-config` — conditional includes](https://git-scm.com/docs/git-config#_conditional_includes) — `gitdir`, `gitdir/i`, `onbranch`, `hasconfig:remote.*.url`.
- [`git-config` — `user.email` / `user.signingKey`](https://git-scm.com/docs/git-config#Documentation/git-config.txt-useremail) — canonical reference.
- [`gitcredentials`](https://git-scm.com/docs/gitcredentials) — credential helper resolution; why `credential.useHttpPath = true` is required to scope per-repo on the same host.

**Primary (SSH + provider docs):**

- [OpenBSD `ssh_config(5)`](https://man.openbsd.org/ssh_config) — `Host`, `HostName`, `IdentityFile`, `IdentitiesOnly`, `Match`. Without `IdentitiesOnly yes`, the agent leaks keys.
- [GitHub: managing deploy keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys#deploy-keys) — why the same key can't be on two GitHub user accounts.
- [GitHub: adding a new SSH key to your account](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account) — per-account key registration.
- [GitLab: use different accounts on a single GitLab instance](https://docs.gitlab.com/ee/user/ssh.html#use-different-accounts-on-a-single-gitlab-instance) — official guidance mirroring the GitHub pattern.
- [`gh auth switch`](https://cli.github.com/manual/gh_auth_switch) — for HTTPS credential-helper flows.

**Primary (modern signing):**

- [1Password — Git commit signing with SSH](https://developer.1password.com/docs/ssh/git-commit-signing/) — SSH agent for auth + signing via `gpg.format = ssh`.
- Caleb Hearth, [Sign Git with SSH](https://calebhearth.com/sign-git-with-ssh) — `gpg.format=ssh`, `user.signingKey`, `allowedSignersFile`.

**Secondary:**

- [Multiple GitHub accounts SSH config (canonical SO thread)](https://stackoverflow.com/questions/3225862/multiple-github-accounts-ssh-config) — host aliases and remote URL rewriting.
- [Tower: Multiple SSH keys for GitHub](https://www.git-tower.com/blog/multiple-ssh-keys-for-github/) — walkthrough with diagrams.

— Pierre
