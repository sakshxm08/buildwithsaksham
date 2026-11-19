---
title: "Critical Unauthenticated RCE in Nginx: What Developers Must Do Now"
description: "Two critical HTTP/2 flaws in NGINX were disclosed on November 18, 2026 (CVE‑2026‑123633 and CVE‑2026‑123007), each earning a CVSS 9.2 rating. The vulnerabi"
pubDate: 2026-11-19
category: "Security"
readTime: 11
cover: "/blog-covers/critical-unauthenticated-rce-in-nginx-what-developers-must-d.png"
blocks: {"tldr":["Two critical HTTP/2 RCE bugs (CVE‑2026‑123633 & CVE‑2026‑123007) disclosed 18 Nov 2026, CVSS 9.2.","Both affect every NGINX version with HTTP/2 enabled (1.9.5‑1.31.8) until patch 1.31.9.","NGINX powers >225 million sites, making the flaw a massive attack surface.","Mitigation: disable HTTP/2 now and apply the forthcoming 1.31.9 security update."],"stats":[{"value":"9.2","label":"CVSS severity rating for each CVE"},{"value":"225M","label":"Approximate number of sites using NGINX"},{"value":"1.9.5","label":"Earliest vulnerable version (introduced HTTP/2 in 2015)"},{"value":"1.31.8","label":"Latest vulnerable version before patch"}],"chart":null,"flow":null}
slides: ["/blog-covers/critical-unauthenticated-rce-in-nginx-what-developers-must-d-slide-1.png","/blog-covers/critical-unauthenticated-rce-in-nginx-what-developers-must-d-slide-2.png"]
---

Two critical HTTP/2 flaws in NGINX were disclosed on November 18, 2026 (CVE‑2026‑123633 and CVE‑2026‑123007), each earning a CVSS 9.2 rating. The vulnerabilities let an unauthenticated attacker execute code on any server that has HTTP/2 enabled, even when the downstream application code is perfectly hardened. Because NGINX sits at the front door of most modern web stacks—routing traffic for millions of sites and APIs—a successful exploit can compromise the web server itself, steal data, tamper with content, or bring services down. The bugs have been present since NGINX 1.9.5 (2015) and affect every release up to 1.31.8, meaning most deployments in the wild are vulnerable until a patched release (1.31.9) lands.

In this post we’ll walk through what the two flaws actually do, how to confirm whether your instances are exposed, and the immediate steps you can take—disabling HTTP/2 on affected ports and applying the forthcoming security update. We’ll also cover short‑term mitigations, how to investigate potential abuse, and why this incident underscores the importance of rapid patching for infrastructure components that are often assumed “safe” by default.

## What happened

Two independent research groups uncovered a pair of critical HTTP/2 flaws in NGINX—CVE‑2026‑123633 and CVE‑2026‑123007—and publicly disclosed them on 18 November 2026. The findings came from Wiz Research, Ikotas Labs, Metnir, Rapid7, and Xint, each of which reported the same underlying problems to F5 (the company behind NGINX) around the same time. F5 coordinated a single security release that bundled patches for both CVEs, and the coordinated disclosure was announced the same day the patches went live.

Both bugs are unauthenticated remote‑code‑execution (RCE) vulnerabilities that only manifest when HTTP/2 is enabled on the server. In the CVE‑2026‑123633 case, a use‑after‑free in the HTTP/2 handling path can be triggered by a crafted request, allowing an attacker to bypass ASLR and execute arbitrary code. CVE‑2026‑123007 is an integer‑underflow that also leads to code execution without any prior authentication. Because the flaws live in NGINX itself, they can be exploited even when the downstream applications are perfectly hardened.

The vulnerabilities have been lurking for years. CVE‑2026‑123007 is present in every NGINX release dating back to version 1.9.5, which introduced HTTP/2 support in 2015. The use‑after‑free that underpins CVE‑2026‑123633 was introduced roughly six years earlier, meaning the defective code survived multiple major releases before finally being discovered. As a result, virtually any production deployment that runs an older or even a recent NGINX version with HTTP/2 enabled could be at risk until the patches are applied.

## Why it matters

NGINX sits at the front door of the modern web, handling HTTPS termination, load‑balancing, and routing for countless APIs. Because it is the world’s most widely used open‑source web server—powering more than 225 million sites—it is often the first component an attacker reaches when probing a target’s infrastructure. When HTTP/2 is enabled, the two critical flaws (CVE‑2026‑123633 and CVE‑2026‑123007) give an unauthenticated adversary the ability to run arbitrary code inside the NGINX worker process. That process runs with the privileges granted to the web server, so any code the attacker injects can read or modify traffic, steal credentials, or corrupt the content served to downstream applications.

The impact ripples far beyond the web server itself. Because NGINX typically fronts multiple micro‑services, APIs, and static assets, a single compromised instance can give an attacker a foothold that spans the entire application stack. They can tamper with responses, inject malicious payloads, or disrupt service for all consumers of the affected endpoints. In environments that rely on containerization or orchestration, the exploit can even escape the container and affect the host, especially when chained with other kernel‑level bugs that have been disclosed alongside the NGINX issues.

What makes this especially dangerous is that the vulnerability lives in NGINX’s core code, not in any downstream application logic. Even if you have hardened your application, performed rigorous input validation, and deployed runtime protections, the flaw bypasses those defenses entirely. The attacker does not need to interact with your application code at all; they only need to send a crafted HTTP/2 request to the vulnerable server. Consequently, the usual “secure the app, secure the data” approach offers no protection here.

The bottom line is that the risk is systemic: any service that trusts NGINX for traffic handling inherits the same exposure. Until the patches are applied—or HTTP/2 is disabled on affected listeners—organizations must treat every NGINX deployment as a potential entry point for full‑system compromise. Immediate inventory, patching, and temporary mitigations are essential to prevent a breach that could cascade across the whole architecture.

## How it works (background)

Both CVE‑2026‑123633 and CVE‑2026‑123007 are classic memory‑safety bugs hidden deep inside NGINX’s HTTP/2 implementation. The first flaw, CVE‑2026‑123633, is a use‑after‑free: an object that has been released is later accessed when processing certain HTTP/2 frames, allowing an attacker to corrupt the worker’s memory layout. The second flaw, CVE‑2026‑123007, is an integer underflow that translates into an out‑of‑bounds write. When the underflow occurs, NGINX calculates a negative length for a buffer and then writes past the end of that buffer, overwriting adjacent structures. Both conditions break the assumptions that the server’s core code makes about valid memory, opening a path to arbitrary code execution.

These bugs only surface when HTTP/2 is enabled. NGINX’s HTTP/2 module parses frames in a highly stateful way, and the vulnerabilities arise from subtle interactions between frame handling and the server’s internal request‑processing pipeline. For CVE‑2026‑123633, the freed object is tied to the lifecycle of a stream; for CVE‑2026‑123007, the underflow is triggered by crafted length fields in HEADERS or DATA frames. Because the malformed frames are accepted before deeper validation, the corrupted memory is later used to build request structures, leading to a full RCE primitive without any further conditions.

Importantly, the exploit does not depend on any backend application code or third‑party NGINX modules. The researchers demonstrated successful code execution on a server that was serving only static files, confirming that the flaw lives entirely in the NGINX binary itself. This means that even a minimal NGINX deployment—one that simply terminates TLS and delivers static assets—can be compromised if HTTP/2 is left enabled.

## The key details and numbers

Both CVE‑2026‑123007 and CVE‑2026‑123633 carry a CVSS v4.0 rating of 9.2, placing them squarely in the Critical severity band. The score reflects the fact that an unauthenticated attacker can achieve remote code execution simply by sending a crafted HTTP/2 request to a vulnerable NGINX instance. Because the flaws live in the core HTTP/2 handling code, they do not depend on any third‑party modules or application‑level logic; the attack surface is the web server itself.

CVE‑2026‑123007 is especially broad in scope. It affects every NGINX release from 1.9.5 up through 1.31.8, which means any version released after NGINX added HTTP/2 support in 2015 is vulnerable. In practice, that covers the vast majority of production deployments, including recent releases that ship the same vulnerable code path. The vulnerability is an integer‑underflow that has been present for more than a decade, so even freshly built containers or images based on the latest stable tag may be at risk until the forthcoming 1.31.9 patch lands.

CVE‑2026‑123633 has a slightly narrower version range but still spans many active installations. It is present in releases dating back to at least NGINX 1.19.7 and, like the other flaw, only triggers when HTTP/2 is enabled. The vulnerability is a use‑after‑free condition that existed for nearly six years before disclosure. Because the bug requires HTTP/2 traffic to be processed, any server that has the protocol turned on—whether for performance or client compatibility—must be considered exposed.

In short, the two CVEs together affect essentially every NGINX deployment that runs HTTP/2, regardless of how recent the binary is. The overlapping version ranges mean that simply updating to the latest 1.31.x release will not suffice until the dedicated 1.31.9 fix is available; disabling HTTP/2 on affected listeners is the only reliable mitigation in the interim.

## What it means for developers

Identify every NGINX instance that still has HTTP/2 turned on and is running a version older than the forthcoming 1.31.9 release. Both CVE‑2026‑123007 (present in every release from 1.9.5 through 1.31.8) and CVE‑2026‑123633 require HTTP/2 to be active, so a quick inventory—using tools like `nginx -V`, configuration scans, or your infrastructure‑as‑code repo—will surface the at‑risk servers. Once you have the list, schedule an immediate upgrade to 1.31.9 as soon as the patch is published; the release contains the fixes for both critical flaws and is the only long‑term mitigation.

If you cannot apply the patch right away—perhaps because the upgrade path is tied to a larger release cycle—disable HTTP/2 on the affected listening ports. Adding `http2 off;` (or removing the `http2` flag from the `listen` directive) on each vulnerable server blocks the exploitation paths for both CVE‑2026‑123007 and CVE‑2026‑123633. This temporary step does not affect the other nginx2root vulnerabilities, but it buys you time while you coordinate a full upgrade.

Beyond the protocol setting, verify that the NGINX worker processes do not run with more privileges than necessary. By default workers inherit the user defined by the `user` directive; ensure this is a low‑privilege account and that the process is not granted access to sensitive host resources. Running workers inside containers or sandboxed environments further limits the blast radius if an attacker does manage to execute code. Reducing capabilities (e.g., dropping `CAP_NET_RAW`, `CAP_SYS_ADMIN`) and using read‑only filesystem mounts are practical ways to harden the deployment.

Finally, treat the remediation as part of your regular security hygiene: automate version checks, enforce “no HTTP/2 on unpatched instances” policies, and incorporate container‑orchestration security contexts that restrict worker privileges. This layered approach keeps the attack surface small while you wait for the official 1.31.9 update.

## Limits and caveats

Disabling HTTP/2 does close the attack surface for the two CVEs that rely on that protocol, but it does not eliminate every NGINX‑related RCE path. The Xint “nginx2root” analysis lists three additional bugs—CVE‑2026‑123634, CVE‑2026‑121810, and CVE‑2026‑113425—that remain exploitable when other features such as the resolver, HTTP/3, or mail proxy are enabled. Those flaws are independent of the HTTP/2 use‑after‑free and integer‑underflow issues, so a configuration that simply turns off HTTP/2 can still be vulnerable if it uses the affected directives. In practice this means you must audit the full set of NGINX modules and directives in use, not just the HTTP/2 setting.

The vulnerabilities described in the two critical CVEs affect the NGINX worker process itself. When an attacker gains code execution, the payload runs with the privileges of that worker, which are typically limited to the user account under which NGINX runs (often `nginx` or `www-data`). The exploit does not automatically elevate to root on the host. Xint’s research demonstrated that root privileges are only achievable by chaining an NGINX RCE with a separate kernel flaw in the Linux SCTP subsystem. Without that kernel bug, the compromise stays confined to the NGINX process space, limiting the impact to the services fronted by NGINX.

Patch availability is tied to the upcoming 1.31.9 release, which will incorporate fixes for all five CVEs identified by the “nginx2root” project. Until that version is publicly distributed, organizations must rely on temporary mitigations. Disabling HTTP/2 blocks CVE‑2026‑123007 and CVE‑2026‑123633, but it does nothing for the three remaining bugs, so you need to combine configuration changes (e.g., removing vulnerable directives, tightening proxy and mail proxy settings) with thorough exposure testing. Scanning for open HTTP/2 ports, verifying that the resolver, mirror, HTTP/3, and mail proxy features are not unintentionally enabled, and monitoring for suspicious worker‑process activity are essential steps while you wait for the official patch.

## Key takeaways

- Two critical HTTP/2 flaws (CVE‑2026‑123633 and CVE‑2026‑123007) allow unauthenticated remote code execution on NGINX servers that have HTTP/2 enabled, and both are rated Critical with a CVSS 9.2 score【SOURCE 1】.  
- CVE‑2026‑123007 has been present since NGINX 1.9.5 (released in 2015) and affects every official release up to 1.31.8, meaning even recent installations are vulnerable if HTTP/2 is active【SOURCE 2】.  
- Disabling HTTP/2 on affected listening ports blocks exploitation of CVE‑2026‑123007 and CVE‑2026‑123633, though it does not mitigate the other three NGINX2Root vulnerabilities【SOURCE 2】.  
- The recommended permanent fix is to upgrade to NGINX 1.31.9 (or later) as soon as the patched release is available【SOURCE 2】.  
- Until the patch is applied, organizations should verify their NGINX version and HTTP/2 configuration, and apply the temporary mitigation of turning off HTTP/2 to reduce immediate risk【SOURCE 2】.

## Sources

- [Unauthenticated remote code execution in Nginx](https://www.wiz.io/blog/nginx-http2-rce-vulnerabilities)
- [nginx2root](https://xint.io/blog/nginx2root-remote-code-execution)
- [Java4Shell: Write once, RCE everywhere](https://calif.io/java4shell/)
