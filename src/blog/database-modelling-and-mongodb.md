---
title: "Database modelling and MongoDB"
description: "Model queries, not entities — schemaless just means the schema moved into your code."
draft: true
---

[← back to blog](..)

# Database modelling and MongoDB

_Stub seeded with research — angle, sources, and concept skeleton are ready; prose still needs writing._

## TL;DR

In MongoDB, you don't model entities and hope queries are fast — you model queries and let entities fall out; the 12 patterns are named shortcuts for that inversion.

## Why it matters

_(Draft prompt: the "schemaless" sales pitch sets engineers up for failure. The schema doesn't go away — it migrates into application code, where it's harder to enforce, harder to version, and breaks at runtime instead of build time. Modelling explicitly costs an hour up front and saves weeks downstream.)_

## The core idea — concepts the post must cover

- **Workload-first methodology**: enumerate queries, frequencies, and latency targets before drawing a single document shape.
- Embed-vs-reference decision drivers: read-together frequency, unbounded growth, atomicity needs, contention/write amplification.
- The 16 MB BSON limit and — more practically — the working-set-in-RAM limit that bites first.
- Document growth pathologies: unbounded arrays, in-place updates vs. moves, MMAPv1 history vs. WiredTiger today.
- Atomicity model: single-document atomicity is the cheap path; multi-document transactions exist but signal a modelling smell.
- The 12 patterns grouped by intent — performance (Computed, Subset, Approximation), structural (Attribute, Polymorphic, Tree), scale (Bucket, Outlier), evolution (Schema Versioning, Document Versioning, Extended Reference, Pre-Allocation).
- Indexing as a modelling constraint: ESR rule, index intersection limits, covered queries, index footprint vs. working set.
- Schema versioning as a first-class concern — additive evolution beats migrations at scale.
- Anti-patterns: massive arrays, bloated documents, separating data that's read together, unbounded `$lookup` as a relational crutch.
- Denormalisation duplication and the staleness budget — Extended Reference forces an explicit answer.

## The angle worth leaning into

The strongest narrative is **"design from queries backward"** framed through the **Bucket + Outlier pair**:

- **Bucket** shows how naive per-event documents destroy the working set and how grouping by access window restores it.
- **Outlier** shows the discipline of refusing to let the 99th-percentile user dictate the schema for the median one.

Together they make the abstract principle (*design for queries, not entities*) concrete in two pages, and they set up the anti-pattern section (massive arrays, bloated docs) as the symptom of doing the opposite.

A nice secondary thread: treat **Schema Versioning** as the document-world equivalent of database migrations. Close on "your schema is in your code; version it like code."

## Gotchas — misconceptions to call out

- **"Schemaless means no schema."** The schema migrates from DDL to application code, where it's harder to enforce and version.
- **"Always embed" / "always reference."** Both are dogma; the right answer is per access pattern, and often differs across collections in the same app.
- **"MongoDB is just JSON storage."** BSON has types, atomic update operators, and a query engine whose shape dictates indexes.
- **"Normalise first, denormalise later."** The relational reflex; in document modelling you start from the query and denormalise by default.
- **"16 MB is plenty."** True for documents, false for hot working sets and arrays that grow per user action — the limit you hit first is RAM, not BSON.

## References

**Primary (the patterns canon):**

- Daniel Coupal & Ken Alger, [Building With Patterns: A Summary](https://www.mongodb.com/company/blog/building-with-patterns-a-summary) — index of all 12 patterns with a problem/use-case matrix. Best entry point.
- [Daniel Coupal author page](https://www.mongodb.com/blog/authors/daniel-coupal) — hub for every individual pattern post.
- [The Bucket Pattern](https://www.mongodb.com/blog/post/building-with-patterns-the-bucket-pattern) — time-series/IoT bucketing; sets up native time-series collections.
- [The Outlier Pattern](https://www.mongodb.com/blog/post/building-with-patterns-the-outlier-pattern) — the "Kevin Bacon problem": don't model for the 0.1 %.
- [The Subset Pattern](https://www.mongodb.com/blog/post/building-with-patterns-the-subset-pattern) — working-set/RAM-fit reasoning; ties modelling to indexing economics.
- [Schema Design Anti-Patterns](https://www.mongodb.com/developer/products/mongodb/schema-design-anti-pattern-summary/) — Schaefer/Coupal's inverse of the patterns series.

**Primary (courses):**

- [MongoDB University M320: Data Modeling](https://learn.mongodb.com/learn/course/m320-mongodb-data-modeling/) — the Coupal-authored course.
- [M320 community notes (GitHub)](https://github.com/JaimeRC/mongodb-university-courses/tree/master/M320:%20Data%20Modeling) — preserves the "identify workload → relationships → patterns" methodology.

**Primary (Kvalheim):**

- Christian Kvalheim, [The Little MongoDB Schema Design Book](https://leanpub.com/mongodbschemadesign) — pattern catalogue from the original Node driver author: queues, shopping cart, theatre seating, i18n.
- Christian Kvalheim, [Schema Design Principles and Practice (slides)](https://speakerdeck.com/mongodb/schema-design-principles-and-practice) — embed-vs-reference decision tree.

**Secondary:**

- Martin Fowler, [Aggregate-Oriented Database](https://martinfowler.com/bliki/AggregateOrientedDatabase.html) — DDD framing: a document is an aggregate.
- Martin Fowler, [Key Points from NoSQL Distilled](https://martinfowler.com/articles/nosqlKeyPoints.html) — schemaless ≠ schemaless; implicit schema lives in application code.
- [MongoDB Design Reviews: 60× performance improvement](https://dev.to/mongodb/mongodb-design-reviews-how-applying-schema-design-best-practices-resulted-in-a-60x-performance-improvement-56m5) — real before/after case study (Subset + Computed).

— Pierre
