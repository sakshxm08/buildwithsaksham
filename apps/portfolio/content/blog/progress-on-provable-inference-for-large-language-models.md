---
title: "Progress on Provable Inference for Large Language Models"
description: "When you ask an LLM for an answer, you have no way to verify that the response really came from the model the provider claims—only the token stream is visi"
pubDate: 2026-11-05
category: "AI & LLMs"
readTime: 12
cover: "/blog-covers/progress-on-provable-inference-for-large-language-models.png"
---

When you ask an LLM for an answer, you have no way to verify that the response really came from the model the provider claims—only the token stream is visible. Anthropic’s latest research tackles exactly that gap by introducing cryptographic “provable inference” via zk‑SNARKs, a class of zero‑knowledge proofs that can attest to a model’s identity without revealing its weights. Their FlashProve system can generate a proof for a 1,024‑token request on a 400 B‑parameter mixture‑of‑experts model at roughly 110 tokens / second on a single H100 GPU, with proof sizes around 19 MiB, while using only 4‑bit quantized weights. This represents a 70–95× speedup over prior open‑source approaches and brings provable inference into a practical performance regime.

In this post we’ll walk through the technical highlights of FlashProve—how Anthropic adapted state‑of‑the‑art zk‑SNARK constructions, the trade‑offs of hiding model weights versus architecture, and the open‑source artifacts they released (code, Lean‑based security statements, and a protocol spec). We’ll also explore potential use cases, from consumer‑facing AI products that need model‑authenticity guarantees to internal security pipelines that must audit compliance, and discuss what challenges remain before provable inference becomes a standard component of LLM deployments.

## what happened

Anthropic announced FlashProve, a new system that can generate cryptographic proofs of inference for large language models. The release is accompanied by a technical report, a formal protocol specification, and a full code base that includes a prover and two verifiers—one fast verifier written in C++ and a provably correct verifier expressed in Lean. All of these artifacts, together with the Lean proofs that underpin the top‑level security claims, are made available under the Apache 2.0 license, inviting the community to audit, reuse, and extend the work.

FlashProve focuses on zkSNARK‑based proofs, which hide the model’s weights while allowing a verifier to confirm that a response was produced by the committed model. The team built the system around a 400 billion‑parameter mixture‑of‑experts model, Llama 4 Maverick, and ran it with 4‑bit quantized weights. On a single NVIDIA H100 GPU, FlashProve can generate proofs at roughly 110 tokens per second, producing proof files of about 19 MiB for a 1,024‑token request. This throughput represents a 70–95× reduction in GPU time compared with running the model itself through the open‑source vLLM inference engine.

Beyond the performance numbers, Anthropic highlighted several novel engineering choices that enable FlashProve to be substantially faster than prior open‑source attempts. The system leverages integer arithmetic during the prefill phase and integrates recent advances from the cryptography literature while adhering to well‑established design principles for proof systems. By providing both executable code and formally verified Lean statements, the release aims to give practitioners a concrete, auditable foundation for building applications that require provable inference, from secure model serving to compliance‑oriented AI deployments.

## why it matters

When you call an LLM through a public API, the response arrives as a stream of tokens with no cryptographic link to the model that generated it. In practice this means a provider could silently replace a high‑cost model with a cheaper one, or an attacker who compromises the routing layer could inject altered outputs, and the client would have no way to detect the substitution. Because the token payload alone does not carry provenance, any downstream system that relies on the model’s identity—such as compliance audits or safety‑critical decision loops—must trust the provider’s word rather than a verifiable guarantee. This gap is especially problematic for enterprises that need to prove that a specific, vetted model was used for a regulated task. (Source 1)

Cryptographic proofs of inference close that gap by letting the provider commit to a concrete model and then produce a succinct, publicly verifiable proof that each answer was derived from that exact model. The Anthropic team’s FlashProve system demonstrates that zk‑SNARK‑based proofs can be generated at roughly 110 tokens / second for a 400 B‑parameter mixture‑of‑experts model, with proof sizes around 19 MiB per 1 024‑token request—orders of magnitude faster than earlier open‑source attempts (Source 1). Because the proof hides the model weights while binding the computation to the committed architecture, a verifier can check authenticity without learning proprietary details. This capability enables trust‑critical applications such as secure internal assistants, audit‑ready AI pipelines, and any scenario where regulators require evidence that a declared model performed the inference.

Beyond individual use cases, provable inference becomes a building block in a broader security toolkit for AI deployments. As AI systems move into regulated domains, policymakers are drafting “AI pacing” or model‑audit requirements that effectively demand proof of compliance (Source 1). Having a standardized, cryptographically sound method to attest to model usage lets organizations meet those mandates without exposing trade secrets. When combined with other safeguards—secure model serving, data provenance, and formal verification of software—provable inference helps construct a defense‑in‑depth posture against tampering, model‑substitution attacks, and the technical debt that AI is surfacing across the software stack (Source 2). In short, the ability to prove *what* generated an answer is becoming as essential to AI governance as logging or access control is to traditional IT security.

## how it works (background)

FlashProve is built on zk‑SNARKs, a class of zero‑knowledge succinct non‑interactive arguments.  zk‑SNARKs let a prover convince a verifier that a statement is true without revealing any witness, and they do so with a proof that is both tiny and fast to check.  These properties make them a natural fit for provable inference: the model can attest to having performed a computation while keeping the underlying data hidden, and a client can verify the claim with only a few cryptographic operations.

The system first creates a cryptographic commitment to the model’s weights.  This commitment is a hash‑like object that binds the prover to a specific set of parameters but does not expose them.  During inference, FlashProve runs the model on the user’s prompt and simultaneously generates a zk‑SNARK proof that the output was produced by the committed weights.  The proof therefore guarantees that the response came from the exact model the provider advertised, while the weights themselves remain concealed.  Hiding the architecture is not a design goal; the focus is on protecting the proprietary parameters that give the model its capabilities.

To make the security claims auditable, the top‑level guarantees are expressed in Lean, a formal verification language used for machine‑checked proofs.  The developers have written Lean statements that capture the intended hiding and soundness properties of FlashProve, and they accompany those statements with fully verified theorems.  Because Lean checks each proof mechanically, anyone can inspect the source and be confident that the cryptographic construction satisfies the formal specification without relying on informal reasoning.

Together, the zk‑SNARK foundation, the weight commitment scheme, and the Lean‑checked security statements give FlashProve a rigorous end‑to‑end guarantee: a verifier can trust that a response was generated by the committed model, and the proof of that guarantee has been validated by a theorem prover rather than just by intuition or peer review.

## the key details and numbers

On a single NVIDIA H100 GPU, FlashProve can generate zkSNARK proofs at roughly **110 tokens per second** when handling a 1,024‑token request. That throughput translates to a full proof for a typical request in just under ten seconds, which is fast enough to be considered practical for many real‑time applications. The system achieves this speed by running the model in a 4‑bit quantized mode and using integer arithmetic during the prefill stage, which keeps the arithmetic workload lightweight while still preserving the cryptographic guarantees of the proof.

Each proof produced for a 1,024‑token query occupies about **19 megabytes** of storage. The size is dominated by the cryptographic commitment data that must be transmitted alongside the model’s textual response so that a verifier can check the claim that the response came from the intended model. While 19 MB is larger than a plain text output, it is still manageable for modern network links and storage systems, especially when the proof can be streamed or cached for later audit.

In terms of compute cost, generating a proof with FlashProve consumes **70–95× less GPU time** than running the underlying Llama 4 Maverick model itself through the popular vLLM inference library. This represents a substantial efficiency gain: prior open‑source provable‑inference systems required orders of magnitude more GPU cycles, making them impractical for anything beyond tiny models or batch workloads. The speedup comes from a combination of algorithmic optimizations in the zkSNARK construction and the tight integration of quantized model execution with the proof generation pipeline.

Overall, the numbers show that FlashProve brings provable inference into a performance envelope that is comparable to conventional inference, while still delivering cryptographic assurances that were previously out of reach for large‑scale language models. This opens the door to deploying verifiable AI services without incurring prohibitive hardware costs.

## what it means for developers

Developers can now drop provable inference into existing pipelines without building a cryptographic stack from scratch. The FlashProve release includes a fast verifier written in C++ that runs in milliseconds on a single CPU core, and a formally verified verifier implemented in Lean that is proved correct against the same specification. Because both verifiers expose the same API—accept a proof blob and a token‑level output—they can be swapped in a service’s inference layer just like any other post‑processing step. This means you can keep your preferred model serving stack (e.g., vLLM or a custom GPU server) and add a proof‑checking gate that guarantees the response really came from the committed model.

All of the code, the protocol specification, and the Lean theorems are published under the Apache 2.0 license, so teams can clone the repository, run the interactive visualizer, and walk through the top‑level security statements that Claude and the authors formalised. The open‑source artifacts make it possible to audit the exact assumptions about model commitment, weight hiding, and proof generation, and to modify the verifier or the proof format to match a proprietary model architecture or a different quantisation scheme. Because the Lean proofs are machine‑checked, any change to the verifier can be re‑verified automatically, giving you confidence that the security guarantees still hold after you adapt the system.

Having a cryptographic proof of model provenance unlocks product ideas that were previously speculative. A tamper‑evident AI API could attach a zkSNARK proof to every response, allowing downstream clients to reject any payload that fails verification—useful for high‑value financial or medical applications where model integrity is a compliance requirement. Similarly, an auditable compliance pipeline could log proofs alongside model outputs, providing regulators with verifiable evidence that a specific, approved model generated the data. In practice, this turns “trust the provider” into “verify the provider” and opens a new class of services where provable inference becomes a first‑class security feature.

## limits and caveats

FlashProve’s privacy guarantees stop at the weight level. The system commits to a specific model and then produces zk‑SNARK proofs that hide the numeric parameters, but the underlying architecture—layer types, depth, and the mixture‑of‑experts routing logic—is still exposed to anyone who verifies a proof. In practice this means a verifier can confirm that the response came from “the claimed model family” while still learning the model’s structural blueprint, which may be sensitive for some proprietary designs.

Even though FlashProve is dramatically faster than earlier open‑source provable‑inference pipelines, it still imposes a measurable cost on top of raw inference. A 1,024‑token request generates a proof of roughly 19 MB, and the prover on a single H100 GPU runs at about 110 tokens per second. That throughput is 70–95 × slower than the same model running without proof generation in vLLM, and the extra data transfer for the proof adds bandwidth overhead that can be non‑trivial in latency‑sensitive applications. Developers will need to weigh these factors against the security benefits, especially when scaling to high‑throughput services.

The authors are explicit that FlashProve represents an intermediate step rather than a finished solution. The research post calls the work “intermediate progress” and invites the community to build on the artifacts released under Apache 2.0. Open questions remain around reducing proof size, tightening the performance gap, and extending the hiding guarantees to model architecture. Until those challenges are addressed, widespread deployment will likely be limited to niche scenarios where the current trade‑offs are acceptable.

## Key takeaways

- Anthropic’s FlashProve system uses zkSNARKs to cryptographically prove that a response was generated by a committed LLM, preventing undetectable model substitution.  
- For a 400‑billion‑parameter mixture‑of‑experts model (Llama 4 Maverick) quantized to 4‑bit, FlashProve generates proofs at roughly 110 tokens per second on a single H100 GPU, with each 1,024‑token proof about 19 MB in size.  
- The proof generation overhead is about 70–95 × the GPU time required to run the model itself with vLLM, yet still far faster than prior open‑source provable‑inference systems.  
- The system hides model weights but does not conceal the model architecture, and its security guarantees are expressed in auditable Lean statements with accompanying formal proofs.  
- Anthropic released the full codebase, a C++ fast verifier, a Lean‑verified verifier, protocol specifications, and an interactive visualizer under the Apache 2.0 license for community use and improvement.

## Sources

- [Progress on provable inference for large language models](https://www.anthropic.com/research/provable-inference)
- [AI is forcing us to pay off 40 years of technical debt](https://spectrum.ieee.org/ai-in-cybersecurity-php2shell-vulnerability)
- [From Pixels to Actions - Towards Native Vision-Language-Action Policies](https://arxiv.org/abs/2611.06918)
