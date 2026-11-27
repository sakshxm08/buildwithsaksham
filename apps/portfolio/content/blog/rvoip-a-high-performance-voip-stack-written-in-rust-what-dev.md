---
title: "Rvoip: A High‑Performance VoIP Stack Written in Rust – What Developers Need to Know"
description: "Rvoip just hit 0.5.0 on GitHub, and the numbers are hard to ignore. On a single c8i.4xlarge AWS instance (16 vCPU, 32 GiB RAM) the stack sustained more tha"
pubDate: 2026-11-27
category: "Open Source"
readTime: 11
cover: "/blog-covers/rvoip-a-high-performance-voip-stack-written-in-rust-what-dev.png"
blocks: {"tldr":["Rvoip 0.5.0 hits ~8 k CPS SIP‑TLS on a single c8i.4xlarge.","Sub‑ms setup latency (p50≈1 ms, p99≈4‑6 ms) at 90% load.","Handles ~12 k concurrent calls and graceful 503 overload handling.","All‑in‑one Rust crate replaces separate SIP proxy, media server, and RTP engine."],"stats":[{"value":"8,348","label":"CPS SIP‑over‑TLS (signalling only)"},{"value":"1,204","label":"CPS UDP + RTP + G.711"},{"value":"12k","label":"Estimated concurrent calls (UDP + RTP)"},{"value":"503","label":"Fast overload response code"}],"chart":null,"flow":{"kind":"steps","title":"From release to overload handling","steps":[{"label":"Release","text":"Version 0.5.0 published on GitHub with full SIP/VoIP stack."},{"label":"Benchmark","text":"Ran RFC 7502 test on AWS c8i.4xlarge, achieving ~8 k CPS SIP‑TLS."},{"label":"Overload","text":"At ~16 k CPS the stack returns fast 503 responses for excess calls."},{"label":"Recovery","text":"When traffic drops below capacity, normal operation resumes instantly."}]}}
slides: ["/blog-covers/rvoip-a-high-performance-voip-stack-written-in-rust-what-dev-slide-1.png","/blog-covers/rvoip-a-high-performance-voip-stack-written-in-rust-what-dev-slide-2.png"]
---

Rvoip just hit 0.5.0 on GitHub, and the numbers are hard to ignore. On a single c8i.4xlarge AWS instance (16 vCPU, 32 GiB RAM) the stack sustained more than 8 k calls‑per‑second for SIP‑over‑TLS signaling, with sub‑millisecond setup latency, and over 12 k concurrent calls when using UDP + RTP + G.711. Those figures come from the RFC 7502 benchmark that measures session‑establishment rate, and the library reports fast 503 responses once it reaches capacity, then recovers cleanly as load drops. In short, a pure‑Rust implementation can now compete with traditional SBCs and media servers on raw throughput without any external SIP proxy or RTP engine.

In this post we’ll walk through what makes Rvoip tick: the crate layout that bundles SIP, WebRTC, SRTP and even AI voice agents behind a single API, how to get a minimal call up and running in five minutes, and what the benchmark results mean for carriers and developers alike. We’ll also look at the interoperability evidence against Asterisk, FreeSWITCH, Kamailio and others, and point out the upgrade path from the 0.3 series. By the end you should know whether Rvoip is a practical foundation for your next real‑time communications project.

## What happened

The rvoip project landed on GitHub as a fully open‑source Rust library that bundles an entire SIP/VoIP stack behind a single API.  In addition to classic SIP signaling it ships RTP, WebRTC, QUIC/WebTransport/WebSocket transports, SRTP encryption and even AI‑driven voice agents, so developers can pick any combination without wiring together separate servers or media engines.  The repository (eisenzopf/rvoip) now shows 461 stars and 38 forks, a clear sign that the community is taking notice and beginning to experiment with the crate.

Version 0.5.0 was the first release to be put through a formal performance test.  The benchmark ran on an AWS c8i.4xlarge instance (16 vCPU, 8 cores, Intel Xeon 6, 32 GiB RAM) using the RFC 7502 Session Establishment Rate workload, which measures how many calls per second a stack can set up without any failures.  The results reported a maximum of roughly 8,300 CPS for SIP‑over‑TLS signaling only, and about 1,200 CPS when TLS + SRTP (G.711) media was added.  At 90 % load the 50th‑percentile setup latency stayed under 1 ms and the 99th‑percentile under 6 ms, indicating very low per‑call overhead.

The benchmark also demonstrated how rvoip behaves under overload: once the measured ceiling is reached it returns fast 503 “Service Unavailable” responses and resumes normal operation as soon as the traffic drops.  Because the test treats rvoip as a terminating endpoint that echoes its own media, the numbers reflect the stack’s raw signaling and media handling capabilities without any additional transcoding or proxy logic.  These figures give developers a concrete baseline for comparing rvoip against traditional SBCs or media servers when evaluating Rust‑based telephony solutions.

## Why it matters

By bundling signalling, media handling, codecs, NAT traversal and security into a single Rust crate, rvoip eliminates the need to stitch together a SIP proxy, a media server and an RTP engine. For a developer, that means one dependency to add, one build step to run, and no external processes to provision or monitor. Carriers can prototype or roll out services on a bare‑metal VM or a container without worrying about version mismatches between separate components, which traditionally drive configuration drift and operational overhead.

The performance figures published with the RFC 7502 benchmark are striking: a single rvoip process on an AWS c8i.4xlarge (16 vCPU, 32 GiB) sustained over 8 k calls / s for SIP‑only traffic, with sub‑millisecond session‑request delays (p50 ≈ 1 ms, p99 ≈ 6 ms). Those numbers sit in the same ballpark as many commercial session border controllers and media gateways, yet they come from a memory‑safe language that prevents common buffer‑overflow bugs. Because the library is a terminating endpoint—answering and echoing media—it can be used as a building block for both B2BUA‑style SBCs and lightweight SIP clients, giving you a high‑throughput alternative without sacrificing safety.

Interoperability is not left to speculation. The repository ships “release‑gated interoperability evidence” that has been exercised against Asterisk, FreeSWITCH, Jambonz, Kamailio and OpenSIPS. Running the provided test suites against those platforms demonstrates that rvoip can negotiate standard SIP dialogs, handle G.711 media streams and respect TLS/SRTP security layers. This concrete validation reduces integration risk: you can drop rvoip into an existing SIP‑centric environment and expect it to speak the same dialect as the major open‑source and carrier‑grade servers.

In practice, the combination of a single‑crate deployment model, competitive throughput, and proven compatibility means you spend less time wiring components together and more time focusing on the business logic of your voice service. Whether you’re building a carrier‑grade SBC, a cloud‑native telephony microservice, or an experimental AI‑driven voice agent, rvoip gives you a solid, Rust‑backed foundation that scales and plays nicely with the ecosystem you already trust.

## How it works (background)

rvoip is laid out as a single Cargo workspace that contains a handful of tightly‑focused crates. Each crate implements one layer of the call stack – for example, a `sip` crate handles SIP signalling, an `rtp` crate deals with packetisation and timing, a `codecs` crate provides G.711, Opus and other encoders/decoders, and a `quic` crate wraps media transport over QUIC/WebTransport. Because the crates share the same workspace they can reference each other directly, so a call flows from the signalling crate, through NAT‑traversal and security crates, into the media path without any external glue code. The result is a unified call model that you can compose in your own binary by pulling in just the crates you need.

All of the processing happens inside the library itself; there is no need to launch a separate SIP proxy, media server, or RTP engine. When you instantiate the rvoip API, the stack becomes a terminating endpoint that can answer a call, negotiate media, and then echo the received audio back to the caller. This “echo‑as‑media” mode is what the benchmark suite uses to measure raw throughput, because it eliminates any extra routing logic while still exercising the full media pipeline.

The implementation follows the IETF‑defined procedures in RFC 7501 (session establishment) and RFC 7502 (performance measurement). By adhering to these specifications, rvoip’s session‑establishment rate (CPS) and setup‑delay metrics are directly comparable to other compliant systems. The benchmark results published in the repository show the stack handling over 1 200 CPS for UDP + RTP + G.711 on a single AWS c8i.4xlarge instance, with sub‑millisecond p50 setup times at 90 % load.

Because the entire call flow lives in Rust crates, you get the usual safety guarantees (memory safety, thread safety) without the overhead of inter‑process communication. The library can be linked into any Rust application, giving you a high‑performance, standards‑compliant VoIP stack that runs entirely in‑process.

## The key details and numbers

The benchmark on an AWS c8i.4xlarge (16 vCPU, 8 cores, 32 GiB) shows that rvoip can establish **8,348 CPS** for SIP over TLS when measuring signalling only, and **8,256 CPS** for SIP over UDP under the same conditions. Those figures represent the highest sustained session‑establishment rate (RFC 7502) with zero failed calls over a 180‑second trial and at least 50 000 call attempts.

When media is added, the stack still delivers respectable throughput. With G.711 carried over TLS + SRTP the system sustained **1,124 CPS**, and with UDP + RTP it sustained **1,204 CPS**. In both cases the call‑setup latency remained sub‑millisecond: the median (p50) was about **1 ms**, and the 99th percentile (p99) stayed in the **4‑6 ms** range, measured at 90 % of the maximum load.

The authors also pushed the load to twice the measured capacity. Even at **~16 k CPS**, rvoip continued to accept calls up to its documented maximum, rejected the surplus with fast **503** responses, and then recovered cleanly as the traffic fell back below the limit. This behaviour demonstrates that the stack can gracefully handle overload spikes without cascading failures.

Because each call in the benchmark lasts ten seconds, a simple way to estimate concurrent‑call capacity is to multiply CPS by the call length. Using that rule, the TLS‑only signalling benchmark translates to roughly **11,200 concurrent calls**, while the UDP + RTP media benchmark suggests about **12,000 concurrent calls** in the same environment. These numbers give developers a concrete sense of the scale rvoip can handle on a single modern cloud VM.

## What it means for developers

Embedding a VoIP stack directly into your Rust binary means you no longer have to spin up a separate SIP proxy, media server, or RTP engine. The rvoip crate bundles signalling, media handling, codecs, NAT traversal and security into a single set of Rust crates, so a call can travel from your application code to the wire without any external process. For a typical microservice or edge‑gateway this eliminates the need to provision, monitor and patch additional servers, which translates into lower operational overhead and fewer moving parts in your deployment pipeline.

Because rvoip is released under the MIT license, you can incorporate it into proprietary codebases, ship it as part of a carrier‑grade appliance, or embed it in a SaaS offering without worrying about copyleft obligations. The permissive terms also make it easy to combine rvoip with other third‑party libraries—commercial or open source—without having to negotiate complex license compatibility. In practice this means you can take the stack from a proof‑of‑concept straight to production while keeping your licensing model simple.

Rust’s guarantees around memory safety and its zero‑cost abstraction model give you additional confidence when dealing with real‑time media. The compiler checks that you never dereference invalid pointers or cause data races, which is especially valuable in a low‑latency, multi‑threaded environment like VoIP. Moreover, because the whole stack compiles to a single native binary, deployment becomes as straightforward as shipping an executable file. No container orchestration tricks or runtime dependencies are required; the binary can run on any platform that Rust supports, from a small VM to a bare‑metal edge device.

Finally, the performance numbers reported by the project—tens of thousands of calls per second on a modest AWS c8i.4xlarge instance—show that the stack can handle carrier‑scale loads while still fitting into the “single binary” model. For developers, this combination of safety, simplicity and raw throughput makes rvoip a practical foundation for any Rust‑based communications product.

## Limits and caveats

The published benchmark only exercises 10‑second call legs, so the reported concurrent‑call count is simply the session‑establishment rate multiplied by that duration. Because long‑call capacity wasn’t measured, we don’t know how rvoip behaves when calls run for minutes or hours, nor how resource usage (CPU, memory, socket buffers) scales as the call‑time window expands. In practice, SBC and carrier datasheets often quote concurrency based on sustained calls, so developers should treat the benchmark’s “concurrent calls” figure as a lower‑bound for short‑lived traffic rather than a guarantee for long‑duration sessions.

All numbers come from a single AWS c8i.4xlarge VM (16 vCPU, 8 cores, 32 GiB RAM) running one rvoip process. Real‑world deployments may run on smaller cloud instances, on‑premise servers, or in multi‑node clusters where load is spread across several processes. Because the benchmark does not include any cross‑node communication or load‑balancing overhead, scaling characteristics on different hardware or in distributed topologies could differ markedly from the single‑VM results.

The tests treat rvoip as a terminating endpoint that answers a call and echoes its media. A full‑mesh B2BUA or SBC would have to manage two legs per session, duplicate signaling, and potentially perform media transcoding or policy enforcement. Those extra responsibilities are not reflected in the published session‑establishment rate or latency numbers, so the figures should not be extrapolated to scenarios where rvoip is used as a relay or media‑processing middlebox.

## Key takeaways

- rvoip is an open‑source Rust library that provides a full SIP/VoIP stack—including SIP, WebRTC, SRTP, and AI voice agents—without requiring external SIP proxies, media servers, or RTP engines.  
- The stack is benchmarked against RFC 7502, measuring Session Establishment Rate (calls per second) on an AWS c8i.4xlarge VM (16 vCPU, 8 cores, 32 GiB RAM).  
- In the benchmark, SIP over TLS achieved a maximum of 8,348 CPS (≈520 CPS per vCPU) with 1 ms p50 and 6 ms p99 setup latency at 90 % load; SIP over UDP achieved a similar 8,256 CPS.  
- When TLS + SRTP (SDES) with G.711 codec was used, the stack handled 1,124 CPS (≈70 CPS per vCPU) with 1 ms p50 and 4 ms p99 setup latency; UDP + RTP with G.711 reached 1,204 CPS (≈75 CPS per vCPU).  
- At twice the measured capacity, rvoip continues to accept calls up to its maximum CPS, rejects excess calls with fast 503 responses, and recovers cleanly when load drops.  
- Interoperability tests show rvoip works with Asterisk, FreeSWITCH, Jambonz, Kamailio, and OpenSIPS, and the examples run on a laptop with only Rust installed.

## Sources

- [Rvoip: VoIP stack in Rust](https://github.com/eisenzopf/rvoip)
- [Typed indexes in Zig](https://lvignoli.eu/posts/2026-11-16-typed-indexes-in-zig/)
- [In defense of lock poisoning in Rust (2025)](https://sunshowers.io/posts/on-poisoning/)
