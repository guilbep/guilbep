---
title: "Is Neo4j the answer? Let's test it"
description: "When index-free adjacency earns its operational tax — and when it doesn't."
draft: true
---

[← back to blog](..)

# Is Neo4j the answer? Let's test it

_Stub seeded with research — angle, sources, and concept skeleton are ready; prose still needs writing._

## TL;DR

Neo4j earns its operational tax only when your hot path is genuinely path-shaped at 3+ hops on graphs with bounded node degree — otherwise Postgres recursive CTEs or a well-indexed `$graphLookup` will beat it on both latency and ops cost.

## Why it matters

_(Draft prompt: every team with relational data eventually hits a "should we use a graph DB?" debate. The answer depends on workload shape, not data shape. This post supplies a reproducible benchmark and the rubric.)_

## The core idea — concepts the post must cover

- **Index-free adjacency**: O(1) per hop vs O(log n) index/join per hop — the only real architectural argument for Neo4j.
- Variable-length Cypher (`MATCH (a)-[:FOLLOWS*1..4]->(b)`) vs `$graphLookup` (`startWith`, `connectFromField`, `connectToField`, `maxDepth`).
- `$graphLookup`'s 100 MB per-stage memory cap and how `restrictSearchWithMatch` + frontier pruning mitigate it.
- Hop-depth threshold: 1–2 hops favor Mongo/Postgres; 3+ hops on dense graphs favor Neo4j; super-node degree distribution matters more than total size.
- Cypher `PROFILE`/`EXPLAIN` vs Mongo `explain("executionStats")` — must be in any honest benchmark.
- Bulk-loading: Neo4j wins on import time up to ~SF-100, loses at SF-1000 (LDBC).
- Warm vs cold cache, percentile latency (p50/p95/p99), runs >60 s — De Marzi's bar for an honest benchmark.
- Write amplification & locking: Neo4j relationships are first-class records; high-throughput writes need batching.
- Operational cost: Community = single node, GPLv3; Enterprise/AuraDB pricing flips the TCO calculus.
- Data modeling discipline: graph DBs reward you only if relationships are queried as paths, not just lookups.

## The angle worth leaning into

**Neo4j's headline advantage (index-free adjacency) inverts on super-nodes.** A node with 50k relationships forces Neo4j to scan a relationship chain, while an RDF/SPO-indexed store or a Postgres edge table with a covering index on `(src_id, edge_type)` returns the same neighbours in time proportional to the *result set*, not the *degree*.

Combined with the Enterprise-license trap (Community Edition forbids clustering, so the moment you need HA you're either paying Neo4j or relicensing your app under AGPLv3 via Aura's alternatives), the realistic break-even point for "should I adopt Neo4j" is much narrower than the marketing suggests: **deep traversals (3+ hops), low-to-moderate node degree, read-heavy, and a budget for Enterprise**. Miss any one of those and `$graphLookup` or a recursive CTE wins on TCO.

## Gotchas — misconceptions to call out

- **"My data has relationships, so I need a graph DB."** Relations alone aren't enough; you need *traversal queries* against them.
- **"Neo4j is always faster for joins."** False at low depth and on super-nodes; Postgres with proper indexes wins at depth 1–2.
- **"Community Edition is fine for production."** No clustering, no online backup, no RBAC, GPLv3 viral; many teams discover this post-migration.
- **"`$graphLookup` is roughly equivalent to Cypher."** Subject to a hard 100 MB stage cap, ignores `allowDiskUse`, degrades fast past ~3 hops.
- **"Vendor benchmarks reflect production."** Both Neo4j and competitors publish self-serving numbers; only LDBC SNB is neutral.

## References

**Primary (benchmarks & methodology):**

- [LDBC SNB benchmark — Neo4j vs TigerGraph (arXiv 1907.07405)](https://arxiv.org/abs/1907.07405) — independent academic benchmark across SF-1 to SF-1000; Neo4j fails 13/25 BI queries at SF-1000.
- [LDBC SNB Interactive paper (SIGMOD 2015)](https://ldbcouncil.org/docs/papers/ldbc-snb-interactive-sigmod-2015.pdf) — canonical vendor-neutral graph benchmark spec; defines the workload your post should mimic.
- Max De Marzi, [Bullshit graph database performance benchmarks](https://maxdemarzi.com/2023/01/11/bullshit-graph-database-performance-benchmarks/) — ex-Neo4j on how to run an honest benchmark (warm cache, 60s+ runs, percentiles).
- Max De Marzi, [Neo4j is faster than MySQL in performing recursive queries](https://maxdemarzi.com/2017/02/06/neo4j-is-faster-than-mysql-in-performing-recursive-query/) — reproducible friends-of-friends comparison with code.
- Max De Marzi, [Benchmarks and superchargers](https://maxdemarzi.com/2015/10/16/benchmarks-and-superchargers/) — why O(1) hop beats O(log n) as join depth grows.

**Primary (docs):**

- [Neo4j Cypher Manual](https://neo4j.com/docs/cypher-manual/current/) — variable-length patterns `()-[:REL*1..3]-()`, `PROFILE`, planner hints.
- [`$graphLookup`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/graphlookup/) — `maxDepth`, `restrictSearchWithMatch`, 100 MB stage limit.
- [Neo4j Licensing](https://neo4j.com/licensing/) + [community thread on clustering](https://community.neo4j.com/t/about-clustered-neo4j-setup-in-community-edition-is-it-possible/74229) — Community is GPLv3, single-instance only; clustering, online backup, RBAC, hot standby are Enterprise.

**Secondary:**

- Guy Harrison, [Optimising graph lookups in MongoDB](https://medium.com/mongodb-performance-tuning/optimising-graph-lookups-in-mongodb-49483afb55c8) — indexes on `connectToField`, frontier-size effects, when `$graphLookup` blows up.
- Ilya Lisov, [Why I regret migrating to Neo4j](https://medium.com/@ilyalisov/why-i-regret-about-migrating-to-neo4j-9201089ca8e1) — postmortem with real numbers: 23 s default fetch, Spring Data driver pitfalls.
- [HN thread on Neo4j migration regrets](https://news.ycombinator.com/item?id=33916848) — multiple practitioners migrating off Neo4j/OngDB to Postgres with specific scale notes.
- [ArangoDB 2018 benchmark](https://arangodb.com/2018/02/nosql-performance-benchmark-2018-mongodb-postgresql-orientdb-neo4j-arangodb/) — competitor-run (read sceptically), but the methodology table and Postgres numbers are revealing.

— Pierre
