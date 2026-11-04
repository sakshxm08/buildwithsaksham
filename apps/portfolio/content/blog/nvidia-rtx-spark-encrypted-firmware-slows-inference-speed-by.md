---
title: "Nvidia RTX Spark Encrypted Firmware Slows Inference Speed by 35% on Linux – What Developers Need to Know"
description: "Nvidia’s newest RTX Spark laptops look like a dream for on‑the‑go AI work, but a hidden Windows‑only power controller is turning that promise into a bottle"
pubDate: 2026-11-04
category: "AI & LLMs"
readTime: 12
cover: "/blog-covers/nvidia-rtx-spark-encrypted-firmware-slows-inference-speed-by.png"
---

Nvidia’s newest RTX Spark laptops look like a dream for on‑the‑go AI work, but a hidden Windows‑only power controller is turning that promise into a bottleneck on Linux. When you plug the machine into wall power, the GPU’s clock collapses from the 2 GHz‑plus it enjoys on Windows to roughly 780 MHz on native Linux, slashing token throughput from about 65 tokens / s on a 120 B‑parameter model to just 13.9 tokens / s. The culprit is an encrypted firmware power table that only the Windows driver can decrypt, leaving the open‑source driver blind to the correct boost frequencies.

In this post we’ll walk through what the slowdown looks like in real benchmarks, why the encrypted platform controller matters, and what work‑arounds are viable today—dual‑boot quirks, memory‑split tweaks, and the practical middle ground of WSL. We’ll also outline what a proper fix would require from Nvidia and what you, as a developer building or deploying large language models, should keep an eye on when choosing an RTX Spark machine for Linux‑first AI pipelines.

## What happened

Linux does run on the Nvidia RTX Spark laptops – the open‑source kernel driver can see the GPU and you get a full desktop, 4K output and all the usual peripherals. The surprise shows up once the machine is plugged into wall power: the driver caps the GPU clock at roughly 780 MHz. On the same hardware under Windows the clock climbs past 2 GHz, which is the speed the chip was designed to hit when it has a power budget.

That clock difference translates directly into inference throughput. Running a 120‑billion‑parameter model (GPT‑OSS‑120B) on Windows delivers about 65 tokens per second, while the same model on native Linux manages only around 14 tokens per second – roughly 35 % of the Windows figure. The slowdown is consistent across other benchmarks, indicating the throttling is not a one‑off glitch but a systematic limitation of the Linux stack on these laptops.

The root cause is an encrypted power‑management firmware table that lives inside Nvidia’s Platform Controllers and Framework component. Only the Windows driver can decrypt this table and apply the correct boost frequencies; the Linux driver lacks the logic to read it, so it falls back to a safe, low‑power clock. Because the firmware is encrypted, there is no simple workaround – the driver can’t reconstruct the missing data without Nvidia’s cooperation.

In practice this means developers who need full GPU performance for AI workloads should either stay on Windows, use WSL (which rides the Windows driver and retains the boost clocks), or wait for Nvidia to port the power‑management logic into its Linux driver. Until then, native Linux on RTX Spark laptops will remain a throttled platform for heavy inference.

## Why it matters

The RTX Spark line is sold as a portable AI workstation: the laptops ship with high‑end GPUs, up to 128 GB of unified memory, and the same silicon that powers Nvidia’s DGX Spark desktop. For developers who need to run large language models locally, that promise hinges on getting desktop‑class throughput on a laptop. When the Linux driver can’t read the encrypted power‑table, the GPU stalls at roughly 780 MHz instead of the 2 GHz+ it reaches on Windows, collapsing token‑generation rates from about 65 tokens / s to under 14 tokens / s. In practice, the performance gap means a model that would finish a 120‑billion‑parameter inference in seconds on a DGX Spark now takes minutes on the same hardware under Linux.

Most of the AI tooling ecosystem—vLLM, SGLang, and similar inference servers—was built with Linux as the default target. Developers therefore assume that a Spark laptop will deliver the same raw speed they see on a DGX Spark or on a workstation running Ubuntu. The reality is that, without the Windows‑only platform controller, Linux can’t unlock the GPU’s boost clocks, so the expected parity simply doesn’t exist. This isn’t a marginal slowdown; the benchmark in the MindStudio blog shows native Linux delivering only 13.9 tokens / s versus 65.4 tokens / s on Windows, a roughly 80 % loss that directly impacts experiment turnaround time and cost.

Because the bottleneck is baked into the firmware, developers are forced into a trade‑off. They can stay in a full Linux environment and accept crippled throughput, or they can run Linux‑first stacks inside Windows—via WSL or a Windows‑based IDE—where the Windows driver preserves the GPU’s boost behavior. WSL currently offers near‑Windows performance (65 tokens / s) while still letting you invoke vLLM, SGLang, and other Linux‑centric tools. Until Nvidia ships a Linux driver that can decrypt the power table, the only viable path for high‑speed inference on an RTX Spark laptop is to stay on the Windows side, which undermines the very reason many developers bought the machine.

## How it works (background)

The RTX Spark platform ships with a Windows‑only software layer called **Nvidia Platform Controllers and Framework**. This component sits between the operating system and the firmware that governs power delivery, translating the GPU’s power‑budget requests into actual voltage and frequency settings. On Windows the driver can call into this framework, which then reads a signed power‑table stored in the GPU’s firmware and applies the appropriate boost frequencies for the workload.

Linux does not have an equivalent driver or user‑space service, so the encrypted power‑table remains unreadable. The firmware is designed to expose the table only to the Windows controller; when it cannot be decrypted, it falls back to a safe‑mode configuration. This fallback is hard‑coded in the firmware and does not depend on the OS, but it deliberately limits the GPU’s clock to a conservative value—about **780 MHz**—to stay within the power envelope that the firmware can guarantee without the full table.

Because the boost frequencies are never applied, the GPU never reaches the 2 GHz‑plus clocks it can achieve on Windows. The result is a dramatic reduction in raw compute throughput: benchmarks on a 120‑billion‑parameter model show native Linux delivering roughly **14 tokens / s**, compared with **65 tokens / s** on Windows (or WSL, which reuses the Windows driver stack). The throttling happens only when the laptop is plugged in; on battery the firmware already runs at a lower power budget, so the difference is less noticeable.

In practice, the only way to regain the higher clocks on Linux is for Nvidia to port the Platform Controllers and Framework logic into the open‑source driver stack. Until that happens, developers who need full GPU performance either stay on Windows, use WSL to run Linux tools on the Windows driver, or accept the roughly **35 %** speed penalty that the encrypted firmware imposes on native Linux installations.

## The key details and numbers

On the RTX Spark laptop, the Windows driver lets the GPU run at its full boost clock, and you see roughly **65 tokens / s** when running a 120 billion‑parameter model. By contrast, the same hardware under a native Linux install stalls at about **13.9 tokens / s** – a drop of roughly 35 % of the Windows throughput. The slowdown isn’t coming from the model or the CUDA libraries; it’s tied to the encrypted power‑management firmware that Linux cannot decode, which caps the GPU clock at around 780 MHz when the machine is plugged in.

If you keep Windows in the loop and use WSL 2, the picture changes dramatically. WSL runs on top of the Windows driver stack, so the GPU retains its full boost frequency. Benchmarks on the same laptop show **65.1 tokens / s** in WSL, essentially identical to native Windows performance. This makes WSL the practical workaround for developers who need Linux‑first tooling (like vLLM) without sacrificing speed.

The DGX Spark desktop provides a useful reference point. Shipping with Nvidia’s own Linux driver build, the DGX Spark reaches **61 tokens / s** on the same 120 B model. That figure confirms the hardware is fully capable of high‑throughput inference when the correct driver and firmware stack is present. In other words, the dramatic slowdown on native Linux isn’t a limitation of the GPU itself but a missing piece in the Linux driver ecosystem for the RTX Spark platform.

## What it means for developers

If you need the GPU to run at its full boost frequency on Linux today, the only reliable path is to keep Windows in the loop and run your Linux workloads inside WSL. Because the Windows driver stack still has access to the encrypted power‑table that the platform controller decrypts, WSL inherits the same 2 GHz‑plus clocks you see on a native Windows install. A native Linux boot, by contrast, caps the RTX Spark GPU at roughly 780 MHz when the laptop is plugged in, which translates to a 35 % drop in inference throughput for large models. While WSL adds a thin compatibility layer, it preserves the driver‑level performance you need for token‑heavy workloads without sacrificing the Linux‑first tooling ecosystem.

Another practical tweak you’ll have to make is adjusting the unified memory split. The RTX Spark laptops ship with 96 GB of shared memory by default, and only Windows exposes a UI to re‑allocate that pool between CPU and GPU. Linux currently has no equivalent knob, so the GPU often ends up with a fraction of the RAM needed for 120‑billion‑parameter models. Before you launch a big model, you’ll want to boot into Windows, change the split to give the GPU a larger slice, and then switch back to WSL (or reboot into Linux) so the new allocation is respected. Skipping this step can leave the GPU starved for memory, further throttling performance beyond the clock‑speed issue.

A permanent fix, however, isn’t something we can implement on our own. The root cause is the missing power‑management logic in the Linux driver—the hidden Nvidia Platform Controllers and Framework component that decrypts the firmware’s power table. If Nvidia ports that controller into its Linux driver, the laptop would behave like a portable DGX Spark, delivering desktop‑class boost clocks and full unified‑memory configurability on native Linux. Until that driver update lands, the best we can do is rely on WSL for full performance and manually manage the memory split via Windows.

## Limits and caveats

The Linux driver does let you keep GPU acceleration and even drive a 4K @ 120 Hz panel, but the chip never reaches its Windows‑only boost clocks. Once the laptop is plugged into AC power the firmware‑controlled power table forces the GPU down to roughly 780 MHz, so you’ll see the same throttling that caused the 35 % inference slowdown. On battery the clock stays a bit higher, but you still lose a large chunk of the theoretical throughput that the RTX Spark can deliver on Windows.

Getting Linux up and running isn’t a simple “install‑and‑go” step. The community found that Debian‑based installers are more tolerant than Arch‑derived ones, which tend to produce a flickering, unstable display on the MSI Prestige chassis. Even with Debian you’ll have to bring a USB‑Ethernet dongle for the initial network setup, and then apply a handful of work‑arounds to make the keyboard, touchpad and display stay stable after boot. Those tweaks are documented in the hands‑on guide, but they add friction that most developers aren’t prepared for when they expect a clean dual‑boot experience.

Memory handling is another pain point. The laptop reserves a 96 GB unified pool for the GPU by default, and Linux currently has no way to adjust that split. Only Windows exposes a setting to re‑allocate memory between CPU and GPU, meaning Linux sees just a sliver of RAM for general use while the bulk remains locked to the GPU. This limitation can quickly become a bottleneck for workloads that need more system memory than the GPU can consume.

In practice, the most reliable path today is to run your AI stack inside WSL 2, which inherits the Windows driver’s full boost behavior while still letting you use Linux‑first tools. Until Nvidia ships a Linux‑compatible version of the Platform Controllers and Framework component, developers will have to weigh the convenience of a pure Linux install against the steep performance and usability trade‑offs.

## Key takeaways

- On Linux the RTX Spark GPU is throttled to about 780 MHz when plugged in, compared with roughly 2.2 GHz on Windows, because the power‑management firmware table is encrypted and only the Windows driver can decrypt it.  
- This clock collapse reduces inference throughput from around 65 tokens / second (Windows/WSL) to roughly 14 tokens / second on native Linux – a slowdown of about 35 percent.  
- The root cause is a Windows‑only component called the Nvidia Platform Controllers and Framework, which manages power delivery and has no Linux equivalent.  
- Memory allocation is also limited: the laptop reserves 96 GB of unified memory for the GPU by default, and only Windows exposes a setting to adjust the split, preventing Linux from accessing the full RAM pool.  
- For now, running AI workloads through WSL (which uses the Windows driver stack) retains full GPU boost and matches Windows performance, making it the practical workaround.  
- A permanent fix requires Nvidia to port the platform controller’s power‑management logic into its Linux driver, effectively bringing the laptop’s performance in line with the DGX Spark desktop.

## Sources

- [Nvidia RTX Spark encrypted firmware slows inference speed to 35% on Linux](https://www.mindstudio.ai/blog/linux-nvidia-rtx-spark-laptop)
- [Postman silently auto-installs AI plugins and attempts to share all API data](https://github.com/postmanlabs/postman-app-support/issues/14370)
- [We're training a Figma-fluent editing model](https://www.figma.com/blog/training-a-figma-fluent-editing-model/)
