---
title: "How to host your own page on a Raspberry Pi"
description: "Pi 4 + SSD + Caddy + Cloudflare Tunnel — zero router config, free HTTPS, ~hour to ship."
draft: true
---

[← back to blog](..)

# How to host your own page on a Raspberry Pi

_Stub seeded with research — references and current-state notes ready; prose still needs writing._

## TL;DR

Pi 4 + SSD + Caddy + Cloudflare Tunnel gets you a free, HTTPS-secured personal site in about an hour with **zero router config**.

## Why it matters

_(Draft prompt: most "host on a Pi" guides are five years old, recommend nginx + certbot + port forwarding + DDNS — all of which Cloudflare Tunnel + Caddy makes unnecessary. The 2026 setup is dramatically simpler.)_

## Current state

- **Pi 5 is ~2–3× faster than Pi 4 but idles at ~500 mA vs ~275 mA**. For a static blog the Pi 4 (or Pi Zero 2 W) is the saner pick; Pi 5 earns its keep if you also run Docker, databases, or media.
- **Cloudflare Tunnel is the default modern path**: `cloudflared` daemon dials out, no inbound ports, no public IP, no DDNS, free tier covers personal sites, DDoS protection + edge caching for free.
- **Caddy is the easy default** — auto-HTTPS via Let's Encrypt, ~3-line Caddyfile for static or reverse proxy; nginx only wins for heavy traffic or exotic modules. **Behind Cloudflare Tunnel you can even skip TLS on the Pi.**
- **Electricity math**: always-on Pi 4 draws ~3–5 W → ~$5–10/year in the US/EU; a $5/mo Hetzner/OVH VPS is ~$60/year. The Pi wins on cost only after year two and only if you ignore your time.
- **SD-card corruption from sudden power loss is the #1 cause of dead Pi servers.** The 2026 default: Pi 5 + NVMe HAT (or Pi 4 + USB-SSD), plus a small UPS or `cron rsync`/Restic backup to a NAS or B2.

## Angle worth leaning into

Lead with **"Cloudflare Tunnel + Caddy removes ~90% of the historical pain"** (no port forwarding, no DDNS, no manual certs).

Then be honest in a closing section: **for a pure static blog, a $5 VPS or even free Cloudflare Pages / GitHub Pages beats a Pi on uptime, bandwidth, and your weekend.** The Pi wins when **hosting is the hobby, not the goal.**

## References

- [Raspberry Pi OS documentation](https://www.raspberrypi.com/documentation/) — official setup, Imager, SSH headless, NVMe/USB boot config.
- RaspberryTips, [Self-host a website safely with Raspberry Pi & Cloudflare Tunnel](https://raspberrytips.com/cloudflare-selfhosted-website/) — end-to-end 2026 walkthrough.
- [Cloudflare Zero Trust / Tunnel docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) — authoritative `cloudflared` install + named tunnel + DNS route.
- [Caddy — Automatic HTTPS](https://caddyserver.com/docs/automatic-https) — why a 3-line Caddyfile beats nginx+certbot for a static site.
- [Let's Encrypt — How it works](https://letsencrypt.org/how-it-works/) — background on the cert lifecycle Caddy automates.
- [DuckDNS](https://www.duckdns.org/) — free dynamic DNS for the port-forward path when you don't want Cloudflare in front.
- Jeff Geerling, [Hosting this website on a farm, or anywhere](https://www.jeffgeerling.com/blog/2022/hosting-website-on-farm-or-anywhere/) — real-world Pi-cluster hosting with honest tradeoffs.
- LinuxBlog, [Raspberry Pi Reliability Has a Storage Problem](https://linuxblog.io/raspberry-pi-storage-reliability/) — SD-card corruption case for moving to NVMe/SSD.

— Pierre
