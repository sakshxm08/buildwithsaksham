---
title: "A datetime library for Rust"
description: "A new datetime library for Rust just hit 1.0, and it’s already being used in production by projects like Cargo, Starship, and even AWS LLRT’s Temporal impl"
pubDate: 2026-11-16
category: "Tools & Automation"
readTime: 10
cover: "/blog-covers/a-datetime-library-for-rust.png"
blocks: {"tldr":["Jiff 1.0 released on Nov 15 2026 as a stable datetime library for Rust.","Adopted in production by at least eight major projects (uv, Cargo, Starship, fd, Nushell, mise, Jujutsu, uutils/coreutils) and AWS LLRT.","Focuses on time‑zone handling, automatically managing DST and leap‑seconds.","Author pledges to keep the 1.0 API stable indefinitely unless a serious defect appears."],"stats":[{"value":"1.0","label":"Stable version released"},{"value":"Nov 15 2","label":"Release date"},{"value":"∞","label":"Indefinite stability promise"}],"chart":null,"flow":{"kind":"steps","title":"Jiff 1.0 rollout","steps":[{"label":"Release","text":"Version 1.0 launched on Nov 15 2026 with a stable API."},{"label":"Adoption","text":"Eight major Rust tools and AWS LLRT integrate Jiff for datetime handling."},{"label":"Stability pledge","text":"Maintainer commits to keep the API unchanged indefinitely, barring critical bugs."}]}}
slides: ["/blog-covers/a-datetime-library-for-rust-slide-1.png","/blog-covers/a-datetime-library-for-rust-slide-2.png"]
---

A new datetime library for Rust just hit 1.0, and it’s already being used in production by projects like Cargo, Starship, and even AWS LLRT’s Temporal implementation. Jiff (pronounced “gif” with a soft g) puts time‑zone handling front and center, automatically taking care of the daylight‑saving quirks that usually trip us up. The release promises a stable API that the ecosystem can rely on for the long haul, so you won’t have to worry about sudden breaking changes once you adopt it.

In this post we’ll walk through Jiff’s core types, show how to parse, format, and manipulate dates and times, and compare its ergonomics to the older crates you may already know. You’ll see practical examples you can drop into a fresh Cargo project, learn when Jiff is the right tool for your codebase, and get a quick look at its locale‑sensitive formatting via ICU4X. By the end you’ll have a clear sense of whether Jiff should replace the datetime handling you’re currently using.

## what happened

On Nov 15 2026 the author announced the 1.0 release of **Jiff**, a new datetime library for Rust. The post frames the launch as a milestone: Jiff has already been adopted by a range of production projects—uv, Cargo, Starship, fd, Nushell, mise, Jujutsu, uutils/coreutils, and even an AWS LLRT Temporal implementation—so the move to 1.0 is meant to cement its role as a dependable, long‑term building block for the Rust ecosystem.  

Jiff 1.0 is positioned explicitly as a stable foundation that other crates can rely on without fearing frequent breaking changes. The author pledges to keep the 1.0 API stable “indefinitely” unless a serious defect is discovered, because semver‑incompatible releases would cause significant pain for downstream libraries that already expose Jiff in their public APIs. This commitment signals that Jiff is intended to become a shared dependency rather than a niche utility.  

The release is accompanied by a comprehensive API tour that walks readers through the core capabilities. It demonstrates how to parse and format timestamps, work with time‑zone information (which Jiff puts front‑and‑center), and perform calendar arithmetic such as date addition, subtraction, and rounding. The tour also covers the `jiff::fmt` module for locale‑sensitive formatting via ICU4X, and shows how to use the `FromStr` and `Display` traits for seamless string conversion.  

Overall, the announcement marks Jiff’s transition from a widely used experimental crate to a production‑grade library that aims to simplify datetime handling across the Rust world. By delivering a full‑featured, well‑documented API and committing to long‑term stability, the author hopes Jiff will become the go‑to datetime solution for future Rust projects.

## why it matters

Jiff’s focus on time‑zone handling means you rarely have to write custom logic for daylight‑saving transitions. The API makes the zone part of every date‑time value, so conversions and arithmetic automatically respect the myriad DST rules that other Rust crates often leave to the caller. In practice this reduces bugs that only surface when clocks jump forward or backward, and it lets you keep the rest of your code clean and deterministic.

The library isn’t just a prototype; it’s already part of the production stack for a handful of high‑profile Rust projects. Tools such as **uv**, **Cargo**, **Starship**, **fd**, **Nushell**, **mise**, **Jujutsu**, and the **uutils/coreutils** collection all depend on Jiff for their date‑time needs. AWS even uses it as the foundation for a Temporal implementation in the **LLRT** runtime. That breadth of adoption signals that the crate has been battle‑tested in real‑world workloads and that its ergonomics and performance meet the expectations of large, maintained codebases.

Because Jiff has declared a 1.0 commitment, the public API is promised to stay stable unless a serious defect is discovered. For crates that expose Jiff types in their own public interfaces, this guarantee is crucial: a breaking semver bump would ripple through downstream projects, forcing widespread rewrites. By pledging minimal breaking changes, Jiff positions itself as a reliable building block for the ecosystem, encouraging other developers to adopt it without fearing future incompatibilities.

Together, the robust time‑zone handling, proven production use, and long‑term stability make Jiff more than a convenient utility—it becomes a cornerstone for any Rust application that needs trustworthy datetime logic. This is why the library matters to us as developers building on top of the Rust ecosystem.

## how it works (background)

Jiff sits at the sweet spot where a computer’s notion of time—Unix time, a count of seconds since the epoch—meets the way humans talk about time: the Gregorian calendar together with either a 12‑hour or 24‑hour clock. By treating these two models as a single domain, the library can translate raw timestamps into civil dates and times without exposing the caller to the underlying arithmetic. This “intersection” is the core of any datetime crate, but Jiff makes the conversion an explicit part of its API rather than a hidden implementation detail.

All of the messy rules that make civil time hard to get right are baked into Jiff’s internals. Leap seconds, which occasionally insert an extra second into UTC to keep it aligned with Earth’s rotation, are accounted for automatically. Time‑zone offsets—including the sometimes‑negative offsets used in the western hemisphere—and the complex daylight‑saving‑time (DST) transition rules are also handled behind the scenes. Because the library encapsulates this domain logic, you can’t accidentally create an invalid timestamp or forget to apply a DST shift; the API forces you to work with a safe, high‑level representation.

The public surface revolves around three core types. `DateTime` represents a specific moment in a particular time zone, `Span` models a range of time (useful for calendar calculations), and `Duration` captures a fixed amount of elapsed time. Each type implements `FromStr`, so parsing strings like `"2024-03-10 02:30:00-05:00"` is straightforward, and they also implement `Display`, giving you nicely formatted output without extra boilerplate. Together these pieces let you parse, manipulate, and render dates and times while the library silently takes care of the underlying complexities.

## the key details and numbers

Jiff 1.0 is pronounced like “gif” with a soft g, the same sound you hear in “gem”. The author emphasizes this pronunciation right at the start of the announcement, so you’ll hear it in talks and on the website without any confusion about a hard g. It’s a tiny detail, but it shows the care taken to make the library approachable from the very first interaction.

The library has already been adopted by a solid slice of the Rust ecosystem. Production code now depends on Jiff in at least eight well‑known projects: **uv**, **Cargo**, **Starship**, **fd**, **Nushell**, **mise**, **Jujutsu**, and **uutils/coreutils**. In addition, AWS’s LLRT uses Jiff as the foundation for its Temporal implementation. Seeing Jiff surface in tools ranging from package managers to command‑line utilities demonstrates that it’s not just a hobby crate—it’s becoming a building block for larger, publicly‑exposed APIs.

Looking ahead, the maintainer has pledged to keep the library at version 1.0 indefinitely, unless a “significant defect” is uncovered in the API. This commitment means that semver‑incompatible releases are deliberately avoided, because they would cause pain for the many downstream crates that already list Jiff as a public dependency. By treating 1.0 as a long‑term stable base, the library aims to provide the reliability that other projects need when they expose Jiff types in their own public interfaces.

Overall, the combination of a clear naming convention, broad adoption across major Rust tools, and a firm stability policy makes Jiff 1.0 a practical choice for anyone looking to add robust datetime handling to their Rust code.

## what it means for developers

Developers can finally stop wrestling with the quirks of daylight‑saving time. Jiff puts time‑zone handling front‑and‑center, so when you create a `Timestamp` in a given zone the library automatically applies the correct offset and transition rules. That means you don’t have to write custom DST tables or special‑case “spring‑forward” and “fall‑back” logic, which is a common source of subtle bugs in services that schedule jobs, log events, or display user‑facing times. By delegating that complexity to Jiff, the code you ship stays focused on business rules rather than on calendar edge cases.

Another practical win is the stability promise that comes with the 1.0 release. The author explicitly commits to avoiding semver‑incompatible changes unless a serious defect is discovered, because Jiff is intended to be an ecosystem building block. For crates that depend on Jiff, this translates into a predictable upgrade path: you can bump the version in `Cargo.toml` and expect the same API surface, which reduces the maintenance overhead that usually accompanies date‑time libraries that evolve rapidly.

Formatting dates for end users also becomes trivial. The `jiff::fmt` module offers a full‑featured, strftime‑compatible API, and it is already wired to ICU4X for locale‑aware output. You can ask Jiff to render a timestamp in the user’s language and calendar conventions without pulling in a separate internationalisation crate or writing glue code. This out‑of‑the‑box support is especially handy for CLI tools, web services, or any application that needs to present times in multiple locales.

All of these pieces—reliable DST handling, guaranteed API stability, and built‑in locale‑sensitive formatting—mean that when you adopt Jiff you spend less time defending against time‑related bugs and more time delivering features. It fits naturally into the Rust ecosystem, and because it’s already used in production projects like Cargo, Starship, and Nushell, you can trust that the library has been battle‑tested in real‑world workloads.

## limits and caveats

Jiff’s API deliberately hides a lot of the fiddly details that traditionally plague datetime work. That makes everyday use pleasant, but it also means you can’t reach into the internals to tweak things like custom time‑zone transition rules or exotic leap‑second handling. If you need to model a jurisdiction that deviates from the standard tzdata definitions, you’ll end up writing your own wrapper or falling back to a lower‑level library, because Jiff doesn’t expose the knobs required for that level of control.

The library focuses on the Gregorian calendar and the civil‑time concepts most applications need today. It does not try to be a universal chronicle of every calendar ever used, so things like the Julian, Islamic, or historic regional calendars are out of scope. For projects that must represent dates before the Gregorian reform or need to interoperate with legacy systems that use non‑Gregorian reckonings, Jiff will have to be supplemented with additional conversion logic or a different crate.

Pulling Jiff into a project also introduces a new public dependency. While the crate is already used by several major Rust tools (e.g., Cargo, Starship, Nushell), each additional dependency adds to compile‑time, incremental build caching, and the final binary size. Teams should weigh the convenience of Jiff’s high‑level API against these costs, especially in environments where binary footprint or build speed is a primary concern.

Finally, because Jiff is positioned as an ecosystem‑wide building block, any breaking change in a future major release could ripple through downstream crates. The maintainers have pledged to avoid semver‑incompatible releases lightly, but the very fact that a breaking change would be painful means you should keep an eye on the changelog and be prepared to allocate time for migration if a major bump ever lands.

## Key takeaways

- Jiff reached its 1.0 release on November 15 2026, marking a stable API intended for long‑term use in the Rust ecosystem.  
- The library places time‑zone handling at the core of its API, automatically managing many daylight‑saving‑time edge cases for developers.  
- Jiff is already used in production by several major Rust projects, including uv, Cargo, Starship, fd, Nushell, mise, Jujutsu, uutils/coreutils, and an AWS LLRT Temporal implementation.  
- The author commits to avoiding semver‑incompatible releases unless a critical defect is discovered, to keep Jiff a reliable public dependency.  
- Jiff provides locale‑sensitive formatting through integration with ICU4X, enabling developers to format dates and times according to regional conventions.

## Sources

- [A datetime library for Rust](https://burntsushi.net/jiff/)
- [Periodic-Oriented Programming for FIRST Robotics](https://bvisness.me/periodic-oriented-programming/)
- [Migrating from GitHub to Codeberg](https://yorickpeterse.com/articles/migrating-from-github-to-codeberg/)
