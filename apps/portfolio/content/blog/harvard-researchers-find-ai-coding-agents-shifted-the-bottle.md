---
title: "Harvard Researchers Find AI Coding Agents Shifted the Bottleneck to Code Review"
description: "Engineers who adopted AI‑driven coding agents cranked out roughly 30 percent more lines of code, yet the amount of shipped work didn’t budge and getting th"
pubDate: 2026-11-18
category: "AI & LLMs"
readTime: 11
cover: "/blog-covers/harvard-researchers-find-ai-coding-agents-shifted-the-bottle.png"
blocks: {"tldr":["AI coding agents raise code output ~30% but shipped work stays flat.","Review time jumps ~49%, becoming the new bottleneck.","Overall delivery speed shows little to no improvement."],"stats":[{"value":"30%","label":"More lines of code written"},{"value":"49%","label":"Increase in review time"},{"value":"718","label":"Firms studied"},{"value":"725,938","label":"Engineers in dataset"}],"chart":{"title":"Impact of AI coding agents","unit":"%","note":"Change in key productivity metrics after adoption","items":[{"label":"Code output","value":30},{"label":"Review latency","value":49}]},"flow":{"kind":"steps","title":"From adoption to bottleneck","steps":[{"label":"Adoption","text":"Firms deploy AI‑driven coding agents."},{"label":"Drafting boost","text":"Engineers write ~30% more lines of code."},{"label":"Review slowdown","text":"Pull‑request review time grows ~49%."},{"label":"Bottleneck shift","text":"Review becomes the primary constraint, offsetting drafting gains."}]}}
slides: ["/blog-covers/harvard-researchers-find-ai-coding-agents-shifted-the-bottle-slide-1.png","/blog-covers/harvard-researchers-find-ai-coding-agents-shifted-the-bottle-slide-2.png"]
---

Engineers who adopted AI‑driven coding agents cranked out roughly 30 percent more lines of code, yet the amount of shipped work didn’t budge and getting that code through review slowed by about 49 percent, according to a Harvard working paper by Ph.D. candidates Fiona Chen and James Stratton covering 718 firms between January 2021 and March 2026. The analysis, built on Jellyfish’s engineering‑activity data and LinkedIn employment records, shows that the productivity boost at the drafting stage simply moved the bottleneck downstream to the human review checkpoint.  

In this post we’ll unpack the study’s methodology, explore why faster drafting doesn’t automatically translate into faster delivery, and discuss what the findings mean for teams thinking about AI coding agents. We’ll also look at related signals—from the surge of AI‑generated pull requests (over 17 million a month) to early‑stage legal‑AI tools that keep a human reviewer in the loop—to help you decide how to measure the real impact of AI on your development pipeline.

## What happened

Engineers at firms that introduced AI‑assisted coding agents wrote roughly 30 percent more lines of code than before, but the volume of completed, ship‑ready work did not rise in any measurable way. The researchers measured output by tracking finished tickets and releases, and the extra commits simply sat in the pipeline without translating into additional delivered features. In other words, the drafting stage got faster, but the overall productivity curve stayed flat.

At the same time, the time it took for a piece of code to clear the review gate stretched out dramatically. Pull‑request cycles lengthened by about 49 percent after the agents were deployed, indicating that reviewers were now the primary bottleneck. The study attributes this slowdown to the higher volume of draft code that needed human validation, as well as occasional quality gaps that required more back‑and‑forth before approval.

The findings come from a Harvard working paper authored by Ph.D. candidates Fiona Chen and James Stratton. Their analysis spans activity from January 2021 through March 2026 and covers 718 companies, representing 725,938 workers whose engineering actions were logged through the Jellyfish analytics platform and enriched with LinkedIn employment data. By applying a staggered difference‑in‑differences design, the authors compared firms that adopted AI agents at different times, controlling for firm size and other factors.

Overall, the data suggest that while AI coding agents can boost raw coding output, they do not automatically accelerate the delivery of finished software. Instead, they shift the constraint from writing code to getting that code reviewed, a nuance that organizations should factor into any ROI calculations for AI‑driven development tools.

## Why it matters

The Harvard working paper shows that the time saved while drafting code with AI agents does not automatically shrink the overall delivery schedule. Engineers who adopted the tools wrote roughly 30 percent more code, yet the amount of finished work stayed flat and the average time to get a change through review grew by 49 percent. In practice, the faster “write‑first” phase simply pushes the bottleneck downstream, so the net speed‑up for a product team can be negligible.

When review cycles lengthen, the whole development loop stretches. A longer pull‑request turnaround means that downstream activities—testing, integration, and release planning—must wait longer, eroding the productivity gains reported for AI‑generated drafts. The Harvard data, which tracks 68 million Jira issues and 49 million pull requests across 718 firms, makes it clear that the extra commits do not translate into proportionally more shipped features. In other words, the hidden cost of a slower human checkpoint can offset, or even outweigh, the time saved by the coding agent.

Because the review stage remains human‑centric, legal and compliance teams will need to adjust their monitoring practices. AI‑authored code often leaves metadata in collaboration tools, and the study notes that “legal hold programs may need to reach” this information. Tracking who authored a change, when it was approved, and how much reviewer time was spent becomes essential for audit trails and for ensuring that AI‑generated work complies with internal policies and external regulations.

Finally, the shift in the bottleneck has strategic implications. Organizations that expect AI to accelerate delivery should budget for additional reviewer capacity or invest in automated gate‑keeping tools that can surface problems before a human spends time on a pull request. Without such measures, the promised productivity boost from AI coding agents may remain confined to the drafting phase, while the real pace of product delivery stays unchanged.

## How it works (background)

The authors built their sample by linking two commercial data feeds. Jellyfish’s engineering‑analytics platform supplies a granular view of development activity—Jira issues, commits, pull requests, and calendar events—while Revelio Labs provides LinkedIn‑derived employment records that identify who works where and when. By joining these streams they could follow the same engineers across the adoption window, covering the period from January 2021 through March 2026 and a total of 718 firms that had consented to research use of their data.  

To isolate the effect of AI coding agents the paper uses a staggered difference‑in‑differences (DiD) framework. Each month the outcomes for firms that had already deployed an agent are compared against firms that had not yet done so, allowing the authors to trace how metrics evolve as adoption spreads. Because firms did not all switch on at the same time, the design exploits this variation to control for common time trends and for firm‑specific factors. The authors also include firm size as a control, noting that larger companies tended to adopt earlier, and they explicitly model that dimension to avoid confounding the treatment effect with scale‑related productivity differences.  

The timing of adoption, the key source of variation for the DiD, is argued to be driven primarily by internal procurement cycles. The study reports that firms’ rollout dates were set by how long it took legal, security, and sourcing teams to approve the tools, with some organizations completing approvals in a day and others taking six to twelve months. The authors contend that these procurement delays are plausibly orthogonal to a firm’s growth trajectory, making the early‑ versus late‑adopter comparison credible. By treating the procurement process as an exogenous shock, the design aims to ensure that any observed changes in coding output or review latency can be attributed to the AI agents rather than to underlying business dynamics.

## The key details and numbers

The Harvard working paper draws on a massive engineering‑activity feed supplied by Jellyfish. Across the 718 firms in the sample, the raw logs contain 68.3 million Jira issues, 200.9 million commits, 49.1 million pull‑request events, and 21.3 million calendar entries — though calendar data were only available from 213 of the firms. Those figures give a sense of the scale at which the authors could observe changes before and after AI‑coding agents were introduced.

When the agents were adopted, engineers added roughly 30 percent more lines of code than they had previously. The increase is measured against the baseline of non‑AI‑augmented work and shows that the drafting stage became noticeably more productive. However, the same analysis finds that the amount of “finished work” – the code that ultimately shipped or was marked complete – did not rise in any measurable way. In other words, the extra lines did not translate into additional deliverables.

The most striking shift appears in the review pipeline. The study reports that the average time a pull request spent in code review grew by 49 percent after AI agents were deployed. This slowdown turned the review step into the primary bottleneck, offsetting the gains made in raw coding output. The authors’ staggered difference‑in‑differences design suggests that the longer review cycles are not simply a seasonal effect but a systematic consequence of faster drafting without a corresponding increase in reviewer capacity.

Taken together, the numbers paint a clear picture: AI‑generated code can boost the volume of written lines, but without parallel improvements in the review process, overall productivity stalls and review latency becomes the limiting factor.

## What it means for developers

Developers will notice that AI‑generated drafts arrive much quicker, but the downstream effort shifts toward reviewing those changes. The Harvard working paper on 718 firms shows that while engineers added roughly 30 percent more code, the time to get a pull request through review grew by 49 percent, and overall finished work did not increase 【1†L1-L4】. In practice this means you may spend less time typing the initial implementation and more time validating that the suggestion actually solves the problem, doesn’t break existing tests, and complies with your team’s standards.

Because the bottleneck now sits at the human checkpoint, organizations should start treating verification as a first‑class part of the pipeline. Automated test‑based gates—like the “AI Fix Verifier” that checks commits against deterministic test suites before a PR is presented to a reviewer—can catch regressions in seconds rather than minutes 【3†L1-L8】. Deploying such gates at scale helps ensure that the “tests passed” signal from an AI agent is backed by real evidence, reducing the risk of subtle bugs slipping through the review process.

Measuring the true impact of AI assistance also becomes essential. The Harvard study recommends tracking metrics such as approved work product, revision rates, and reviewer time 【1†L5-L7】. By logging how many AI‑authored PRs are accepted versus revised, and how much reviewer effort each consumes, you can quantify whether the faster drafting actually translates into net productivity gains or simply adds overhead at the review stage. These data points give you a concrete basis for deciding whether to double‑down on AI tools, invest in better verification, or adjust team workflows.

## Limits and caveats

The study behind the headline is a **working (job‑market) paper**, not a formally peer‑reviewed article. That means the authors have not yet been subject to the full scrutiny that a journal or conference review process provides, and the findings should be treated as provisional until a revised version appears in a vetted venue.

The sample is also **restricted to firms that consented to share their data** with the analytics platform used by the researchers. While the dataset spans 718 companies, only **213 of those supplied calendar events**, which are the primary source for measuring review‑stage timing. This limited coverage could skew the observed slowdown if the firms that provided calendar data differ systematically from those that did not.

A further source of potential bias is the **early adoption pattern of larger firms**. The authors note that bigger companies tended to implement AI coding agents sooner and they control for firm size in their difference‑in‑differences design. However, size may proxy for other unobserved characteristics—such as more complex codebases, stricter compliance processes, or different engineering cultures—that could also affect review latency. If any of these hidden factors remain, they might inflate the apparent impact of AI on the review bottleneck.

Taken together, these caveats suggest that the reported 49 % increase in review time should be interpreted as an **initial estimate** rather than a definitive measure of how AI coding agents reshape development pipelines. Future work that expands the sample, includes firms without consented data, and isolates the effect of firm size more cleanly will be needed to confirm the robustness of these findings.

## Key takeaways

- Engineers who adopted AI coding agents wrote about 30 percent more code, but the amount of finished work did not measurably increase.  
- The time to get code through review grew by 49 percent, making code review the new bottleneck.  
- The findings come from a Harvard working paper that analyzed activity for 725,938 workers at 718 companies.  
- The analysis used data from Jellyfish’s engineering‑activity platform (68.3 M Jira issues, 200.9 M commits, 49.1 M pull requests) combined with LinkedIn employment records.  
- The study period covered January 2021 through March 2026 and employed a staggered difference‑in‑differences design to compare early adopters with firms that had not yet adopted AI agents.

## Sources

- [Harvard researchers find AI coding agents shifted the bottleneck to code review](https://complexdiscovery.com/harvard-researchers-find-ai-coding-agents-shifted-the-bottleneck-to-code-review/)
- [Is Coding with AI Actually Faster and Cheaper?](https://dev.to/sylwia-lask/is-coding-with-ai-actually-faster-and-cheaper-2810)
- [AI agents open 17 million pull requests a month. I built a gate that rejects the ones that lie.](https://dev.to/aws-builders/ai-agents-open-17-million-pull-requests-a-month-i-built-a-gate-that-rejects-the-ones-that-lie-46n7)
