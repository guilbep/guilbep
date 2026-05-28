---
title: "Storing a graph and writing queries in MongoDB"
description: "Adjacency patterns, $graphLookup, and the depth at which Mongo silently stops being a graph DB."
draft: true
---

[← back to blog](..)

# Storing a graph and writing queries in MongoDB

_Stub seeded with research — angle, sources, and concept skeleton are ready; prose still needs writing._

## TL;DR

If your graph queries are bounded-depth traversals on a workload that already lives in MongoDB, `$graphLookup` plus the right tree-pattern is almost always enough — reach for Neo4j when depth is unbounded, path semantics matter, or traversal cost must be independent of graph size.

## Why it matters

_(Draft prompt: most teams hit graph-shaped data inside an existing Mongo app. The "should we add Neo4j?" question gets answered emotionally rather than empirically. This post supplies the rubric — and the failure mode that tells you the rubric flipped on you.)_

## The core idea — concepts the post must cover

- The five tree-modeling patterns (parent ref, child ref, ancestor array, materialized paths, nested sets) and the read/write tradeoff matrix between them.
- `$graphLookup` semantics: BFS, in-memory frontier, automatic cycle skipping, optional `depthField`.
- Indexing rule: index `connectToField` on the `from` collection; without it, each hop is a collscan.
- The 100 MB per-stage memory cap; `allowDiskUse:true` was historically ignored by `$graphLookup` (verify against target version — newer releases changed spill behavior).
- `maxDepth` and `restrictSearchWithMatch` as the two main pruning levers; the 16 MB BSON cap on per-doc output.
- Edges as embedded arrays vs separate edges collection — embedded loses the index advantage and hits the 16 MB doc cap on supernodes.
- Sharding constraints: pre-5.1 the `from` collection couldn't be sharded; still cannot run sharded `$graphLookup` inside a transaction.
- Materialized paths + left-anchored regex on indexed path string = O(log n) subtree read; the workhorse for read-heavy hierarchies.
- Application-side BFS over indexed edge lookups often beats `$graphLookup` once the frontier or depth gets large.
- Decision axes for "go to Neo4j": traversal depth, query-time variable depth, path/shortest-path semantics, write rate on edges, traversal-cost independence from graph size.

## The angle worth leaning into

The counterintuitive finding from Guy Harrison's benchmarks: **indexing on `connectToField` gives an enormous speedup at depth 1–2 but the advantage vanishes as depth grows**, because at deeper hops the frontier itself becomes the bottleneck, not the per-hop lookup.

Practical consequence: a "shallow but wide" query (friends-of-friends with filter) is the sweet spot where MongoDB legitimately competes with Neo4j. "Deep but narrow" queries (ancestry chains, shortest path) are where MongoDB silently degrades into the unindexed case — often without the developer realising the index stopped mattering. Pair that with `allowDiskUse` being silently ignored and you get the classic production failure mode: works in staging at depth 3, OOMs at depth 5 in prod.

## Gotchas — misconceptions to call out

- **"`$graphLookup` makes Mongo a graph database."** It's a recursive `$lookup`, not index-free adjacency; cost scales with the frontier, not just the result.
- **"`allowDiskUse` will save me."** `$graphLookup` historically ignores it; you hit the 100 MB wall regardless.
- **"Embed the adjacency list inside each node and it'll be fast."** It is — until a supernode busts the 16 MB BSON limit or you need bidirectional traversal.
- **"Materialized paths need full-table scans."** A left-anchored regex on an indexed path string uses the index — but only if it's left-anchored and case-sensitive.
- **"Indexing `connectFromField` matters."** It usually doesn't; the index that matters is on `connectToField` of the `from` collection.

## References

**Primary (MongoDB docs):**

- [`$graphLookup` (aggregation stage)](https://www.mongodb.com/docs/manual/reference/operator/aggregation/graphLookup/) — canonical reference: `connectFromField`, `connectToField`, `maxDepth`, `depthField`, `restrictSearchWithMatch`, memory/sharding caveats.
- [Model Tree Structures](https://www.mongodb.com/docs/manual/applications/data-models-tree-structures/) — index of the five canonical tree patterns.
- [Materialized Paths](https://www.mongodb.com/docs/manual/tutorial/model-tree-structures-with-materialized-paths/) — concrete schema + regex prefix queries.
- [Nested Sets](https://www.mongodb.com/docs/v7.0/tutorial/model-tree-structures-with-nested-sets/) — subtree-read optimisation, with explicit "updates are expensive" warning.

**Primary (issue tracker / mailing list):**

- [SERVER-34064](https://jira.mongodb.org/browse/SERVER-34064) — `$graphLookup` not starting from collection; expression-vs-string field limitations.
- [`$graphLookup` scalability thread](https://groups.google.com/g/mongodb-user/c/e3C_ekNsvLE) — real users hitting the 100 MB ceiling on fan-out.

**Primary (benchmark):**

- Guy Harrison, [Optimising graph lookups in MongoDB](https://medium.com/mongodb-performance-tuning/optimising-graph-lookups-in-mongodb-49483afb55c8) — empirical: index on `connectToField` dominates at shallow depth; advantage degrades as depth grows.

**Secondary:**

- [`$graphLookup` (Connect By / Recursive Query)](https://dev.to/mongodb/graphlookup-connect-by-recursive-query-e7j) — maps SQL `CONNECT BY` mental model onto `$graphLookup`.
- [Building Large-Scale Social Network Graphs with MongoDB](https://finisky.github.io/en/building-large-scale-social-network-graphs-with-mongodb/) — real-world followers/following schema with bucketing for high-degree nodes.
- [Social Networking — MongoDB Applied Design Patterns](https://www.oreilly.com/library/view/mongodb-applied-design/9781449340056/ch08.html) — directed-graph schema, circles/privacy, write-vs-read tradeoffs.
- [PuppyGraph: MongoDB vs Neo4j](https://www.puppygraph.com/blog/mongodb-vs-neo4j) — index-free adjacency vs document lookups; read critically (vendor).
- [Dragonfly: MongoDB vs Neo4j performance FAQ](https://www.dragonflydb.io/faq/mongodb-vs-neo4j-performance) — concise where-each-wins-by-workload summary.

— Pierre
