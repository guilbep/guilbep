---
title: "When you should (not) use analytics on your blog (GTM/GA)"
description: "If you can't name the decision a pageview chart will change, don't install analytics."
draft: true
---

[← back to blog](..)

# When you should (not) use analytics on your blog (GTM/GA)

_Stub seeded with research — references and current-state notes ready; prose still needs writing._

## TL;DR

If you can't name the decision a pageview chart will change, don't install analytics — and if you must, Cloudflare or GoAccess get you there with zero cookies and zero JS.

## Why it matters

_(Draft prompt: most personal blogs ship GA4 by reflex, drag in a cookie banner, and never look at the dashboard again. The decision test cuts that whole loop short.)_

## Current state

- **UA is fully dead since mid-2024**; GA4 is the only Google option and its UX is **genuinely worse for casual users** — more clicks for the same reports, data-driven attribution by default makes year-over-year comparisons misleading.
- **Plausible / Umami / Fathom** are the privacy-first cohort: no cookies, no persistent IDs, **no consent banner required in the EU**. Umami self-hosts on cheap infra; Plausible/Fathom are paid SaaS.
- **Cloudflare Web Analytics** is the lazy free pick: no script needed if you're already on Cloudflare, no cookies, no banner, no cost.
- **GoAccess on nginx logs is the zero-JS option** — server logs were the original analytics; a cron + static HTML dashboard gets ~80% of useful signal (pageviews, referrers, top pages, country) without touching the client.
- **The real question for a personal blog**: what decision changes based on the numbers? If "nothing," analytics is **vanity metrics dressed as data**. Independent measurements (e.g. Orbit Media) show GA4 captures **~55% of real traffic** anyway — so even the "data" is wrong.

## Angle worth leaning into

**The decision test**: "What will I do differently if this number goes up vs down?"

For 95% of personal blogs the honest answer is *nothing* — at which point analytics is just a dopamine loop with a privacy cost passed onto readers.

Secondary angle worth a paragraph: **server logs predate analytics and still work.** GoAccess turns them into a dashboard without ever loading a script in a visitor's browser — both the **most ethical** and the **most accurate** option (no ad-blocker drop-off).

## References

- [Plausible — Privacy-focused web analytics](https://plausible.io/privacy-focused-web-analytics) — what "privacy-first" actually means in practice (rotating daily salt, no persistent IDs, EU-hosted).
- [Plausible — GDPR-compliant analytics without consent: legal assessment](https://plausible.io/blog/legal-assessment-gdpr-eprivacy) — most rigorous public write-up on why cookieless analytics sidesteps the consent banner under GDPR/ePrivacy.
- [Umami](https://umami.is/) — open-source, self-hostable, sub-2 KB script, no cookies; runs on a $3 VPS.
- [Fathom Analytics](https://usefathom.com/) — third member of the privacy-first cohort, Canadian-hosted.
- [Cloudflare — Free, privacy-first web analytics](https://blog.cloudflare.com/free-privacy-first-analytics-for-a-better-web/) — free, no client-side state, no consent banner needed.
- [GoAccess](https://goaccess.io/) — reads raw nginx/apache logs, generates a static HTML dashboard, zero JS on the client.
- Piwik PRO, [GA4 problems after UA sunset](https://piwik.pro/blog/google-analytics-4-ga4-problems/) — catalogues the GA4 UX regressions.

— Pierre
