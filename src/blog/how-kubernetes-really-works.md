---
title: "How Kubernetes really works"
description: "Control plane, kubelet, and the level-triggered reconciliation that survives its own bugs."
draft: true
---

[← back to blog](..)

# How Kubernetes really works

_Stub seeded with research — angle, sources, and concept skeleton are ready; prose still needs writing._

## TL;DR

Kubernetes is a database (etcd) fronted by an API, surrounded by independent controllers that each watch for a gap between what you asked for and what is, and try to close it — debugging is just asking which controller gave up and why.

## Why it matters

_(Draft prompt: why "I deployed it but the pod isn't running" turns into hours of guessing for engineers who don't know which subsystem owns which step. The mental model below cuts that time to minutes.)_

## The core idea — concepts the post must cover

- API server is the only component that reads/writes etcd; everything else watches the API.
- etcd stores desired + observed state as serialized objects keyed by resource; Raft gives consistency.
- Every object has `spec` (desired) and `status` (observed); controllers close the gap.
- Reconciliation is **level-triggered, not edge-triggered** — controllers re-derive state from current observation, not from events.
- Deployment controller creates/owns a ReplicaSet; ReplicaSet controller creates/owns Pods (ownerReferences + garbage collection).
- Scheduler is a controller that only sets `pod.spec.nodeName`; it doesn't run containers.
- Kubelet watches for Pods bound to its node, calls CRI to start containers, reports status back.
- kube-proxy programs iptables/IPVS rules to implement ClusterIP Services; CoreDNS resolves names.
- Conditions (Ready, PodScheduled, ContainersReady) and Events are the primary debug surface.
- Optimistic concurrency via `resourceVersion` — conflicts are normal and controllers retry.

## The angle worth leaning into

**Level-triggered reconciliation is what makes Kubernetes survive its own bugs.** Because every controller re-derives truth from current observed state on each sync (rather than processing an event queue), you can kill the controller-manager for an hour, restart it, and the cluster converges. This is why "have you tried deleting the pod" works so often — it doesn't fix anything, it just triggers a fresh reconciliation against current state.

Concrete debugging trick most people miss: `kubectl get events --sort-by=.lastTimestamp -A` shows the chronological story of which controller touched the object last and what it complained about, which is almost always more useful than `describe` for stuck-pod forensics. Pair this with reading `.status.conditions[]` directly (`kubectl get pod X -o jsonpath='{.status.conditions}'`) to see which specific gate (PodScheduled vs Initialized vs ContainersReady) is `False` and `reason`/`message` — that single field usually names the responsible subsystem.

## Gotchas — misconceptions to call out

- **"kubectl apply talks to etcd."** No — only the apiserver does. kubectl hits a REST endpoint.
- **"The scheduler runs my pod."** It only assigns a node; kubelet runs it.
- **"Controllers react to events."** They reconcile from a cache populated by watches; missing an event is fine because the next sync re-derives truth from current state.
- **"Deployments manage pods directly."** They manage ReplicaSets, which manage Pods — relevant during rolling updates and rollbacks.
- **"Pod Pending means scheduling failed."** Pending covers image pull, volume mount, scheduling, admission — `kubectl describe` + Events disambiguate.

## References

**Primary (Kubernetes project docs):**

- [Cluster architecture](https://kubernetes.io/docs/concepts/architecture/) — canonical overview of control plane + node components.
- [Controllers](https://kubernetes.io/docs/concepts/architecture/controller/) — the controller pattern, reconciliation loop, level-triggered logic.
- [Components reference](https://kubernetes.io/docs/concepts/overview/components/) — apiserver, etcd, scheduler, kubelet, kube-proxy, CRI.
- [API conventions](https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md) — spec vs status, conditions, resourceVersion, optimistic concurrency. Load-bearing.
- [Scheduling](https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/) — two-phase scheduler (filter/score), how a Pod gets a nodeName.
- [Container Runtime Interface](https://kubernetes.io/docs/concepts/architecture/cri/) — the kubelet ↔ runtime contract.
- [Debug pods](https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/) — official stuck-pod debug paths.

**Primary (contributor talks):**

- Tim Hockin, [_Kubernetes is a Platform for Building Platforms_](https://www.youtube.com/watch?v=zCXiXKMqnuE) (KubeCon keynote) — why the API and controller model exist, design tradeoffs.
- Tim Hockin, _Life of a Packet_ (YouTube) — how kube-proxy/iptables/IPVS actually implement Services.
- Liz Rice, [_A Hacker's Guide to Kubernetes_](https://www.youtube.com/watch?v=8h4FoWK7tIA) — clean mental model of API server as the only thing that talks to etcd.

**Primary (etcd):**

- [Why etcd](https://etcd.io/docs/v3.5/learning/why/) — Raft, watch, strong consistency, MVCC; the consistency story k8s depends on.

**Secondary:**

- Burns / Beda / Hightower, _Kubernetes Up & Running_ (3rd ed., O'Reilly) — chapters on Deployments→RS→Pods and the reconciliation model.

— Pierre
