---
title: "The Hidden AI Cost of JavaScript Frameworks"
description: "When we start talking about “agent‑powered” development, the conversation often skips over a hidden expense: the AI cost of the JavaScript framework we cho"
pubDate: 2026-11-01
category: "Tools & Automation"
readTime: 11
cover: "/blog-covers/the-hidden-ai-cost-of-javascript-frameworks.png"
---

When we start talking about “agent‑powered” development, the conversation often skips over a hidden expense: the AI cost of the JavaScript framework we choose. Nolan Lawson’s recent benchmark (Oct 28 2026) shows that when an LLM like Opus 5.5 is tasked with building the same small Pokémon app in Next.js, Nuxt, SvelteKit and a few others, the differences in token usage, development‑time estimates and even Lighthouse performance scores are far from negligible. The experiment strips away the usual “feel‑good” arguments—“React feels right” or “Vue is faster”—and measures what the agents actually spend to get the job done.

In this post we’ll walk through Lawson’s methodology, highlight the most surprising findings (for example, how stochastic token consumption can outweigh the raw runtime speed of a framework), and discuss what those numbers mean for teams that are already budgeting LLM usage. We’ll also explore practical takeaways: how to pick a framework when AI‑assisted coding is in the mix, what metrics to monitor, and where you might save tokens without sacrificing user experience.

## What happened

Nolan Lawson set up a benchmark that asks LLM agents to build the same small Pokémon‑listing app with a handful of popular JavaScript frameworks. The test cases include Next.js, Nuxt and SvelteKit, each representing a different meta‑framework or SSR/CSR approach. All agents receive the same specification – a list of Pokémon drawn from the PokéAPI with searchable, filterable types and moves – and are asked to produce a working implementation from scratch.

The prompt given to each agent specifies Opus 5.5 as the language model, with the “high effort” setting enabled, and explicitly tells the model to use the latest stable version of the target framework. To keep the focus on the JavaScript layer, Lawson also bans any CSS component libraries such as Tailwind or Bootstrap and asks the agents to rely on a minimal visual token set for consistency. Each run executes in an isolated sandbox, so the agents have no knowledge that Lighthouse will later evaluate the output.

After the code is generated, Lawson runs a spec conformance suite that checks functional correctness against the accessibility tree rather than raw DOM markup – a safeguard for frameworks that employ web components or shadow DOM. He then records four quantitative metrics: the wall‑clock development time reported by the agent, the total number of tokens consumed, the lines of code in the final project, and the Lighthouse scores for performance and accessibility. These measurements give a concrete view of how much “hidden AI cost” each framework imposes when the work is done by an LLM rather than a human.

## Why it matters

In the “agentic era” we’re seeing a shift from hand‑typed code to AI‑generated snippets, which means the traditional developer‑experience (DX) arguments for a framework lose much of their relevance. When an LLM writes the bulk of a component, the ergonomics of JSX or the convenience of a CLI no longer dictate how fast a feature lands; instead, the model’s token budget and its ability to stay within a spec become the real bottlenecks. As Nolan Lawson points out, the community’s “vibe‑based” preference for frameworks like React or Svelte‑Kit assumes developers are still the primary agents, an assumption that no longer holds once the agents are LLMs themselves.

Because many teams now claim a framework is “better for agents” without any data, systematic benchmarking becomes essential. Lawson’s own experiment—building the same Pokémon‑search app with Opus 5.5 across several frameworks and measuring development time, token consumption, lines of code, and Lighthouse scores—highlights how stochastic LLM behavior can mask or exaggerate a framework’s perceived advantages. Without a controlled benchmark, anecdotal reports about “fewer mistakes” or “faster agents” remain unverified and can mislead decision‑makers.

Understanding the AI cost of a framework lets teams cut through the hype and choose tools based on measurable impact. Token usage directly translates to API spend, and variations in generated code size or quality affect downstream maintenance and performance. By quantifying these factors, we can avoid adopting a library simply because it feels “modern” and instead prioritize the options that actually reduce token waste and preserve output quality.

In practice, this means adding an AI‑cost dimension to the usual checklist of bundle size, community support, and learning curve. When the primary producer of code is an LLM, the framework that yields the lowest token count while meeting conformance and accessibility standards will deliver the greatest real‑world productivity gain.

## How it works (background)

The benchmark treats each framework as a black‑box that the LLM can call through the framework’s official model‑centered programming (MCP) or skill integration. In practice this means the agent never sees the framework’s source code or internal APIs; it only receives the abstract “use X framework” instruction and relies on the MCP to translate that into the appropriate project scaffolding, build scripts, and runtime configuration. By keeping the interaction surface limited to the officially exposed toolchain, the test avoids giving any framework an unfair advantage due to richer training‑data exposure.

Each agent runs inside an isolated sandbox that is seeded with two things: a concise app specification (the Pokémon list app) and a conformance test suite that checks functional correctness. The sandbox environment deliberately omits any hint that Lighthouse performance or accessibility scores will be examined later. This forces the LLM to focus on satisfying the spec rather than optimizing for metrics it does not know it will be judged against, mirroring a realistic developer workflow where performance testing is a separate step.

When the generated app is finally evaluated, the benchmark compares the output against the accessibility tree instead of the raw DOM. This choice accommodates frameworks that emit web components or use shadow DOM, which can produce divergent DOM structures while still presenting an equivalent accessibility surface. By grounding the check in the accessibility tree, the test ensures that differences in markup or component encapsulation do not penalize a framework that otherwise meets the functional and UI requirements.

Together, these design decisions let the benchmark isolate the hidden AI cost of each JavaScript framework: token usage, development time, and downstream performance, without conflating the results with knowledge of the evaluation criteria or framework‑specific quirks.

## The key details and numbers

The benchmark that Nolan Lawson built around a small Pokémon‑search app measures four quantitative dimensions: the wall‑clock time it takes an LLM‑driven agent to finish the job, the number of model tokens it spends, the total lines of code it emits, and the Lighthouse scores for performance and accessibility. By feeding the same specification to Opus 5.5 with “high effort” and letting the agent pick the latest version of a given framework (Next.js, Nuxt, SvelteKit, etc.), each run produces a concrete data point for all four axes. The design deliberately avoids over‑specifying architecture or CSS choices, so the numbers reflect what the framework and its tooling actually enable when an LLM is left to its own devices.

One of the most striking observations is how stochastic the results are. Lawson notes that LLMs are essentially random‑word generators, so the token count can swing dramatically from one run to the next. An agent might follow a “low dice‑roll” path and generate a concise solution, or it can wander down a divergent branch, consuming many more tokens without any fault in the underlying framework. This variance makes any single token‑usage figure noisy, and it forces us to treat the metric as a distribution rather than a fixed cost.

The performance side suffers from similar noise. Lighthouse’s Largest Contentful Paint (LCP) and other metrics are known to fluctuate between runs, even when the underlying code is unchanged. Lawson points out that LCP may pick a different image as the “largest” element each time, leading to measurable swings in the reported score. Those fluctuations add another layer of uncertainty to the performance and accessibility numbers, meaning that the benchmark’s output must be interpreted with an eye toward statistical variance rather than raw point‑wise comparisons.

## What it means for developers

When you start evaluating a framework for AI‑assisted development, token usage should sit alongside the usual “developer experience” checklist. The benchmark in Nolan Lawson’s post shows that the same LLM (Opus 5.5) can spend a markedly different number of tokens depending on which JavaScript stack it is asked to use. Those extra tokens translate directly into higher API bills, so a framework that feels smoother to type in may actually be more expensive to run an agent against if it forces the model to generate more boilerplate or navigate a more complex build pipeline.

Boilerplate‑heavy frameworks tend to inflate the prompt length because the agent must describe every configuration file, routing rule, or component wrapper before it can emit functional code. In the Pokémon‑app experiment, frameworks that required additional scaffolding steps (for example, explicit SSR setup or custom server‑less functions) consistently produced longer token counts than a leaner alternative that relied on convention over configuration. The same effect shows up in real‑world projects: a longer build script or a verbose component model means the LLM has to emit more lines of code, and each line adds to the token tally that the API provider charges for.

What makes this insight actionable is that the benchmark quantifies the trade‑off between token cost, code size, and runtime performance. By measuring development time, total tokens spent, lines of code, and Lighthouse scores side by side, you can spot frameworks that look attractive on paper but hide hidden token overhead. Those numbers let you pick a stack that balances a modest token bill with acceptable bundle size and good performance, rather than defaulting to the most popular or “fastest”‑sounding option.

In practice, run a small pilot with your chosen LLM and a representative feature set, then compare the token totals across a couple of candidate frameworks. The data will reveal whether the convenience of a richer DX is worth the extra API spend, or whether a simpler stack gives you the same result for fewer tokens and a lower ongoing cost. This evidence‑driven approach keeps the hidden AI cost visible and under control.

## Limits and caveats

The benchmark is built around a single, content‑focused Pokémon app that pulls data from the PokéAPI and presents a searchable list of creatures. That design choice keeps the spec easy to verify, but it also means the workload is far from the kind of highly interactive, data‑intensive applications many teams ship—think real‑time dashboards, collaborative editors, or e‑commerce sites with complex state management. Because the app is more like a static encyclopedia than a dynamic UI, the token counts, line totals, and Lighthouse scores we report may look very different when the same frameworks are used for richer interactions.

We deliberately avoided imposing a specific CSS methodology, only ruling out large component libraries such as Tailwind or Bootstrap. This leaves each agent free to style the app however it sees fit, which can introduce variability in both the number of tokens the LLM spends on CSS generation and the final line count of the output. A framework that encourages inline styles or scoped CSS modules might appear cheaper or more verbose purely because of the styling approach, not because of the JavaScript abstraction itself.

Both the LLM generation process and the Lighthouse performance audit are stochastic. The language model can take a “bad dice roll” and produce extra code or stray from the spec, inflating token usage without any fault of the framework. Likewise, Lighthouse measurements of metrics like Largest Contentful Paint can fluctuate between runs due to network jitter, background system load, or Chrome’s own sampling variance. A single execution therefore cannot be taken as a definitive ranking; repeating the experiment multiple times and aggregating the results is essential for statistical confidence.

## Key takeaways

- The benchmark measured development time, token usage, lines of code, and Lighthouse performance/accessibility for a small Pokémon app built by LLM agents using different JavaScript frameworks.  
- Results were highly stochastic; the same framework could produce widely varying token counts and code quality because LLMs generate random outputs.  
- Lighthouse scores (e.g., Largest Contentful Paint) also showed inconsistency across runs, making it difficult to attribute performance differences solely to the framework.  
- No single framework consistently outperformed others in token efficiency or Lighthouse metrics; the observed variations often stemmed from the LLM’s random behavior rather than the framework itself.  
- The experiment deliberately avoided specifying architecture (SSR vs. CSR) or CSS frameworks to focus the comparison on the JavaScript frameworks themselves.  
- Because the test app was a simple, content‑heavy site, the findings may not generalize to highly interactive applications.

## Sources

- [The AI cost of JavaScript frameworks](https://nolanlawson.com/2026/10/28/the-ai-cost-of-javascript-frameworks/)
- [No AI, 52 min. Build all Linux Files utils in C by Hand video](https://www.youtube.com/watch?v=gQRmSlcTq9c)
- [I Retested My MoE Offloading Benchmarks. Some of My Conclusions Changed.](https://dev.to/sizzlebop/i-retested-my-moe-offloading-benchmarks-some-of-my-conclusions-changed-6f4)
