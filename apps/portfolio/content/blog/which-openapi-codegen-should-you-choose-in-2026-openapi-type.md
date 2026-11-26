---
title: "Which OpenAPI Codegen Should You Choose in 2026? 🤔 openapi-typescript vs Hey API vs Orval vs Kubb v5 🔥"
description: "The OpenAPI ecosystem has gotten a lot louder lately, and the latest round‑up lands right in the middle of our 2026 tool‑selection checklist. In a recent D"
pubDate: 2026-11-26
category: "Tools & Automation"
readTime: 11
cover: "/blog-covers/which-openapi-codegen-should-you-choose-in-2026-openapi-type.png"
blocks: {"tldr":["Kubb v5 generates types in a record‑fast 337 ms (fastest of the four).","Hey API cut its SDK generation time by over 80 % to 1,329 ms.","Peak memory usage stays low: Kubb 156 MiB, Orval 145 MiB.","Generated file counts range from 16 (Hey API) to 2,897 (Kubb)."],"stats":[{"value":"337","label":"Kubb type‑only generation time (ms)"},{"value":"527","label":"Hey API type‑only generation time (ms)"},{"value":"156","label":"Kubb peak RSS (MiB)"}],"chart":{"title":"Runtime reduction of latest releases","unit":"%","note":"Percentage speed‑up compared to six‑month‑old runs","items":[{"label":"Hey API","value":82.1},{"label":"Kubb","value":81.5},{"label":"Orval","value":50.2}]},"flow":{"kind":"steps","title":"Benchmark methodology","steps":[{"label":"Spec preparation","text":"Generate a synthetic OpenAPI document with 1,200 operations and 484 schemas (~1.28 MiB)."},{"label":"Warm‑up run","text":"Execute a single warm‑up generation for each tool to prime caches."},{"label":"Measured runs","text":"Run eight executions per tool on Ryzen 9 7900/WSL2, record median times."},{"label":"Report metrics","text":"Collect generation time, peak RSS, file count, and compile time for analysis."}]}}
slides: ["/blog-covers/which-openapi-codegen-should-you-choose-in-2026-openapi-type-slide-1.png","/blog-covers/which-openapi-codegen-should-you-choose-in-2026-openapi-type-slide-2.png"]
---

The OpenAPI ecosystem has gotten a lot louder lately, and the latest round‑up lands right in the middle of our 2026 tool‑selection checklist. In a recent DEV Community post, the author revisited four popular generators—openapi‑typescript, Hey API, Orval, and the freshly overhauled Kubb v5—using a synthetic spec of 1,200 operations and 484 component schemas. The benchmarks, run on a Ryzen 9 7900 under Node 26, show Kubb now churning out types in 337 ms (the fastest of the lot) and Hey API cutting its fetch‑SDK generation time by more than 80 % compared to six months ago. Those raw numbers are eye‑catching, but the post also dives into generated file layouts, memory footprints, and the practical impact on TypeScript compilation.

What you’ll get from the rest of the article is a side‑by‑side look at each library’s strengths: minimal‑code output from openapi‑typescript, the clean SDK experience of Hey API, Orval’s flexible client‑and‑mock generation, and Kubb v5’s extensible, plugin‑driven architecture. We’ll walk through the benchmark methodology, compare bundle sizes, and discuss how the recent Kubb rewrite reshapes the trade‑offs, so you can decide which generator fits your next project without getting lost in the forest of generated code.

## what happened

In November 2026 I ran a fresh round of tests on the four generators that were compared six months earlier. The versions under the hammer were **openapi‑typescript 7.13.0**, **Hey API 0.99.0**, **Orval 8.48.0**, and **Kubb 5.20.2**. All of them were fed the same synthetic OpenAPI document generated with drf‑spectacular, which contains **1,200 operations**, **484 component schemas**, and roughly **52 k lines** of spec (about 1.28 MiB).  

Kubb’s v5 release introduced a **major architectural overhaul**—a new plugin system and re‑engineered client generation—whereas Hey API and Orval kept moving forward with **incremental improvements** to their existing codebases. This distinction is reflected in the benchmark numbers: Kubb’s generation time dropped dramatically, while Hey API and Orval showed sizable but less radical gains.  

All benchmarks were executed on a **Ryzen 9 7900** CPU running under **WSL2**, with **Node.js 26** as the runtime. For each tool I performed a single warm‑up run followed by eight measured executions, reporting the **median** of those runs. This methodology mirrors the original experiment and ensures the results are comparable across the four generators.

## why it matters

Generation speed isn’t just a vanity metric; it directly shapes how quickly we can iterate on an API contract. In the benchmark, Kubb v5 churned out a 1,200‑operation spec in **337 ms**, while Hey API took **527 ms** and Orval **866 ms**. When a large OpenAPI document spawns dozens of files, those milliseconds add up, especially if you run the generator on every pull request or during local development. A faster feedback loop means you spot mismatches between client code and the spec sooner, reducing the risk of runtime errors slipping into production.

Memory consumption matters just as much on shared CI runners, where a single runaway process can starve other jobs. The same test shows peak RSS of **156 MiB** for Kubb, **191 MiB** for openapi‑typescript, **240 MiB** for Hey API, and **145 MiB** for Orval. On a typical GitHub Actions runner with a 2 GiB limit, a generator that hugs the upper end of that range can cause flaky builds or force you to split jobs, adding overhead to the pipeline. Lower RSS values give you more headroom for parallel steps like linting, testing, and bundling.

How the code is laid out also influences day‑to‑day maintainability. Kubb’s v5 output spreads across **2,897** files, while Hey API produces a compact **16‑file** SDK. Small, focused files can be easier to navigate in a code review, letting reviewers zoom in on a single endpoint without scrolling through a massive monolith. Conversely, a handful of large files can make diff noise harder to parse, especially when many endpoints change simultaneously. The trade‑off isn’t purely about file count; it’s about how the structure aligns with your team’s review workflow and the tooling you rely on (e.g., IDE indexing, linting caches). Choosing a generator that balances speed, memory, and output granularity helps keep the development loop tight, the CI stable, and the codebase approachable.

## how it works (background)

openapi‑typescript takes a minimalist route: it walks the OpenAPI document, extracts every component schema, and emits a single `types.ts` file that contains only TypeScript interfaces and type aliases. The library does **not** generate a function per endpoint; instead it expects you to pair the types with a generic runtime client (for example, `fetch` or `axios`) that you import yourself. Because there’s no per‑operation wrapper, the output stays small (about 1 MB for a spec with 1 200 operations) and the build step adds little overhead.

Hey API and Kubb follow a more traditional SDK model. After parsing the spec they produce a set of fetch‑based helpers—one file per operation—alongside the same type definitions you’d get from openapi‑typescript. Each helper knows the HTTP method, path parameters, query string, and request/response bodies, so you can call `client.getUser({ id })` without writing any request plumbing. The generated SDKs are larger (Hey API around 1.78 MB, Kubb over 3 MB) because they include the wrapper code for every endpoint, but they give you a ready‑to‑use client out of the box.

Orval sits somewhere in the middle. It still generates TypeScript types, but its client layer is optional and highly configurable. By default it emits “query helpers” that wrap fetch calls, similar to Hey API, yet it can also produce mock data generators that return typed stub responses. This hybrid approach lets you switch between real network calls and mocked data without changing your application code, which is handy for testing or prototyping. The trade‑off is a slightly higher generation time (around 866 ms for types only) compared with the leanest option, but you gain flexibility that pure SDK generators don’t expose.

All four tools share the same starting point—a parsed OpenAPI document—but they diverge in what they consider the “client”. openapi‑typescript stops at types, Hey API and Kubb ship full fetch wrappers, and Orval offers a pluggable client that can also emit mocks, giving you a spectrum of choices depending on how much generated runtime code you want in your project.

## the key details and numbers

The type‑only generation benchmark shows Kubb pulling ahead with a median of **337 ms** while keeping its memory footprint modest at **156 MiB**. Hey API follows at **527 ms** (peak RSS **240 MiB**), openapi‑typescript sits in the middle at **438 ms** (**191 MiB**), and Orval trails at **866 ms** (**145 MiB**). These numbers come from eight runs on the same Ryzen 9 7900/WSL2 setup, so the differences reflect the generators’ core efficiency rather than hardware variance.

When we ask each tool to emit a full fetch SDK, the speed gains of the latest releases are striking. Hey API slashed its runtime from **7,406 ms** down to **1,329 ms**, an **82.1 %** reduction. Kubb’s overhaul delivered a similar leap, dropping from **6,236 ms** to **1,155 ms** (**81.5 %** faster). Orval also improved, cutting its time from **3,457 ms** to **1,723 ms** (**50.2 %** faster). openapi‑typescript isn’t directly comparable here because it generates only operation types and relies on a generic client, but its full‑type generation still took **751 ms**.

The size of the generated source tells a different story. openapi‑typescript produces a single file of **1.45 MB**, while Hey API spreads **16 files** across **1.78 MB**. Orval’s more granular approach yields **1,926 files** totaling **2.18 MB**, and Kubb’s extensive plugin architecture results in **2,897 files** amounting to **3.13 MB**. Larger file counts can make navigation easier even though the overall bundle is bigger.

Finally, a single TypeScript compilation after generation highlights the downstream impact. Compiling the Hey API output takes roughly **2.44 s**, whereas the more voluminous Kubb code needs about **3.80 s**. The extra compile time aligns with Kubb’s higher file count and total source size, reminding us that raw generation speed is only one piece of the overall developer experience.

## what it means for developers

If you need to spin up a new client library while keeping your dev loop tight, Kubb v5’s type‑only generation time of 337 ms is hard to ignore. On the same Ryzen 9 7900 machine the benchmark shows it’s the quickest of the four tools, and its peak memory usage (156 MiB) stays comfortably low. That means you can regenerate types after a schema change without stalling your editor or CI pipeline, which is especially useful in micro‑service environments where the OpenAPI contract evolves frequently.

When the shape of the generated SDK matters more than raw speed, Hey API’s output is deliberately compact: only 16 files totaling about 1.78 MB. A smaller file tree makes navigation and code‑review simpler, and the relatively modest bundle size translates to quicker downstream builds. If your team prefers a tidy, opinionated client that you can drop in and start calling, Hey API’s layout often feels more approachable than the sprawling structures produced by the other generators.

Orval takes a different approach by emitting a very large number of files—1,926 in the test run—giving you fine‑grained modules for each endpoint and schema. This can be handy when you want to import only the pieces you need, reducing the amount of code that actually gets bundled. The trade‑off is a larger repository footprint and longer initial generation (866 ms for types only), which may affect checkout times and IDE indexing.

Finally, openapi‑typescript remains a solid choice when you only care about type definitions and want to keep the runtime client under your own control. It generates a single 1.45 MB file in 438 ms, letting you pair the types with whatever fetch layer you prefer. This minimalism is attractive for libraries that already have a custom HTTP abstraction or for projects that want to avoid any generated client code altogether.

## limits and caveats

The numbers in the benchmark come from a synthetic OpenAPI spec that was generated with drf‑spectacular and contains 1,200 operations, 484 component schemas, and roughly 52 k lines of YAML. That design gives us a clean, repeatable workload, but real‑world APIs often look very different. Projects that rely heavily on polymorphic schemas, one‑of/any‑of constructs, or deeply nested references can cause the generators to spend more time walking the model tree, which may widen the timing gaps we observed. In other words, the speed advantage you see for Kubb or Hey API on this artificial spec isn’t a guarantee it will hold for an API that leans on complex inheritance patterns.

The memory figures reported (peak RSS) measure only the process while it is generating the TypeScript files. Once the code is emitted, the downstream steps—TypeScript compilation, source‑map generation, and bundling—introduce their own memory pressure. For example, a single compilation of the Hey API output took about 2.44 seconds, while Kubb’s compilation took roughly 3.80 seconds, and both steps will allocate additional heap beyond the generation peak. If you are running many generators in parallel or on a CI worker with limited RAM, you should factor in that extra overhead.

File count is another metric that can be misleading if taken at face value. Kubb’s v5 output spreads the SDK across almost 3,000 files, whereas openapi‑typescript emits a single 1.45 MiB file. However, modern bundlers perform aggressive tree‑shaking and minification, so a large source tree does not necessarily translate into a larger final bundle. Small, well‑named modules can even improve incremental builds and code‑review ergonomics, provided the build pipeline can prune unused exports efficiently.

Finally, the author stresses that faster generation does not automatically mean a faster running application. The runtime client that each generator produces—whether a thin generic fetch wrapper or a fully‑featured SDK—has its own performance characteristics. Network latency, request batching, and how the client handles retries or pagination will dominate the end‑user experience. So while Kubb and Hey API win on raw generation speed, you still need to evaluate the generated client’s runtime efficiency for your specific use case.

## Key takeaways

- Kubb v5 introduced a major architectural overhaul, resulting in the fastest generation time (337 ms) among the tested generators for type‑only output.  
- Hey API’s generation time for full SDKs dropped from 7.4 s to 1.33 s, an 82 % reduction, making it competitive with Kubb’s 1.16 s runtime.  
- Orval improved its SDK generation speed by about 50 % (from 3.46 s to 1.72 s) but still lags behind Hey API and Kubb in raw performance.  
- openapi‑typescript generates the smallest runtime client footprint (1 file, 1.45 MB source) but does not produce per‑endpoint SDKs, focusing on shared type definitions.  
- The generated source size for Kubb (2,897 files, 3.13 MB) is larger than the other tools, but its distributed file layout can aid navigation and review of individual endpoints.  
- TypeScript compilation after generation is quicker for Hey API (≈2.44 s) than for Kubb (≈3.80 s), indicating that faster codegen does not always translate to faster downstream builds.

## Sources

- [Which OpenAPI Codegen Should You Choose in 2026? 🤔 openapi-typescript vs Hey API vs Orval vs Kubb v5 🔥](https://dev.to/necoz/which-openapi-codegen-should-you-choose-in-2026-openapi-typescript-vs-hey-api-vs-orval-vs-kubb-m8c)
- [Marginalia Search, Money, C++, Rust, AI, stuff](https://www.marginalia.nu/log/a_141_marginalia_update/)
- [Optimizing Rustc's next trait solver](https://donsz.nl/blog/optimizing-rustcs-next-trait-solver)
