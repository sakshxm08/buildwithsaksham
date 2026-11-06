---
title: "Firenook – Rust‑Powered Firebase Emulators Deliver 40× Faster Writes and 10× Lower RAM"
description: "Firenook just hit 0.2.1, and the numbers are hard to ignore: a single write to Firestore now takes about 5 ms instead of the ≈208 ms you’d see with the off"
pubDate: 2026-11-06
category: "Tools & Automation"
readTime: 11
cover: "/blog-covers/firenook-rust-powered-firebase-emulators-deliver-40-faster-w.png"
---

Firenook just hit 0.2.1, and the numbers are hard to ignore: a single write to Firestore now takes about 5 ms instead of the ≈208 ms you’d see with the official Firebase Local Emulator Suite—a 40× speed‑up. At the same time, the peak RAM footprint drops from roughly 22.5 GiB to just 2.1 GiB, a ten‑fold reduction. The project promises a drop‑in replacement that works with your existing firebase.json, SDKs and ports; you only need to swap one word in your npm script and you’re running the emulators without any Java dependency, with data persisting across restarts.

In this post we’ll walk through how to install and start Firenook, compare its performance and resource usage against the standard suite, and look at the practical implications for local development workflows. You’ll see a live demo of a demo‑shop loading over a million Firestore documents, 64 k users and a few thousand storage objects in under a second, and we’ll discuss where the Rust‑based implementation gains its speed and where you might still need the official tools.

## What happened

Firenook hit npm as a dev‑dependency you can add with a single command:

```bash
npm install --save-dev firenook
```  

Once it’s in your package.json you replace the usual `firebase emulators:start` script with `firenook emulators:start`. The change is literally one word, but under the hood the Rust‑based binaries take over the work that the Java‑based Firebase Local Emulator Suite used to do. Because the package is published to the public npm registry, getting it onto a CI runner or a fresh workstation is as straightforward as any other Node dependency.

The emulators themselves are identical to the ones you already know. Firenook spins up Firestore, Auth, Storage, Functions and Pub/Sub on the same default ports (Firestore 8080, Auth 9099, Storage 9199, Functions 5001, Pub/Sub 8085, Hub 4400) and reads the same `firebase.json` and `.firebaserc` files you’ve been using. Your SDKs continue to point at `FIRESTORE_EMULATOR_HOST`, `FIREBASE_AUTH_EMULATOR_HOST`, etc., without any code changes, and the Firebase CLI still handles deployment and other non‑emulator commands. In short, the surface‑level configuration stays untouched; only the implementation that serves the emulated services is swapped out.

A key practical benefit is that the emulator state lives on disk in a hidden `.firenook/state` directory. When you stop and restart the process, all previously written documents, users and storage objects are re‑loaded automatically. This persistence mirrors the `--import`/`--export` workflow of the official suite but happens by default, so you no longer need to manage separate import folders. Because the Rust binaries are self‑contained, there’s no longer a Java runtime requirement; you can run the full set of emulators on any machine that can execute Node and the compiled Rust code, cutting down on setup friction and resource overhead.

## Why it matters

Running the Firebase suite locally has always been a bit of a pain point. The official emulators sit on a Java runtime, which means you have to keep a JDK installed and allocate a chunk of RAM just to keep them alive. With Firenook you can drop that dependency entirely—just swap a single word in your npm script and the Rust‑based drop‑in takes over. Because the process starts in under a second and stays under 2 GiB of RAM (versus the 22 GiB peak you see with the Java version), you can spin up the full set of emulators on a laptop or inside a CI container without exhausting resources.

That reduction in memory footprint does more than just free up space; it changes where you can run your tests. Previously, a typical CI job might have to skip the Firestore emulator or run it on a dedicated, beefy runner. Now the same job can include the full suite—Firestore, Auth, Storage, Functions, and Pub/Sub—on the same modest executor you already use for unit tests. The lower overhead also means you can run multiple emulator instances in parallel, for example to test multi‑tenant scenarios, without having to provision extra hardware.

Because writes are now about 40× faster (5 ms versus 208 ms per operation) you can afford to exercise the backend more aggressively during development. A quicker feedback loop encourages you to write integration tests that actually hit Firestore, verify security rules, and trigger Cloud Functions, rather than stubbing those calls out. The result is a more realistic local environment that catches bugs early, reducing the chance of surprise failures after you push to production.

## How it works (background)

Firenook rewrites the Firebase Local Emulator Suite in Rust, a compiled systems language that gives you fine‑grained control over memory layout and zero‑cost abstractions. Because Rust compiles to native code without a garbage collector, the emulators can execute the same request‑handling logic that the original JavaScript‑based suite does, but with far fewer allocations and tighter CPU pipelines. The result is the dramatic speedup reported on the project page—writes that take around 5 ms in Firenook versus over 200 ms in the official emulators—while the process footprint stays in the low‑single‑digit gigabytes instead of the tens of gigabytes the Node.js version can consume.

From a developer’s perspective, the transition is almost invisible. Firenook adopts the exact import/export format that the Firebase CLI expects, so any data you have under a directory such as `./data` can be fed straight into the Rust‑based emulators. There’s no need to run a conversion step or to regenerate your fixture files; the same JSON and protobuf blobs that the official suite writes are read by Firenook’s loader and written back on shutdown.

The emulators also expose the same environment variables that the Firebase SDKs already look for—`FIRESTORE_EMULATOR_HOST`, `FIREBASE_AUTH_EMULATOR_HOST`, `FIREBASE_STORAGE_EMULATOR_HOST`, and so on. Because those variables are set to the same ports you would use with the standard suite, your client code (whether it calls `connectFirestoreEmulator` or relies on the automatic detection in the Admin SDK) continues to work without any changes. In practice you only swap the command in your npm script from `firebase emulators:start` to `firenook emulators:start`, keep your `firebase.json` and `.firebaserc` files untouched, and the rest of your stack talks to the Rust implementation exactly as before.

## The key details and numbers

The write latency that the Firebase Local Emulator Suite reported for a typical document write was 208.2 ms. With Firenook the same operation completes in about 5.1 ms, which translates to roughly a 40× speed‑up. Because the emulator runs as a native Rust binary instead of the Java‑based reference implementation, the critical path for each write is dramatically shorter, and the median latency stays in the same ball‑park across repeated runs.

Memory consumption also shrinks dramatically. During a full‑scale demo the original suite peaked at 22.57 GiB of RAM, whereas Firenook’s peak never rose above 2.11 GiB – a reduction of about ten‑fold. The lower footprint comes from Rust’s zero‑cost abstractions and a more compact in‑memory representation of Firestore indexes and Auth user records, which means you can spin up the emulators on a laptop or a modest CI runner without exhausting resources.

Restart time is another area where the Rust rewrite shines. When the emulator is asked to reload persisted state, the classic suite takes roughly 30.8 s. Firenook restores the same data in just 0.59 s, making it practical to iterate quickly during local development or automated testing pipelines. The fast reload is a direct consequence of the binary’s ability to mmap the on‑disk state and avoid the heavyweight JVM start‑up overhead.

The most compelling proof point is the end‑to‑end demo that ships with Firenook 0.2.0. It loads a snapshot containing 1.2 M Firestore documents, 64 k Auth users, and 5.4 k Storage objects, and brings all six emulators online in under a second (≈ 796 ms total). From that point you can run typical shop‑style workloads – creating orders, invoking functions, and handling Pub/Sub events – with the same SDKs and configuration you already use in production, but with dramatically lower latency, memory, and start‑up cost.

## What it means for developers

The speed boost translates directly into a tighter feedback loop when you’re shaping Firestore security rules or tweaking your data schema. A write that used to take around 200 ms now finishes in roughly 5 ms, so a series of rule‑validation tests that previously stalled your terminal can run in a heartbeat. Even the emulator restart time has dropped from half a minute to under a second, meaning you can spin the whole suite up, make a change, and be back to testing without the usual “wait for the emulator to boot” penalty.

Because the Rust‑based implementation keeps its memory usage to about 2 GiB at peak—ten times less than the 22 GiB the official suite can demand—you can comfortably add the full emulator stack to CI jobs that run on modest runners. Jobs that once hit memory limits or required dedicated, expensive machines can now execute on standard cloud CI agents, opening the door to automated rule checks and integration tests on every pull request.

Switching over is essentially a one‑line edit in your npm scripts. The command line interface mirrors firebase‑tools exactly; you only replace `firebase emulators:start` with `firenook emulators:start`. All flags, ports, and import/export paths stay the same, and your existing `firebase.json` and SDK configuration continue to work unchanged. This drop‑in nature means you can try the faster emulator in a branch, compare results, and roll it out without any refactoring of your build pipeline.

In practice, the combination of near‑instant writes, sub‑second restarts, and a tiny RAM footprint lets you iterate on Firestore logic as quickly as you would on a local in‑memory mock, but with the full fidelity of the real emulator. That speeds up development cycles, reduces flaky test noise, and makes it feasible to keep the emulator running as part of every CI run.

## Limits and caveats

Firenook works as a drop‑in replacement for the official Firebase Local Emulator Suite, but it only implements a subset of the full feature set. When you invoke a command that touches a capability not yet covered by the Rust implementation, the tooling automatically falls back to the Java‑based emulators. In practice this means you can keep the same `firebase.json`, SDK calls and port configuration, but you should be aware that any missing service (for example a newer Auth trigger or a Firestore security rule syntax introduced after the last release) will silently be handled by the original emulator, potentially re‑introducing the Java runtime you were trying to avoid.

The project is still in its early days – the current published version is 0.2.1. Because the community around Firenook is small, you’ll find fewer third‑party tutorials, limited issue triage, and a documentation set that focuses mainly on the “get started” flow. If you run into an edge case, you may need to dive into the source code or open a GitHub issue rather than relying on a mature knowledge base. This isn’t a blocker for many use‑cases, but it does raise the bar for troubleshooting compared to the long‑standing Java emulators.

Data persistence is one of the advertised benefits: the on‑disk state lives under `.firenook/state` and survives restarts. However, the format is proprietary to Firenook and is not compatible with the export files produced by the Java emulator suite. If you ever need to migrate a snapshot back to the official tools – for example to share a dataset with a teammate who isn’t using Firenook – you’ll have to export the data through the emulator’s API and re‑import it, rather than swapping the raw files. This extra step can be a source of friction in CI pipelines or when archiving long‑term test data.

## Key takeaways

- Firenook writes are about 40× faster than the official Firebase emulators, measuring roughly 5 ms per write versus ≈208 ms.  
- Peak RAM usage drops from ≈22.6 GiB to ≈2.1 GiB, a reduction of roughly 10×.  
- Restarting the emulator suite with persisted data takes about 0.6 seconds instead of ≈30 seconds.  
- It works as a drop‑in replacement: keep your existing firebase.json, SDK calls and ports, and only change the command word in your script.  
- No Java runtime is required; you install Firenook via npm and it runs on Node.

## Sources

- [Show HN: Firenook – Firebase emulators in Rust: 40× faster writes, 10× less RAM](https://firenook.dev/)
- [Show HN: A decent text-to-image model trained for ~$20K (Apache 2.0 Weights)](https://www.linum.ai/field-notes/pjit-21k)
- [Interactive-Active-AI/NextTransformer: :sunrise: A comprehensive, cutting-edge open-source framework for next-generation Transformers/LLM, w](https://github.com/Interactive-Active-AI/NextTransformer)
