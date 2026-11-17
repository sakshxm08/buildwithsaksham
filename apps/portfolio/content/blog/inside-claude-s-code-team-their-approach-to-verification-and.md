---
title: "Inside Claude's Code Team: Their Approach to Verification and What Developers Can Learn"
description: "The Claude Code team just revealed how they keep a 90 percent‑generated codebase honest. By wiring Claude‑powered agents into verification loops—end‑to‑end"
pubDate: 2026-11-17
category: "AI & LLMs"
readTime: 12
cover: "/blog-covers/inside-claude-s-code-team-their-approach-to-verification-and.png"
blocks: {"tldr":["Claude writes and reviews ~90% of its code, using self‑verification loops.","Three test families (E2E, property, differential) run automatically at scale.","A rubric‑based grader adds up to +10 points on hardest structured‑file tasks.","Automation lets dozens‑to‑hundreds of agents run in parallel without manual checks."],"stats":[{"value":"90%","label":"code generated & reviewed by Claude"},{"value":"10 pts","label":"grader boost on hardest tasks"},{"value":"dozens","label":"agents run in parallel"},{"value":"hundreds","label":"potential parallel agents"}],"chart":null,"flow":{"kind":"steps","title":"Verification loop workflow","steps":[{"label":"Generate code","text":"Claude agent writes code and its own tests."},{"label":"Run tests","text":"E2E, property, and differential tests execute automatically."},{"label":"Grade output","text":"Separate grader checks results against a rubric."},{"label":"Adjust & close loop","text":"Failing tests trigger rule updates in CLAUDE.md or code fixes."}]}}
slides: ["/blog-covers/inside-claude-s-code-team-their-approach-to-verification-and-slide-1.png","/blog-covers/inside-claude-s-code-team-their-approach-to-verification-and-slide-2.png"]
---

The Claude Code team just revealed how they keep a 90 percent‑generated codebase honest. By wiring Claude‑powered agents into verification loops—end‑to‑end, property and differential tests—they can run dozens of agents in parallel without manually checking each output. In internal benchmarks, a separate grader that grades Claude’s work against a rubric lifted structured‑file‑generation success by up to ten points, especially on the toughest problems. That shift from expensive, manual checks to cheap, automated evidence is what lets them ship high‑velocity, high‑quality code.

In this post we’ll walk through the three test families the team invests in, why end‑to‑end checks are the most reliable, and how property‑based tests catch edge‑case failures that unit tests miss. We’ll also show how you can close the verification loop—feeding test results back into Claude’s prompts or CLAUDE.md rules—to prevent repeat bugs. By the end you’ll have a practical checklist for building your own verification pipeline and a sense of which tests give the biggest ROI for agent‑assisted development.

## What happened

The Claude Code team revealed that roughly 90 percent of the code they ship is both written and reviewed by Claude itself. At that scale, the team had to give the model a reliable way to prove its own work, otherwise every change would require a human to double‑check the output. Their solution is a verification loop that lets many Claude instances operate in parallel: each agent generates its own tests, benchmarks, or specifications, runs them, and then uses the results to decide whether the code passes. By turning verification into a self‑contained step, the loop removes the bottleneck of a single human reviewer and makes it feasible to run dozens or even hundreds of agents at once.

The loop is built around three kinds of tests—end‑to‑end, property, and differential—each of which can be expressed as software that the agents execute automatically. Because the tests run as code, they consume only a few extra tokens, keeping the cost low while still providing concrete evidence of correctness. When a test fails, the agent can immediately adjust its output or add a rule to its CLAUDE.md file, effectively “closing the loop” and preventing the same mistake from resurfacing.

In internal experiments focused on structured file generation, the team added a separate grader that checks Claude’s output against a predefined rubric. That grader boosted task success by up to 10 points on the hardest problems compared with a standard prompting loop. The improvement was most pronounced on the most challenging cases, showing that an external, rubric‑driven evaluation can surface subtle errors that the primary model might miss.

Overall, the verification loop turns Claude from a single‑shot code generator into a collaborative partner that can self‑audit, run extensive checks, and iterate quickly. For developers, the takeaway is clear: embedding automated, evidence‑based verification into your LLM‑driven pipelines can dramatically increase reliability without sacrificing speed.

## Why it matters

Verification loops are the secret sauce that lets Claude graduate from a single‑agent assistant to a virtual workforce. By giving each agent a way to check its own output—through end‑to‑end, property, or differential tests—the team can spin up dozens or even hundreds of agents in parallel instead of being limited to one or two that a human must manually audit. The internal tests described in the Claude blog show that a separate grader checking Claude’s work against a rubric can boost task success by up to ten points on the hardest problems, proving that cheap, automated verification scales much better than manual review.

For developers, the practical payoff is a dramatic reduction in the time spent hunting through AI‑generated code. When an agent can generate the tests, benchmarks, or specs it needs and then run them as ordinary software, the evidence‑based check becomes a routine part of the pipeline rather than an after‑thought. This means you no longer have to read every line of code the model produces; you only need to inspect the verification results, which are far more concise and reliable than raw diffs.

Higher‑quality verification also shortens the overall development cycle. Because the agents receive immediate feedback—failing a test triggers a rule change in the CLAUDE.md file, preventing the same mistake from resurfacing—the code that reaches your repository is already vetted against realistic user flows and edge‑case constraints. The result is fewer production bugs and less rework when you finally ship the AI‑written components.

In short, the verification loop turns Claude into a scalable, self‑correcting coding partner. By offloading the grunt work of test generation and execution to the agents themselves, you free up developer bandwidth for higher‑level design decisions, accelerate iteration, and end up with more trustworthy code without the usual manual overhead.

## How it works (background)

The Claude Code team groups its verification suite into three families that complement each other. End‑to‑end (E2E) tests exercise a full user flow—think “add an item to a cart, check out, and land on a confirmation page.” Because the whole stack must cooperate, an agent can’t simply mock a success; the test either sees the real UI, API responses, or screenshots, making it hard to fake. Property‑based tests, on the other hand, start from a statement that should never be violated (for example, “serializing then deserializing a JSON object yields the original object”) and then use generators like fast‑check for JavaScript/TypeScript, Hypothesis for Python, or proptest for Rust to churn out thousands of edge‑case inputs that try to break that invariant.

These property generators explore corners that developers often overlook, and they surface bugs that unit tests miss because they focus on a single, hand‑picked scenario. By defining a clear invariant, the test acts as a contract: any failure immediately signals that the contract was breached, regardless of how exotic the input was. Differential tests provide a safety net for regression. After a new model version produces code, the output is run side‑by‑side with a known‑good baseline, and any deviation is flagged. This comparison catches subtle shifts in behavior that might not trigger an explicit failure in an E2E or property test but still represent a regression.

Together, the three families give the team confidence that generated code works in the real world (E2E), respects fundamental invariants (property), and stays consistent with prior releases (differential). By keeping each test type focused—fast and deterministic for properties, realistic and holistic for E2E, and comparative for differential—the verification loop remains cheap enough to run frequently while still providing strong evidence that Claude’s code agents are producing reliable results.

## The key details and numbers

Around 90 % of the code that moves through the Claude Code team’s pipeline is both generated and reviewed by Claude itself. At that scale, the team treats verification as the primary lever for quality, because without an automated way to check output you quickly hit a bottleneck where every change has to be inspected manually. By letting Claude write the code and then run its own checks, they can spin up dozens of parallel agents instead of being limited to a handful.

In internal experiments focused on structured‑file generation, the team added a separate “grader” that evaluated Claude’s output against a rubric. That extra verification step lifted the task‑success score by as much as ten points compared with a plain prompting loop, with the biggest gains on the most difficult problems. The grader acts as an honest third party, turning what would be an expensive manual review into a cheap, repeatable token‑level operation.

When choosing which tests to run, the team warns against flaky or slow suites. Flaky tests cause the agent to keep retrying, which trains it to chase false negatives rather than fixing the underlying code. Slow tests limit how many checks can be performed in a batch, reducing the granularity of feedback and making it harder to pinpoint the exact failure point.

Because of those trade‑offs, end‑to‑end (E2E) tests are the recommended default. An E2E test exercises a real user flow—from adding an item to a cart through checkout to the confirmation page—so the result is either a clear pass or a definitive fail. The visual evidence (for example, a screenshot of the broken UI) gives developers concrete proof of what went wrong, something unit or property tests often can’t provide. This makes E2E tests the most reliable way to close the verification loop and keep Claude’s output trustworthy.

## What it means for developers

What it means for developers is that the verification loop Claude’s team relies on can be reproduced with any LLM‑powered code agent. The pattern is simple: ask the model to emit a set of tests—unit, end‑to‑end, or property‑based—run those tests automatically in your CI pipeline, then feed the pass/fail results back into the next prompt. In practice this means the agent sees concrete evidence of what broke, so it can adjust its code generation or add missing guards without you having to intervene manually. The Claude blog notes that “having a separate grader check Claude’s work against a rubric improved task success by up to 10 points” — showing how a tight feedback loop directly lifts quality.

Investing in high‑quality end‑to‑end (E2E) tests is the most effective way to protect yourself when you let an agent write large chunks of code. E2E tests exercise real user flows and are hard for a model to “cheat” on; they either pass with a screenshot of the expected UI state or fail with a clear indication of what’s broken. Because they provide definitive “done” criteria, they become the safety net that lets you scale the number of parallel agents without drowning in false positives. The same blog stresses that “E2E tests are difficult to fool – either the whole feature works or it doesn’t,” making them the single most valuable test type to prioritize.

Property‑based testing adds another layer of confidence, especially for the edge‑case logic that LLMs tend to miss. By defining invariants—statements that “can’t fail”—and using libraries like fast‑check or Hypothesis to generate thousands of inputs, you surface corner‑case failures that a handful of hand‑written unit tests would never hit. The Claude team points out that “property tests look at the edge cases that people tend to miss, which is where agents often fail,” so incorporating them helps catch subtle bugs before they reach production.

When verification is treated as a first‑class part of the pipeline, the cost of adding more agents drops dramatically. The Claude team reports that with a robust verification loop they can run “dozens or hundreds in parallel,” because each agent is equipped to self‑validate and self‑correct. By embedding test generation, automated execution, and result‑driven prompting into your workflow, you gain the ability to safely increase agent concurrency while keeping the overall defect rate low. This approach turns verification from an afterthought into a scalable foundation for AI‑augmented development.

## Limits and caveats

Tests that are flaky or overly slow can actually steer the verification loop in the wrong direction. When a test intermittently fails, the agent learns that the failure is a normal outcome and ends up re‑running the same test instead of fixing the underlying code. Similarly, if a test takes a long time to execute, the agent will run fewer of them per batch, which reduces the granularity of the feedback it receives and makes it harder to pinpoint the exact defect. In both cases the verification signal becomes noisy, and the agent may waste cycles chasing false negatives rather than delivering stable code.

It’s also important to remember that verification is only as good as the tests you feed it. End‑to‑end, property and differential tests each catch a specific class of bugs, but anything outside their scope can still slip through. A missing edge‑case, an undocumented contract, or a performance regression that isn’t covered by a test will not be flagged, even if the agent passes every supplied check. In practice this means you still need human review or additional static analysis to catch issues that the test suite never exercises.

The whole approach assumes that generated tests can be run cheaply. Claude’s team notes that “heavier tests are best deployed before you’ve committed the changes,” implying that heavyweight integration or performance tests remain expensive and may need to be run only sparingly. If your workflow relies on long‑running benchmarks or full‑stack deployments, the cost of verification can quickly outweigh the benefits of parallel agents.

Finally, delegating verification logic to an LLM creates a feedback loop that must be monitored. The model can start to internalise incorrect heuristics if it repeatedly sees a particular test pattern as a success signal, even when the test is misleading. Without periodic audits of the verification results and occasional resets of the agent’s “learning” from those results, you risk reinforcing bad patterns and eroding overall code quality.

## Key takeaways

- The Claude Code team writes and reviews about 90 % of its code using Claude, so automated verification is essential to maintain quality at scale.  
- Verification loops let multiple Claude agents run in parallel; without them only one or two agents can be used because humans would have to check everything.  
- In internal tests for structured‑file generation, adding a separate grader that checks Claude’s output against a rubric improved task success by up to 10 points, especially on the hardest problems.  
- The team prioritizes three test types—end‑to‑end, property, and differential tests—because they provide the most reliable signals while keeping flakiness and runtime low.  
- End‑to‑end tests are the most valuable single test type, as they exercise real user flows and are hard for agents to “cheat” on, giving clear pass/fail results.  
- Property tests generate thousands of edge‑case inputs (using libraries like fast‑check, Hypothesis, or proptest) to catch failures that unit tests often miss, helping agents learn constraints that “can’t fail.”

## Sources

- [How the Claude Code team thinks about verification](https://claude.dev/blog/how-the-claude-code-team-thinks-about-verification/)
- [LLMs are compressors. So I chatted with gzip](https://dev.to/aws/llms-are-compressors-so-i-chatted-with-gzip-12ji)
- [Once Upon Agentic AI (Part 2): Develop your own MCP server and cast its tools from Strands Agents](https://dev.to/aws/once-upon-agentic-ai-part-2-develop-your-own-mcp-server-and-cast-its-tools-from-strands-agents-9ob)
