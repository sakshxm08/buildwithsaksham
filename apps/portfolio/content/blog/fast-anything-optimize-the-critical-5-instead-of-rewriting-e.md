---
title: "Fast-Anything: Optimize the Critical 5% Instead of Rewriting Entire Projects in Rust"
description: "Fast‑Anything just landed on GitHub, and it flips the usual “rewrite everything in Rust” mantra on its head. Instead of spending months recompiling a whole"
pubDate: 2026-11-22
category: "Software Development"
readTime: 12
cover: "/blog-covers/fast-anything-optimize-the-critical-5-instead-of-rewriting-e.png"
blocks: {"tldr":["Fast‑Anything profiles an app, picks the hot ~5% of functions and rewrites them to Rust via an AI agent.","It records up to 500 real calls, replays them on the Rust version and only swaps in if results match and it’s faster.","Benchmarks show 20×‑100× speedups for interpreted languages and 2×‑3.4× for compiled ones on an i5‑10500.","The whole process—from profiling to verification—is a single reversible command."],"stats":[{"value":"5%","label":"Hot code fraction identified"},{"value":"116x","label":"Python fuzzy‑dedupe speedup"},{"value":"20x","label":"TypeScript dedupe speedup"},{"value":"3.4x","label":"C Mandelbrot speedup"}],"chart":null,"flow":null}
slides: ["/blog-covers/fast-anything-optimize-the-critical-5-instead-of-rewriting-e-slide-1.png","/blog-covers/fast-anything-optimize-the-critical-5-instead-of-rewriting-e-slide-2.png"]
---

Fast‑Anything just landed on GitHub, and it flips the usual “rewrite everything in Rust” mantra on its head. Instead of spending months recompiling a whole Python, Node, or Ruby service, the tool profiles your app, spots the handful of hot functions that actually dominate runtime, and lets an AI‑powered coding agent port only those snippets to Rust. The process is fully reversible: a single command records real calls, builds a one‑function Rust crate, verifies byte‑for‑byte equivalence (including edge cases like NaN and huge inputs), and swaps the native implementation back in if the performance win holds up.

In this post we’ll walk through how Fast‑Anything identifies the critical 5 % of code, how the verification step guarantees functional parity, and what kind of speedups you can expect—real‑world benchmarks show 20×‑100× faster fuzzy‑deduplication across several languages on an i5‑10500. We’ll also cover the tool’s command‑line workflow, the role of the chosen AI agent (Claude, Codex, etc.), and practical tips for integrating the generated Rust crates into your existing build pipeline.

## What happened

The fast‑anything tool starts by running a lightweight profiler against the target program, whether it’s a Python script, a Node or Ruby service, a Java or Go binary, a PHP page, or a native C/C++ executable. The profiler gathers wall‑clock time for every function and then ranks them by the product of execution time and a portability score, surfacing the tiny fraction of code that actually dominates the runtime—often less than five percent of the total lines.

Once the hot functions are identified, fast‑anything hands them off to an AI coding agent such as Claude or Codex. The agent receives a prompt that includes the original source, the function signature, and a short description of its behavior, and it generates a Rust implementation. The generated crate is compiled locally with the user’s Rust toolchain (rustup), producing a native library that can be linked back into the original program via FFI. A single reversible command then swaps the original implementation with the newly compiled Rust version, leaving a marker that can be removed to roll back instantly.

To make sure the Rust port is safe to enable, fast‑anything records up to 500 real calls to the original function during a warm‑up run. It replays each call against the Rust binary, checking that the returned values match to within a tight tolerance (e.g., floating‑point differences under 1e‑9) and that any errors are reproduced exactly. The tool also synthesizes edge‑case inputs—NaN, infinities, empty strings, and inputs up to sixteen times larger—to probe corner conditions. If any mismatch or a performance regression (the Rust call taking longer than the original) is detected, the port is automatically disabled and the original code is restored.

When all recorded and generated cases pass, fast‑anything enables the Rust implementation, runs an interleaved benchmark of the whole application, and emits a markdown report with timing comparisons and an SVG badge suitable for a pull‑request. The entire workflow—from profiling to verification—can be executed with a single command and is fully reversible, letting developers reap Rust‑level speedups without rewriting an entire codebase.

## Why it matters

Rewriting an entire codebase in Rust isn’t a quick win. A full port can take months, and the Rust toolchain produces minute‑long compile cycles and gigabytes of `target/` artifacts. Even after that effort, most of the runtime stays the same because only a handful of functions typically dominate CPU usage. In practice you end up with a massive build surface and a modest performance gain, while the bulk of the original language’s ecosystem—its libraries, tooling, and developer familiarity—remains untouched.

Fast‑Anything flips that equation by homing in on the hot 5 % of code that actually drives latency. The tool profiles a Python, Node, or Ruby app, ranks functions by execution time, and then uses an LLM‑powered coding agent to generate a one‑function Rust crate for each hotspot. Because the rest of the application stays in its native language, you keep the existing build pipeline, dependency graph, and debugging workflow. The result is an order‑of‑magnitude speedup on the critical path—e.g., a 700‑name fuzzy‑dedupe in Python drops from 4.9 s to 42 ms—while the majority of the codebase remains unchanged, dramatically lowering risk and ongoing maintenance cost.

What sets this approach apart is the reproducible proof‑of‑correctness step. Fast‑Anything records up to 500 real calls to the original function, replays them against the Rust port, and automatically generates edge‑case inputs (NaN, infinities, large payloads, etc.). The port is only enabled when every recorded call matches the original output within a tight tolerance and when the Rust implementation is not slower per call. This eliminates the “it works on my machine” uncertainty that often haunts manual rewrites, giving you a verifiable guarantee before you flip the switch.

## How it works (background)

Fast‑anything starts by treating the target program just like any other profiling run. It launches the supplied command (Python, Node, Ruby, etc.) under a lightweight profiler that records how much wall‑clock time each function consumes. The raw timings are then combined with a *portability score* that estimates how naturally a function can be expressed in Rust – for example, functions that are pure, avoid dynamic language features, or already call into native libraries get a higher score. The tool sorts the list by the product of execution time and portability, so the “critical 5 %” that dominates runtime and is easiest to move ends up at the top.

When you pick a function from that list, fast‑anything switches to a recording phase. It runs the program again, intercepting up to 500 real invocations of the chosen function and dumping the exact arguments and return values to a JSON log. From this log it scaffolds a minimal Rust crate that contains a single `pub fn` matching the original signature, plus a `TASK.md` that describes the porting job for the AI agent (e.g., “rewrite `process_chunk` in Rust, preserving its Python‑level API”).

The AI‑generated Rust code is not trusted blindly. Fast‑anything builds the crate with your local Rust toolchain, then replays every recorded call against the compiled function. It also synthesises edge‑case inputs – NaN, ±∞, –0.0, empty strings, and payloads up to sixteen times larger than the originals – and runs those through the Rust implementation. The verification step checks that numeric results match within 1 e‑9, that errors are reproduced, and that the Rust version is not slower per call than the original. Only when all cases pass does fast‑anything swap the Rust crate into the running program, leaving a reversible one‑line marker that can be disabled at will. This workflow lets us replace just the hot spots with safe, high‑performance Rust while keeping the rest of the codebase untouched.

## The key details and numbers

On a modest i5‑10500 Windows 11 box, fast‑anything turned a Python fuzzy‑dedupe script that processes 700 names from a wall‑clock time of 4.91 seconds down to just 42 ms. That’s a **116×** speedup for a single hot function, and the tool automatically swaps the Rust implementation back out if the FFI call overhead ever makes a call slower than the original Python version.

The same pattern shows up in other languages. A TypeScript version that dedupes 2 000 names fell from **3.11 s** to **155 ms**, a **20×** improvement. The Go implementation, handling 3 000 names, dropped from **3.02 s** to **144 ms**, giving a **21×** gain. These numbers come from the repository’s real‑world benchmark suite, which records the original and Rust‑ported runtimes side‑by‑side on the same hardware.

Even compiled languages benefit. The C Mandelbrot example (eight zoom levels) went from **431 ms** to **127 ms**, a **3.4×** reduction, while the C++ fuzzy‑dedupe benchmark (6 000 names) improved from **3.02 s** to **1.09 s**, a **2.7×** speedup. The gains are smaller than in interpreted languages because the baseline is already fast, but they still demonstrate that targeting the critical 5 % of hot code can shave off a noticeable chunk of execution time.

fast‑anything includes a safety net: after recording real calls, it verifies that the Rust port produces identical results *and* that each call is faster. If the per‑call cost of crossing the FFI boundary outweighs the computational savings, the tool disables the Rust implementation automatically, guaranteeing no regressions. This “enable‑only‑when‑profitable” policy lets you reap the performance wins without risking slower overall runs.

## What it means for developers

You can now get Rust‑level speedups without pulling the whole codebase into a new language. Fast‑Anything works on the language you already use—Python, Node, Ruby, Java, Go, etc.—so your CI pipelines, Docker images and developer tooling stay exactly the same. The only thing that changes is a handful of hot functions that get compiled into a tiny Rust crate and linked back in, leaving the rest of the project untouched and keeping the team’s familiarity intact.

The workflow is deliberately simple: install the tool once (`npm i -g @el4cteo/fast-anything` or `cargo install fast-anything`), then run a single command such as `fast-anything go --agent claude -- python app.py`. That one‑liner profiles the app, identifies the slowest 5 % of calls, asks the selected coding agent to rewrite those functions in Rust, and swaps the compiled crate back in. Because the whole process is driven by a single command, trying it on a branch or a throw‑away fork is cheap, and you can roll back by disabling the generated block or removing the crate—no permanent rewrite required.

What makes the replacement trustworthy is the built‑in correctness validation. Fast‑Anything records up to 500 real calls, replays them against the Rust port, and automatically generates edge‑case inputs (NaN, infinities, empty strings, oversized payloads, etc.). Only when every recorded call and derived case produces identical results—down to floating‑point tolerance of 1e‑9—does the tool enable the Rust path. If the port is slower per call or fails any check, it stays disabled, so you never ship a “faster but broken” version.

In practice this means you can iterate on performance like you would on any other refactor: add the fast‑anything step, run your test suite, see the benchmark report (the tool prints a markdown card with before/after timings), and merge the change once you’re confident the behavior is unchanged. The reversible, validated approach lets you reap multi‑digit speed gains—like the 116× improvement on a Python fuzzy‑dedupe benchmark—while keeping the rest of the project exactly as you wrote it.

## Limits and caveats

Fast‑anything leans on an external AI coding agent to turn the hot Python, Node, or Ruby functions into Rust. That means the quality of the generated crate is only as good as the model you point at and the prompt you feed it. If the model misinterprets the signature or drops a subtle edge case, the port will fail the verification step and never be enabled. In practice you’ll want to experiment with a few agents (Claude, Codex, or your own script) and iterate on the prompt until the recorded calls look clean.

Not every hot function is a good candidate for a Rust port. Functions that rely on language‑specific runtime features—such as Python’s GIL, Node’s event loop, or Ruby’s C‑extension hooks—often require complex state sharing across threads. Fast‑anything scores those low on portability and automatically skips them, leaving the original implementation untouched. Likewise, code that manipulates interpreter‑internal objects or depends on dynamic typing can be hard to express safely in a single‑function Rust crate.

The verification phase records up to 500 real calls. This limit is enough for many typical workloads, but highly nondeterministic code (e.g., heavy use of randomness, external services, or race‑condition‑prone concurrency) may need more than 500 distinct traces to achieve confidence. In those cases you’ll have to supplement the automated replay with manual tests or increase the call budget by running the tool repeatedly on different inputs.

Finally, the tool only swaps in a Rust port when the end‑to‑end cost is a net win. If the Rust compilation time, the FFI bridge, or the overhead of crossing language boundaries outweighs the saved compute time, fast‑anything disables the port (you can also force this with `FAST_ANYTHING_DISABLE=1`). This guard ensures you never regress performance by forcing a Rust layer that is slower than the original implementation.

## Key takeaways

- fast-anything profiles a Python, Node, or Ruby app, ranks functions by runtime and portability, and lets an AI coding agent port only the hottest functions to Rust.  
- The tool records up to 500 real calls, replays them against the Rust port, and enables the swap only when all outputs match within 1e‑9 for floats and error behavior is identical.  
- A single reversible command replaces the original function with the compiled Rust crate, and the change can be disabled at runtime with an environment flag.  
- Benchmarks on an i5‑10500 show speedups ranging from 13× (C# fuzzy dedupe) to 116× (Python fuzzy dedupe) for the optimized functions.  
- fast-anything also generates edge‑case inputs (NaN, infinities, large strings, etc.) and shrunk inputs to ensure the Rust implementation handles corner cases correctly.  
- The process is fully automated: `fast-anything go --agent claude -- python app.py` runs profiling, porting, verification, and benchmarking in one step.

## Sources

- [Fast-Anything: Don't rewrite it in Rust. Rewrite the 5% that's slow](https://github.com/EL4CTEO/fast-anything)
- [GnuPG Security Advisory for GPGME](https://lists.gnupg.org/pipermail/gnupg-announce/2026q4/000517.html)
- [Test the npm Package, Not Just the Monorepo](https://dev.to/gde/test-the-npm-package-not-just-the-monorepo-2j1e)
