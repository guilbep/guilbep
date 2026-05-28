---
title: "How MongoDB indexes really work"
description: "Why your indexed query is slow — and why it's almost always the FETCH, not the IXSCAN."
draft: true
---

[← back to blog](..)

# How MongoDB indexes really work

_Stub seeded with research — angle, sources, and concept skeleton are ready; prose still needs writing._

## TL;DR

A MongoDB index is fast only when the planner can walk its B-tree in the same order your query wants its results — get the field order wrong (or the array shape wrong, or the selectivity wrong) and you've built an expensive write-tax that the optimizer will quietly ignore.

## Why it matters

_(Draft prompt: most "I added an index but the query is still slow" mysteries collapse to one of three things — the planner refused it, the wrong key order forced a SORT, or the FETCH against a non-cached working set dominates. This post names the diagnostic for each.)_

## The core idea — concepts the post must cover

- WiredTiger stores every index as a separate B+-tree; the `_id` index is **non-clustered**, so any IXSCAN that isn't covered triggers a second tree lookup (FETCH).
- The prefix rule: a compound `{a,b,c}` index serves `{a}`, `{a,b}`, `{a,b,c}` queries but not `{b}` alone.
- **ESR ordering** — Equality narrows bounds; Sort fields after Equality avoid in-memory SORT; Range last because range bounds break index sortedness for subsequent keys.
- A covered query requires every queried and returned field to live in the index AND `_id` to be excluded (or included via the index).
- Multikey: at most one array field per compound index; sort on an array field forces a blocking SORT unless strict bound conditions hold.
- Wildcard indexes serve only one field per query and bloat fast on documents with many keys; compound wildcard is limited to one wildcard term.
- Text indexes: one per collection, no sort, binary collation only, no proximity.
- `explain("executionStats")` triage: ratio of `totalKeysExamined` / `nReturned` and `totalDocsExamined` / `nReturned` — both should approach 1.
- Selectivity vs cardinality: low-selectivity leading key (e.g. boolean) wastes the index; ESR implies "most-selective equality first" in practice.
- Write amplification: every secondary index adds a B-tree update per write and competes for the WiredTiger cache (working set).
- Plan cache + multi-planner: MongoDB races plans, caches the winner, replans on cache eviction or perf regression; `hint()` bypasses the cache.
- Index intersection (AND_SORTED / AND_HASH) is rarely chosen — design a compound index instead.

## The angle worth leaning into

**The non-clustered `_id` is the bite most engineers don't see.** Coming from MySQL/InnoDB, developers assume the primary key index *is* the table; in WiredTiger it's a separate B-tree, so every non-covered secondary-index hit is effectively two B-tree walks. This reframes "why is my indexed query slow?" — often the IXSCAN is cheap and it's the FETCH (random `_id` lookup against a working set that doesn't fit in cache) that dominates.

It also explains why covered queries and well-designed projections give such dramatic speedups in MongoDB specifically, and why Mark Callaghan's benchmarks show MongoDB needing more indexes than MySQL to hit the same query latencies. Pair this with the planner's reluctance to use index intersection and the lesson lands: in MongoDB, the right answer is almost always **one carefully ordered compound index per query shape**, not a buffet of single-field indexes.

## Gotchas — misconceptions to call out

- **"MongoDB will combine my two single-field indexes."** It almost never does; the planner penalises intersection and prefers a single compound.
- **"`_id` is clustered."** It isn't (default storage) — IXSCAN on a secondary index still has to hop to the `_id` B-tree to fetch the document.
- **"Compound order doesn't matter as long as all fields are there."** It matters enormously — wrong order means non-prefix queries can't use it and sorts spill to memory.
- **"More indexes = faster."** Each index taxes every write and consumes cache; an unused index is pure overhead.
- **"`hint()` is just a suggestion."** In MongoDB it's a directive (and index filters silently override it).
- **"A multikey compound index lets me index two array fields together."** It doesn't — insert fails the moment both fields are arrays.

## References

**Primary (MongoDB docs):**

- [ESR Guideline](https://www.mongodb.com/docs/manual/tutorial/equality-sort-range-guideline/) — canonical Equality/Sort/Range ordering + the ERS exception when range is highly selective.
- [Compound Indexes](https://www.mongodb.com/docs/manual/core/indexes/index-types/index-compound/) — prefix rule, key ordering, sort direction matching.
- [Multikey Indexes](https://www.mongodb.com/docs/manual/core/indexes/index-types/index-multikey/) — one-array-per-compound-index limit, sharding restriction, coverage rules.
- [Wildcard Index Restrictions](https://www.mongodb.com/docs/manual/core/indexes/index-types/index-wildcard/reference/restrictions/) — one wildcard field used per query, no shard-key use.
- [Text Index Restrictions](https://www.mongodb.com/docs/manual/core/indexes/index-types/index-text/text-index-restrictions/) — one text index per collection, no sort, no collation.
- [Explain Results](https://www.mongodb.com/docs/manual/reference/explain-results/) + [Analyze Query Plan](https://www.mongodb.com/docs/manual/tutorial/analyze-query-plan/) — stage tree (IXSCAN, FETCH, COLLSCAN, SORT), `totalKeysExamined` vs `totalDocsExamined` vs `nReturned`.
- [Query Plans](https://www.mongodb.com/docs/manual/core/query-plans/) — plan cache, multi-planner trial, index filters overriding `hint()`.
- [Partial Indexes](https://www.mongodb.com/docs/manual/core/index-partial/) — filter expression must be subset of query predicate to be used.
- [WiredTiger B-Tree Architecture](https://source.wiredtiger.com/11.0.0/arch-btree.html) — page sizes (32 KB leaf / 4 KB internal), update lists, reconciliation.

**Primary (engineer/benchmarker):**

- Mark Callaghan, [A few possibly true facts about indexes in MongoDB/WiredTiger](http://smalldatum.blogspot.com/2015/04/a-few-possibly-true-facts-about-indexes.html) — PK index is NOT clustered in WiredTiger (FETCH always hits a separate B-tree), prefix compression on index pages.

**Secondary:**

- Alex Bevilacqua, [Optimizing Compound Indexes — the ESR Rule](https://alexbevi.com/blog/2020/05/16/optimizing-mongodb-compound-indexes-the-equality-sort-range-esr-rule/) — worked examples by a MongoDB perf engineer.
- Franck Pachot, [MongoDB Index Intersection vs Postgres Bitmap-and](https://dev.to/franckpachot/mongodb-index-intersection-and-postgresql-bitmap-scan-40a6) — why the planner almost never picks AND_SORTED/AND_HASH.
- Franck Pachot, [hint() forces, it does not suggest](https://dev.to/mongodb/hint-in-mongodb-is-different-that-sql-optimizer-hints-they-force-indexes-4c33) — hints skip the plan cache; index filters override hints.

— Pierre
