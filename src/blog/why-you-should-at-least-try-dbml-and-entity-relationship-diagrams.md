---
title: "Why you should at least try DBML and entity-relationship diagrams"
description: "DBML for SQL teams, Mermaid for inline-in-docs — versioned, reviewable schemas beat whiteboard photos."
draft: true
---

[← back to blog](..)

# Why you should at least try DBML and entity-relationship diagrams

_Stub seeded with research — references and current-state notes ready; prose still needs writing._

## TL;DR

Plain-text schemas (DBML, Mermaid, PlantUML) make ER diagrams versioned, reviewable, and cheap to keep accurate — try DBML first if you ship SQL, Mermaid first if you ship docs.

## Why it matters

_(Draft prompt: most teams have a "schema diagram" — drawn in Whimsical, three months out of date. Text-first schemas live in the repo, get reviewed in PRs, and can be generated from or compiled to real DDL.)_

## Current state

- **DBML** is actively maintained by Holistics; the GitHub monorepo continued shipping through 2025–2026 (v3.12.x line). Holistics quotes ~2.5M DBML docs created via dbdiagram.io / dbdocs.io.
- **Mermaid `erDiagram`** is the lowest-friction option: renders inline in GitHub markdown with **no toolchain**. Default for READMEs and PR descriptions since 2022.
- **Where each shines**:
  - DBML — shareable, link-able diagrams + clean SQL export.
  - Mermaid — diagrams that live next to docs/code.
  - PlantUML — fuller UML (sequence, class, IE-style ER with crow's-foot).
- **Tooling maturity**: `db2dbml` introspects live Postgres/MySQL/MSSQL/Snowflake. Round-tripping DBML ↔ SQL is solid for greenfield, less so for vendor-specific features.
- **Newer adjacent options**: `prisma-erd-generator` (Mermaid-based), Atlas's Prisma schema visualiser, Drizzle ecosystems with Prisma-to-Drizzle generators. **sqldef** offers a "schema as SQL" declarative migration path on the same "diagram/schema as code" ethos.

## Angle worth leaning into

Frame as **"diagram as code"** generally: the win is the diagram lives in git, gets reviewed in PRs, can be generated from or compiled to the real schema.

Then sharpen the wedge:

- **DBML beats Mermaid for SQL-centric teams** (exports real DDL, hosted sharing, dbdocs).
- **Mermaid beats DBML for inline-in-docs** (no tool to install, GitHub renders it).

Mention sqldef and Prisma/Drizzle generators to position DBML as **one node in a larger "schema-as-text" movement**, not a lone curiosity.

## References

- [DBML home (dbml.dbdiagram.io)](https://dbml.dbdiagram.io/home/) — official docs/landing.
- [holistics/dbml on GitHub](https://github.com/holistics/dbml) — source of truth for the spec + monorepo; Apache 2.0; active through 2026.
- [dbdiagram.io editor](https://dbdiagram.io/) — hosted visual editor most people meet DBML through.
- [DBML CLI docs](https://dbml.dbdiagram.io/cli/) — `dbml2sql`, `sql2dbml`, `db2dbml` (live DB introspection).
- [Mermaid erDiagram (GitHub Blog)](https://github.blog/developer-skills/github/include-diagrams-markdown-files-mermaid/) — native rendering in GitHub markdown since 2022.
- [PlantUML Information Engineering diagrams](https://plantuml.com/ie-diagram) — crow's-foot ER syntax inside `@startuml`.
- [sqldef](https://github.com/sqldef/sqldef) — idempotent schema management from plain SQL DDL.
- [prisma-erd-generator](https://www.npmjs.com/package/prisma-erd-generator) — generates ERDs from a Prisma schema (uses Mermaid under the hood).

— Pierre
