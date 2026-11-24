---
title: "GitHub Actions Accepts Invalid YAML – What This Means for Your CI/CD Pipelines"
description: "GitHub Actions has quietly been accepting YAML that violates the official spec. A recent TL;DR post shows that the platform’s parser (likely YamlDotNet 5.3"
pubDate: 2026-11-24
category: "Tools & Automation"
readTime: 10
cover: "/blog-covers/github-actions-accepts-invalid-yaml-what-this-means-for-your.png"
blocks: {"tldr":["GitHub Actions uses YamlDotNet (v5.3.0) which accepts flow‑style strings without required indentation, violating YAML 1.2.2 § 8.2.3.","The bug persists in newer YamlDotNet releases up to 18.1.0 because the single‑quoted guard was never fixed.","Tools like zizmor flag the workflow as invalid, while GitHub runs it fine, causing hidden incompatibilities.","Developers must treat GitHub‑specific YAML as a de‑facto dialect or add strict validation steps in CI."],"stats":[{"value":"5.3.0","label":"YamlDotNet version used by GitHub Actions"},{"value":"18.1.0","label":"Latest YamlDotNet version tested"},{"value":"2018","label":"Year YamlDotNet 5.3.0 was released"},{"value":"1","label":"Space required for indentation per spec"}],"chart":null,"flow":null}
slides: ["/blog-covers/github-actions-accepts-invalid-yaml-what-this-means-for-your-slide-1.png","/blog-covers/github-actions-accepts-invalid-yaml-what-this-means-for-your-slide-2.png"]
---

GitHub Actions has quietly been accepting YAML that violates the official spec. A recent TL;DR post shows that the platform’s parser (likely YamlDotNet 5.3.0) lets workflows pass even when a step contains a flow‑style string that isn’t indented enough, something YAML 1.2.2 explicitly forbids (§ 8.2.3). The bug has been around for years, surfacing when tools like zizmor reject a perfectly functional‑looking workflow because the underlying parser flags the same construct as invalid. In practice this means a workflow that runs fine on GitHub might break when you lint it locally or run it through a stricter CI tool, and you can’t rely on a conforming YAML parser to reproduce GitHub’s behavior.

In this post we’ll walk through a concrete example of the offending snippet, explain why the spec demands the extra indentation, and dig into the parser versions involved (YamlDotNet 5.3.0 through 18.1.0). We’ll also discuss how to spot these hidden incompatibilities in your own pipelines, what work‑arounds exist, and whether you should adjust your linting strategy or wait for GitHub to tighten its YAML handling.

## What happened

GitHub Actions let a workflow step slip through its parser even though the YAML used for the step violates the YAML 1.2 specification. The offending snippet defines a `json:` key with a multi‑line flow‑style string, written as  

```yaml
json : ' { "key": "npm-remote", "rclass": "remote", "packageType": "npm", "url": "https://registry.npmjs.org" } '
```  

According to the spec (YAML 1.2.2 § 8.2.3), a flow‑style node that lives inside a block‑style collection must be indented at least one space more than its parent. In the snippet the flow‑style string starts on the same indentation level as the `json:` key, which makes the document invalid YAML.

The problem surfaced when the static analysis tool **zizmor** rejected the workflow as non‑conforming. The tool flagged the same rule that GitHub’s own parser ignored, exposing a discrepancy between the official YAML rules and the parser that powers Actions. The author of the report noted that nothing else about the step looked unusual—just the misplaced flow‑style string—yet the parser accepted it without complaint.

Investigation traced the behavior back to the YAML library used by GitHub Actions, which appears to be **YamlDotNet** version 5.3.0. Even upgrading to the latest release (18.1.0 at the time of writing) does not resolve the bug because the guard that rejects single‑quoted flow nodes (`!isSingleQuoted`) remains unchanged. A 2020 patch to YamlDotNet only addressed the double‑quoted case, leaving the single‑quoted scenario unhandled.

The net effect is that a workflow that would be rejected by a spec‑compliant parser can still run on GitHub Actions. For teams that rely on linting tools like zizmor, this creates a silent divergence: the CI pipeline may accept configurations that are technically invalid, potentially hiding subtle formatting errors that could cause trouble when the same YAML is processed elsewhere.

## Why it matters

The fact that GitHub Actions will happily run a workflow that violates the YAML 1.2 specification means any tool that expects a standards‑compliant document can stumble over a file that works fine on GitHub. In practice, linters, static‑analysis plugins, or custom generators that parse the same `.yml` with a strict parser will reject it, breaking CI/CD pipelines that rely on those checks before the workflow even reaches the runner. This mismatch forces teams to maintain two divergent sets of expectations: one for GitHub’s internal parser and another for the tools that enforce the spec.  

When a developer runs into a mysterious “invalid YAML” error from a third‑party validator, the most likely cause is the same lax handling that GitHub uses. Because the workflow still executes on GitHub, the problem can look like a bug in the action itself rather than a parsing issue, leading to wasted debugging time and potentially delaying deployments. The extra back‑and‑forth—checking the file locally, fixing it to satisfy a linter, then re‑testing on GitHub—adds friction to the development cycle without delivering any functional benefit.  

The root of the issue appears to be GitHub’s choice of YAML parser. The blog post notes that Actions relies on **YamlDotNet 5.3.0**, a .NET library that still exhibits the same bug even in its latest 18.1.0 release (the problem survives a 2020 patch that only addressed double‑quoted strings). Since YamlDotNet diverges from the official spec on rule 8.2.3, the bug suggests there could be other hidden incompatibilities lurking in the platform’s handling of YAML.  

In short, the discrepancy forces us to treat GitHub‑specific YAML as a de‑facto dialect, complicating tooling integration and increasing the risk of silent failures. Until the parser is aligned with the spec, we should treat any workflow that passes GitHub’s checks but fails a conforming parser as suspect, and consider adding a step that validates the file with a strict YAML library as part of the CI pipeline.

## How it works (background)

YAML 1.2 § 8.2.3 is explicit about how flow‑style nodes must be indented when they appear inside a block collection (a map or sequence). The rule says the flow node has to start at least one space farther to the right than the parent’s indentation level. In practice this means a line like  

```yaml
json: '
  { "key": "value" }
'
```  

is valid only if the opening quote is indented more than the `json:` key. The example that triggered the issue in GitHub Actions places the opening quote on the same column as the parent key, which violates the spec.

GitHub Actions’ workflow parser appears to be built on YamlDotNet 5.3.0, a .NET library that was released in 2018. The same parsing behaviour persists even when the library is upgraded to the current 18.1.0 release, indicating that the underlying bug is not fixed in newer versions. The parser still accepts the improperly indented flow‑style string, effectively ignoring the rule from § 8.2.3.

The root of the problem can be traced to a 2020 patch to YamlDotNet (issue #467). That change addressed the double‑quoted variant of the rule—where the flow node is wrapped in `"…"`. The fix added a guard for double‑quoted strings but left the single‑quoted path untouched, as the YAML test suite at the time only exercised the double‑quoted case. Consequently, a single‑quoted flow‑style node that is not indented enough continues to be treated as valid by the library, and by extension, by GitHub Actions.

## The key details and numbers

The parser that GitHub Actions relies on is YamlDotNet 5.3.0, which was first released in 2018. Even after the library was bumped to the current 18.1.0 release, the same bug remains – the code path that checks for a single‑quoted flow‑style node still contains the faulty `!isSingleQuoted` guard. In practice this means that the parser will accept a YAML document that violates the spec, and the problem is not solved simply by upgrading the dependency.

What triggers the failure is a subtle indentation rule for flow‑style nodes nested inside a block collection. YAML 1.2.2 § 8.2.3 requires the flow node to be indented at least one space more than its parent. In the offending workflow snippet the only difference between a valid and an invalid version is a single space before the closing brace of a multi‑line flow‑style string. That one‑character shift is enough to make the document non‑conforming, yet Actions still processes it as if it were correct.

The community has been tracking the problem in the tree‑sitter‑yaml project. The issue was opened as #36, where users reported that the parser accepted the invalid indentation. A later attempt to “fix” the behavior was rolled back with pull request #51, which explicitly reverts the change that tried to enforce the rule. These references show that the bug is recognized upstream, but no concrete fix has landed in the version of YamlDotNet that Actions uses.

## What it means for developers

When you write a GitHub Actions workflow you can’t rely on a generic YAML linter to catch everything. The platform’s own parser is more permissive than the YAML 1.2 spec, so a file that a linter flags as invalid may still run in Actions, and the opposite can happen when a spec‑compliant tool rejects a workflow that GitHub silently accepts 【SOURCE 1】. Because of this mismatch, the safest way to verify that a workflow behaves as you expect is to push it to a real repository and let GitHub evaluate it. Running a quick “dry‑run” (e.g., using `workflow_dispatch` or a temporary branch) gives you the same feedback you’ll see in production without having to wait for a full CI cycle.

If you share the same YAML files across different tools—such as a self‑hosted runner, a static‑analysis step, or a documentation generator—you need to keep the files strictly conformant to the YAML specification. Otherwise, a tool that follows the spec may reject the file, leading to hidden failures that only surface when the workflow is executed on GitHub. This divergence can be especially problematic in monorepos where the same workflow definition is referenced by multiple pipelines.

A practical mitigation is to add a validation step to your own CI pipeline. You can use a spec‑compliant parser like `yamllint` or a language‑specific library (e.g., `ruamel.yaml` for Python) to parse every workflow file before it is merged. If the parser throws an error, the build fails early, prompting you to fix the syntax rather than discovering the issue later in GitHub Actions. This extra gate keeps your workflows portable and reduces the risk of subtle bugs caused by the platform’s lenient parsing.

## Limits and caveats

GitHub hasn’t published any roadmap that promises full YAML‑spec conformance for Actions, and the parser they use remains a proprietary component. The evidence points to YamlDotNet 5.3.0 (released in 2018) as the underlying library, and even the latest release of YamlDotNet 18.1.0 still exhibits the same bug (the `!isSingleQuoted` guard). Because the parsing engine is part of GitHub’s internal stack, we can’t influence its upgrade schedule; the issue will linger until the GitHub team decides to ship a fix or replace the parser entirely.

At the moment the only documented deviation is the acceptance of a single‑quoted flow‑style string inside a block collection, which violates YAML 1.2 § 8.2.3. Other kinds of spec violations—such as incorrect handling of double‑quoted flow nodes, indentation errors, or anchor usage—haven’t been observed to behave the same way, and they may still be rejected by the Actions parser. In practice this means you can’t assume that any non‑conforming YAML will be tolerated; the bug is narrowly scoped to the pattern described in the original report.

Since the parser version is locked on GitHub’s side, upgrading YamlDotNet in your own tooling won’t affect the Actions runtime. The bug persists across the versions that GitHub appears to use, and the only path to resolution is an internal change by the GitHub team. Until then, the safest approach is to keep your workflow files strictly compliant with the YAML specification, especially when using flow‑style strings inside block collections, to avoid surprising failures or silent mis‑parsing.

## Key takeaways

- GitHub Actions’ workflow parser accepts YAML that violates the YAML 1.2 specification (e.g., flow‑style nodes not indented enough), making strict YAML parsers reject some real‑world workflows.  
- The underlying parser appears to be YamlDotNet 5.3.0, and the same parsing bug persists in newer versions up to 18.1.0.  
- A 2020 patch to YamlDotNet fixed only the double‑quoted case of rule 8.2.3, leaving the single‑quoted flow‑style issue unfixed.  
- Because Actions tolerates these invalid YAML forms, tools that lint or validate workflows with a conforming parser may produce false‑positive errors.  
- Developers should be aware that fixing the YAML to be spec‑compliant (e.g., adding an extra space before the flow node) resolves the discrepancy without relying on GitHub’s permissive parsing.

## Sources

- [GitHub Actions accepts invalid YAML](https://yossarian.net/til/post/github-actions-accepts-invalid-yaml/)
- [iTerm2 Arbitrary Command Execution via Kitty Image Protocol APC Response Injection](https://ii4gsp.github.io/iterm2-rce/)
- [Release: Roto v0.14.0](https://community.nlnetlabs.nl/t/release-roto-v0-14-0/3511)
