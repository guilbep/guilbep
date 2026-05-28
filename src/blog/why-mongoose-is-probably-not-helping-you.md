---
title: "Why Mongoose is probably not helping you"
description: "Mongoose solves problems most projects don't have, taxes the ones they do, and populate is a stealth N+1."
draft: true
---

[← back to blog](..)

# Why Mongoose is probably not helping you

_Stub seeded with research — angle, sources, and concept skeleton are ready; prose still needs writing._

## TL;DR

Mongoose solves problems most projects don't have, taxes the ones they do, and has been quietly outgrown by the native driver + a schema validator like Zod (or Prisma if you want a real ORM).

## Why it matters

_(Draft prompt: every Node + MongoDB project reaches for Mongoose by reflex. Few engineers ask "what does it actually buy me?" before signing up for ~3× slower writes, silent field drops, populate N+1s, and a defaults-shift-under-you maintenance story.)_

## The core idea — concepts the post must cover

- **The "abstraction tax"**: Mongoose sits on top of the native driver and adds middleware, hydration, per-field getters/setters. Quantify with the Jscrambler benchmark (~3× faster inserts on native).
- Auto-`$set` on `findOneAndUpdate`; difference between `save()` (document middleware) and update queries (query middleware) — same code path, different hook behaviour.
- **`strictQuery` default flipped between v6 and v7** — silent behaviour change to query filters.
- Casting surprises (string → array, ObjectId coercion, Mixed updates) that mask bugs validation should catch.
- **`populate()` is N+1 by design**: one extra query per referenced path; `.lean()` and aggregation `$lookup` as escape hatches.
- Schema vs TypeScript types drift: generics don't actually constrain the schema; types lie at compile time.
- Bundle size and cold-start impact (matters for serverless/edge runtimes).
- Testing pain: mocking Mongoose models requires `mongodb-memory-server` or heavy stubs vs trivial collection mocking with the native driver.
- Virtuals / getters / setters muddy the line between persisted state and computed state — invisible to anyone reading the DB directly.
- **When Mongoose IS the right call**: heavy lifecycle hooks (hashing, denormalised counters), `populate()` graphs you'd otherwise hand-roll, teams already fluent in it.
- **Alternatives**: native driver + Zod (runtime validation + inferred TS types), or Prisma now that MongoDB is GA.

## The angle worth leaning into

The strongest single hook is **populate as a stealth N+1**. Show a five-line Mongoose snippet, then the MongoDB profiler output proving it's N+1 queries, then the same thing rewritten as one aggregation `$lookup` against the native driver. It's visceral, reproducible, and lets you pivot naturally into:

> "And here's everything else you didn't ask for that's still running on every save."

Close with the **Zod + native driver** pattern as the modern default. Name Prisma as the choice for teams who want migrations and a real query builder.

## Gotchas — misconceptions to call out

- **"Mongoose gives you schema validation MongoDB lacks."** MongoDB has had `$jsonSchema` collection validators since 3.6; enforcement at the DB is stronger than at the app.
- **"Without an ODM you get no types."** Zod (or Valibot/ArkType) + the driver's generic `Collection<T>` gives end-to-end inferred types with zero ODM runtime.
- **"Populate is basically a join."** It isn't; it's a client-side fan-out of `_id IN (...)` queries with no query-planner involvement.
- **"Strict mode protects me."** It silently drops unknown fields rather than erroring, so bugs become missing data, not exceptions.
- **"Switching off Mongoose is a giant rewrite."** Most apps can incrementally route hot paths to `db.collection(...)` while leaving Mongoose models in place.

## References

**Primary (benchmarks & postmortems):**

- Jscrambler, [MongoDB Native Driver vs Mongoose: Performance Benchmarks](https://jscrambler.com/blog/mongodb-native-driver-vs-mongoose-performance-benchmarks) — ~3× faster inserts, ~3× faster text search on native.
- Prosopo, [We suffered MongooseJS so you don't have to](https://prosopo.io/blog/mongoose) — team postmortem on removing Mongoose; TS types lying, silent field drops.
- Towards Data Science, [The Drastic Mistake of Using Mongoose To Handle Your Big Data](https://towardsdatascience.com/the-drastic-mistake-of-using-mongoose-to-handle-your-big-data-a3c408e21a4c/) — Mongoose silently rejecting untyped fields; data-loss risk.
- LeanyLabs, [Mongoose vs MongoDB: What Should You Choose](https://leanylabs.com/blog/mongoose-vs-mongodb/) — balanced take; ends with "drop to native driver for hot paths".

**Primary (Mongoose's own docs + issues):**

- Mongoose, [Populate docs](https://mongoosejs.com/docs/populate.html) — primary source confirming populate is one extra query per ref-path.
- Mongoose, [Custom Casting tutorial](https://mongoosejs.com/docs/tutorials/custom-casting.html) — overriding casting is documented; the default is acknowledged-confusing.
- Issue [#12834 — populate memory issues](https://github.com/Automattic/mongoose/issues/12834).
- Issue [#3530 — really slow populate?](https://github.com/Automattic/mongoose/issues/3530) — long-running thread; evidence the perf complaint isn't a strawman.
- Issue [#12666 — `strictQuery` deprecation warning](https://github.com/Automattic/mongoose/issues/12666) — the v6→v7 default flip.
- Issue [#4745 — schema option flag to skip type casting](https://github.com/Automattic/mongoose/issues/4745) — maintainers' own discussion of casting surprises.

**Primary (alternatives):**

- Thor Chen, [TypeScript, Zod, and MongoDB without an ORM](https://zzdjk6.medium.com/typescript-zod-and-mongodb-a-guide-to-orm-free-data-access-layers-f83f39aabdf3) — reference architecture for the "native driver + Zod" alternative.
- Prisma, [MongoDB GA announcement](https://www.prisma.io/blog/mongodb-general-availability-pixnun6mffmu) + [Prisma MongoDB docs](https://www.prisma.io/docs/orm/overview/databases/mongodb).

**Secondary:**

- Bundlephobia, [mongoose](https://bundlephobia.com/package/mongoose) — live bundle weight (Mongoose ships its own BSON, Kareem middleware, MongoDB driver).

— Pierre
