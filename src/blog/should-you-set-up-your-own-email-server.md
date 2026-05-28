---
title: "Should you set up your own email server?"
description: "Own your inbound, rent your outbound — full DIY in 2026 is a hobby, not infrastructure."
draft: true
---

[← back to blog](..)

# Should you set up your own email server?

_Stub seeded with research — references and current-state notes ready; prose still needs writing._

## TL;DR

Self-host inbound if you want; pay someone else to handle outbound — full DIY in 2026 is a hobby, not infrastructure.

## Why it matters

_(Draft prompt: every few years a hopeful sysadmin sets up Postfix + SPF + DKIM + DMARC and discovers six months later that Gmail silently routed half their mail to spam. The Fenollosa "I give up" post is the canonical framing.)_

## Current state

- **Outbound is the war, and small IPs are losing it.** Gmail/Outlook silently route or reject mail from low-volume IPs even with flawless SPF + DKIM + DMARC + PTR + TLS-RPT. **Reputation now dominates technical correctness.**
- **Inbound is fine.** Receiving on your own MX is trivial; rspamd / SpamAssassin handle filtering. The trap is reply latency — you don't notice you're being blocked.
- **2024 Google/Yahoo bulk-sender rules** (DMARC, one-click unsubscribe, ARC, <0.3% spam) formalised practice and hardened in **Nov 2025 to permanent rejects**. The 5k/day threshold keeps drifting downward; Microsoft followed in 2025.
- **Smart-host workaround works.** Run Mailcow/Postfix locally, relay outbound through Postmark/SES/Mailgun/Migadu's SMTP. You keep control of storage + inbound filtering, pay $5–20/mo for someone else's IP reputation.
- **Managed BYO-domain hosts** (Fastmail, Migadu, Mxroute, Proton) are the pragmatic default for 95% of people who want `you@yourdomain` without weekend blocklist triage.

## Angle worth leaning into

Use **Fenollosa as the cold open**, then pivot: the real 2026 answer isn't binary. The interesting middle path is **"own your inbound, rent your outbound"** via a smart host — preserves sovereignty over storage/filtering/addresses without the IP-reputation suicide mission.

Optional contrarian beat: **Migadu's $19/yr tier is so close to free** that the romance of self-hosting mail is the only remaining argument for it.

## References

- Carlos Fenollosa, [After self-hosting my email for 23 years I have thrown in the towel](https://cfenollosa.com/blog/after-self-hosting-my-email-for-twenty-three-years-i-have-thrown-in-the-towel-the-oligopoly-has-won.html) — canonical "give up" post (2022). The framing device.
- [HN discussion (2023 rerun, 1500+ comments)](https://news.ycombinator.com/item?id=38796078) — counter-voices from ops still succeeding, plus consensus that new IPs are essentially dead on arrival.
- Drew DeVault, [Mail service provider recommendations](https://drewdevault.com/2020/06/19/Mail-service-provider-recommendations.html) + [Getting on without Google](https://drewdevault.com/2016/11/16/Getting-on-without-Google.html) — DeVault self-hosts but recommends Migadu / mailbox.org for everyone else.
- [Google Sender Guidelines](https://support.google.com/mail/answer/81126) (+ Yahoo joint requirements, Feb/Jun 2024, hardened Nov 2025) — SPF + DKIM + DMARC + ARC + one-click List-Unsubscribe + <0.3% spam rate.
- [Mailcow](https://mailcow.email/) / [Mail-in-a-Box](https://mailinabox.email/) / [Modoboa](https://modoboa.org/) — modern turnkey stacks. Mailcow (Docker) is the de-facto winner.
- [Migadu](https://www.migadu.com/) / [Fastmail](https://www.fastmail.com/) / [Mxroute](https://mxroute.com/) — BYO-domain middle ground.
- [Postmark](https://postmarkapp.com/) / SendGrid / AWS SES — relay/smart-host escape hatches when you still want to run Postfix locally.

— Pierre
