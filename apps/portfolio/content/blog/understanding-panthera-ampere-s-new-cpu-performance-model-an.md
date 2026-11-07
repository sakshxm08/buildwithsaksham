---
title: "Understanding Panthera: Ampere’s New CPU Performance Model and What It Means for Developers"
description: "Ampere just opened the doors to Panthera, its cycle‑accurate CPU performance model, on GitHub. The repository (now 107 stars) isn’t just a curiosity—it’s t"
pubDate: 2026-11-07
category: "Tools & Automation"
readTime: 11
cover: "/blog-covers/understanding-panthera-ampere-s-new-cpu-performance-model-an.png"
---

Ampere just opened the doors to Panthera, its cycle‑accurate CPU performance model, on GitHub. The repository (now 107 stars) isn’t just a curiosity—it’s the same industrial‑grade simulator the Architecture & Performance team uses to explore new micro‑architectural features for the AmpereOne cloud processors. By publishing the code, Ampere is giving developers a “low‑background steel” reference that can be run side‑by‑side with real silicon in the public cloud, making it possible to validate ideas against a realistic baseline rather than an academic toy model.

In this post we’ll walk through how to build and run Panthera, highlight the key components (the trace‑generation pipeline, the micro‑architectural abstractions, and the companion “catscan” tooling), and show a few practical use‑cases: estimating the impact of a new cache size, profiling instruction‑mix changes in a Go service, and correlating model predictions with actual cloud‑instance measurements. By the end you’ll know whether Panthera is worth adding to your performance‑engineering toolbox and how to get meaningful data out of it without diving into Ampere’s internal design docs.

## What happened

Ampere’s Architecture & Performance team announced the release of **Panthera**, a cycle‑accurate software performance model for their cloud‑grade CPUs, as an open‑source project on GitHub. The repository (https://github.com/AmpereComputing/panthera) was made public with a brief README that describes Panthera as a tool to study prospective CPU features, evaluate micro‑architectural trade‑offs, and guide the development of high‑performance cloud processors. By publishing the full source, Ampere is giving the broader community access to a commercial‑grade modeling infrastructure that has traditionally been kept proprietary.

The GitHub project currently shows **107 stars** and **14 forks**, indicating early interest from researchers and engineers who want to experiment with a model calibrated against production silicon. All of the code, documentation, and supporting scripts are available in the repository’s `src`, `doc`, and `infrastructure` directories, and the project includes a user guide that explains how to build and run the model alongside the companion tooling.

Panthera is released under the **BSD‑3‑Clause license**, a permissive open‑source license that allows both academic and commercial use with minimal restrictions. The license file is present at the root of the repo, and the accompanying `CONTRIBUTING.md` outlines how external contributors can submit improvements. By choosing a BSD‑style license, Ampere makes it straightforward for developers to integrate Panthera into their own workflows, whether for performance research, teaching, or early‑stage CPU design exploration.

In addition to the code, the repository provides a concise set of resources—such as a “User Guide” and a list of supported agents—that help users get up to speed quickly. The open‑source release signals Ampere’s intent to foster collaboration across industry and academia, giving developers a realistic, production‑calibrated model they can run locally and compare against actual AmpereOne silicon deployed in public clouds.

## Why it matters

Open‑sourcing Panther — a cycle‑accurate performance model built by Ampere’s Architecture & Performance team — instantly widens access to a tool that has historically lived behind corporate firewalls. Most industrial‑grade models are kept as proprietary trade secrets, so the community has relied on academic simulators that, while useful, often miss the nuanced trade‑offs of real server silicon. By releasing Panthera under a BSD‑3‑Clause license, Ampere gives researchers, educators, and independent developers a commercial‑caliber infrastructure they can inspect, extend, and integrate into their own toolchains without having to reinvent the wheel from scratch.

Because AmpereOne CPUs are already deployed across the major public clouds, the model can be exercised side‑by‑side with actual production hardware. You can run the same benchmark on a cloud instance and feed the identical workload into Panthera, then compare the simulated cycles to the observed latency and throughput. This direct correlation eliminates the guesswork that usually separates simulation results from real‑world performance, enabling more reliable validation of architectural ideas and software optimizations.

The model itself is the product of decades of architectural craftsmanship. Ampere’s engineers distilled years of silicon‑level experience into a set of abstractions that capture micro‑architectural behavior with “low‑background steel” precision — a reference quality that is rare outside the walls of large silicon vendors. For developers working on server‑class workloads, this means having a trustworthy baseline for studying cache hierarchies, branch prediction, or instruction‑level parallelism, all without needing physical access to the silicon. The combination of open access, cloud‑available hardware, and expert‑level modeling makes Panthera a uniquely valuable asset for anyone looking to push the performance envelope on modern CPUs.

## How it works (background)

Panthera is a cycle‑accurate software simulator that reproduces the behavior of a CPU down to individual clock ticks.  Rather than treating a processor as a black box, the model instantiates explicit representations of pipelines, cache hierarchies, branch predictors and execution units.  Each micro‑architectural component is described with parameters such as latency, bandwidth and contention rules, allowing the simulator to trace how an instruction stream moves through the pipeline and where stalls occur.  Because the model operates at the level of cycles, it can predict the performance impact of subtle design changes—e.g., widening a dispatch queue or adding a new cache level—before silicon is fabricated.

The infrastructure was created by Ampere’s Architecture & Performance team, who distilled decades of experience building high‑throughput cloud CPUs into a set of reusable abstractions.  These abstractions capture practical lessons about balancing core count, memory bandwidth and power envelope in server‑class silicon.  By exposing the same knobs that architects manipulate in real silicon projects, Panthera lets users explore “what‑if” scenarios with the same fidelity that commercial teams rely on, but without the proprietary constraints of internal tools.

To make the simulator usable outside the design lab, Ampere ships a suite of companion utilities.  The most visible is **catscan**, a command‑line front‑end that automates the workflow of compiling a workload, feeding trace data into Panthera, and extracting performance metrics.  Catscan can ingest real‑world hardware traces—collected from AmpereOne instances running in public clouds—and compare them side‑by‑side with simulated results, highlighting divergences in latency, IPC or cache miss rates.  This tight integration of simulation and trace analysis gives developers a concrete reference point: they can validate model predictions against production silicon and iterate quickly on architectural hypotheses.

## The key details and numbers

The Panther model lives in a fairly conventional open‑source layout. At the top level you’ll find a **README**, a **User Guide**, and the source tree split into three main folders: `doc` for documentation, `src` for the C++ implementation of the simulator, and `infrastructure` for the scripts and configuration files that glue everything together. The repository also contains a `nix` directory with Nix expressions that make the build reproducible on a variety of Linux environments.

Building Panthera is driven by **CMake** – the `CMakeLists.txt` file in the root defines the targets, pulls in the required third‑party libraries, and sets up the install rules. On top of that, the project ships a **Python‑based workflow** (see `pyproject.toml` and the `scripts` package) that automates the steps needed to generate micro‑architectural traces, configure simulation parameters, and launch the cycle‑accurate runs. This separation lets developers use familiar Python tooling for orchestration while the heavy‑weight performance engine stays in compiled C++.

Looking at the commit history, the repository shows a **single recent commit** as its latest activity, indicating that the core model is largely stable but still being touched. The contributor list is modest – the project has a handful of regular contributors, enough to keep issues answered and pull requests reviewed without a large team overhead. This level of activity suggests that while Panthera isn’t under rapid development, the maintainers are responsive and the codebase is ready for developers to adopt and extend for their own performance‑modeling experiments.

## What it means for developers

Panthera gives us a way to run cycle‑accurate performance experiments on an AmpereOne‑class CPU long before any tape‑out. Because the model is open‑source and calibrated against the silicon that’s already available in the public cloud, we can feed a micro‑benchmark or a full application trace into Panthera and see how changes to pipeline depth, branch predictor size, or cache latency would affect throughput. This lets architecture‑focused teams explore “what‑if” scenarios early in the design cycle, cutting down the number of costly silicon iterations that would otherwise be required to validate a new idea.

The fact that the model is fully open also means we can prototype extensions that don’t exist in the shipped silicon. Want to try a custom SIMD instruction, a different L2 cache hierarchy, or a novel out‑of‑order scheduling policy? You can modify the Panthera source, rebuild the model, and run the same workload on the altered baseline. Because the underlying engine already captures the nuances of the AmpereOne microarchitecture, the results stay grounded in a realistic server context rather than an abstract academic simulator.

A practical workflow emerges when we compare Panthera’s predictions with measurements taken on cloud‑hosted Ampere instances. By running the same benchmark on an actual VM and on the model, we can quantify the correlation and spot systematic deviations. Those gaps become a feedback loop: they tell us where the model needs retuning and, more importantly, where our performance assumptions hold up. Once the model is trusted, we can use it to guide compiler flags, memory‑layout decisions, or algorithmic tweaks that are likely to pay off on the real hardware.

In short, Panthera turns the traditionally opaque process of CPU‑feature evaluation into an iterative, software‑driven exercise. Teams can experiment freely, validate against production silicon, and steer their optimization efforts with data that reflects the performance characteristics of the CPUs that actually run in the cloud today.

## Limits and caveats

Panthera’s calibration is tightly coupled to the micro‑architectural characteristics of Ampere’s own silicon families – most notably the AmpereOne line that the model was built around. The parameters and latency tables in the repository are derived from silicon‑level measurements of those chips, so applying the model to a competing vendor’s processor without re‑tuning the underlying constants can produce misleading results. In practice you’ll need to collect trace data on the target architecture and adjust the model’s calibration files before expecting quantitative accuracy.

Because the project lives under an open‑source licence (BSD‑3‑Clause) and is maintained by a relatively small core team, its long‑term health depends on community contributions. The repository lists 14 forks and 107 stars, but there is no guarantee that the code will receive the same level of exhaustive validation that a proprietary, internally‑owned performance model typically enjoys. Bugs or missing features may linger until someone upstream submits a pull request, which can be a bottleneck for teams that need rapid updates or deep verification.

The fidelity of Panthera’s predictions also hinges on the quality of the input workloads and trace files you feed into it. The README stresses that the model is “cycle‑accurate” only when driven by realistic, well‑instrumented traces; noisy or incomplete data will propagate errors through the simulation pipeline and can lead to over‑optimistic or overly pessimistic performance estimates. Before trusting a result, it’s worth double‑checking that the trace captures the relevant instruction mix, memory access patterns, and synchronization behavior of the real application.

In short, while Panthera offers a powerful, industrial‑grade view of Ampere silicon, you should treat its outputs as a starting point rather than a definitive benchmark when working with other CPUs, when the community has not yet vetted a particular change, or when the input traces are of uncertain quality.

## Key takeaways

- Panthera is a cycle‑accurate, open‑source software performance model created by Ampere’s Architecture & Performance team to explore CPU feature ideas and microarchitectural trade‑offs.  
- The model is calibrated against production silicon (AmpereOne) and can be run alongside real cloud instances, letting developers validate concepts against actual server‑class hardware.  
- By open‑sourcing Panthera, Ampere provides the community with an industrial‑strength modeling infrastructure that was previously limited to proprietary tools used by CPU vendors.  
- The repository includes companion utilities such as **catscan**, enabling detailed analysis of processor behavior and performance‑critical paths.  
- Panthera’s abstractions reflect decades of practical CPU design experience, offering developers a realistic baseline for research, education, and early‑stage architecture exploration.

## Sources

- [Panthera: Ampere's CPU Performance Model](https://github.com/AmpereComputing/panthera)
- [Scriptable GeoDNS: leaving AWS for Bunny](https://vincent.bernat.ch/en/blog/2026-bunny-geodns)
- [How hard could implementing DTLS 1.3 possibly be?](https://joturk.net/posts/dtls)
