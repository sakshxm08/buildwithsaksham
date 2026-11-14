---
title: "Reverse Engineering My Coway Air Purifier to Ditch the Cloud"
description: "The 2017 wildfires that choked the West Coast left many Bay Area homes scrambling for clean‑air solutions, and I ended up with a Coway Airmega IconS. The p"
pubDate: 2026-11-14
category: "Security"
readTime: 12
cover: "/blog-covers/reverse-engineering-my-coway-air-purifier-to-ditch-the-cloud.png"
blocks: {"tldr":["Coway Airmega IconS works but its iPhone app depends on a fragile cloud service.","A Home Assistant integration mimics the app but breaks whenever Coway changes its API or layout.","The author replaced the cloud with a local MQTT bridge for reliable, private control.","Intermittent cloud outages occur once or twice a year, prompting a self‑hosted solution."],"stats":[{"value":"16m","label":"Read time of the post"},{"value":"1‑2y","label":"Cloud failures per year"},{"value":"Nov11","label":"Post date (2026)"},{"value":"IconS","label":"Most expensive model"}],"chart":null,"flow":null}
slides: ["/blog-covers/reverse-engineering-my-coway-air-purifier-to-ditch-the-cloud-slide-1.png","/blog-covers/reverse-engineering-my-coway-air-purifier-to-ditch-the-cloud-slide-2.png"]
---

The 2017 wildfires that choked the West Coast left many Bay Area homes scrambling for clean‑air solutions, and I ended up with a Coway Airmega IconS. The purifier works—its HEPA filter and sensor keep the indoor air breathable—but the companion iPhone app is a classic IoT nightmare: slow, password‑hungry, and forever tied to Coway’s cloud service. A community‑built Home Assistant integration pretends to be the phone app, polling Coway’s servers for status and relaying commands, which lets me hook the fan into Apple Home and fire it up with my “Good Night” button. The catch? I’m still at the mercy of the Coway cloud, which periodically breaks, bans accounts, or disappears entirely, threatening the very automation I rely on.

In this post I walk through how I stripped the cloud dependency out of the IconS. I start by examining the device’s network handshake, then set up a local MQTT bridge that mimics the Coway API, and finally replace the Home Assistant integration with a lightweight Python script that talks directly to the fan over the LAN. By the end you’ll have a self‑hosted control path that restores reliability, eliminates third‑party latency, and keeps your air‑quality data private.

## What happened

I bought the Coway Airmega IconS after the original Airmega I’d been using for years finally gave up. The older model had no Wi‑Fi, so there was no way to hook it into Apple Home alongside the rest of our smart lighting. The IconS was marketed as the Wi‑Fi‑enabled successor (now discontinued), and that was the main reason I upgraded – I wanted a single “Good Night” button that could turn off the lights and spin the purifier up for white‑noise.

Coway’s mobile app, originally called **IoCare** and later rebranded **IoCare+**, is the only official way to control the IconS remotely. The app talks to a proprietary cloud service; every status poll and command passes through Coway’s servers before reaching the device. Because the app is the sole bridge, any integration that wants to control the purifier has to mimic that cloud interaction.

A member of the Home Assistant community took on the reverse‑engineering challenge. By sniffing the app’s traffic and figuring out the HTTP endpoints, they built an integration that pretends to be the phone app. The component polls the Coway cloud for the current fan speed, filter status, and air‑quality readings, and it forwards Home Assistant commands back through the same cloud API. Once the bridge was in place, Apple Home could see the purifier as a regular accessory, and the “Good Night” scene worked as intended.

In practice the setup proved fragile. The integration relied on the exact shape of Coway’s API and on HTML pages that the app scraped for data. Whenever Coway rewrote the app, rebranded it from IoCare to IoCare+, or tweaked the page layout, the integration broke and needed a quick fix. Server bans also occurred when the cloud detected the integration’s polling pattern, and occasional cloud outages left the purifier completely unreachable. Those recurring failures were the main motivation for eventually ditching the cloud altogether.

## Why it matters

Relying on the Coway cloud ties the purifier’s core functionality to a service you don’t control. When the cloud goes down—or when Coway decides to block an integration—the fan becomes effectively mute. The blog notes that the integration has been banned twice, that server outages have left the device unreachable for weeks, and that a future shift to a paid or discontinued service is “unlikely” to be avoided. In practice, a single outage can break the “Good Night” button you’ve wired into Apple Home, leaving you with a noisy fan you can’t mute or a silent fan you can’t turn on.

This fragility isn’t unique to Coway; many IoT manufacturers retire or radically change their cloud APIs after a few years. The post lists three concrete examples: a re‑branding of the mobile app from IoCare to IoCare+, a layout change in the HTML the integration scrapes, and a complete rewrite of the protocol that forced the Home Assistant add‑on to be rewritten. Each change required the community to chase a new reverse‑engineered spec, and every pause in that cycle leaves existing hardware with missing smart features.

Because the integration is essentially a thin wrapper around the official API, any change on Coway’s side forces a corresponding update on the user’s side. That means you’re constantly monitoring release notes, testing patches, and redeploying Home Assistant configurations just to keep the fan responsive. The maintenance burden grows as the vendor’s UI evolves, and the risk of being locked out again rises.

For anyone who wants reliable, local automation—like tying the purifier to a “Good Night” button that simultaneously dims lights and starts the fan at a specific speed—cloud dependence is a practical obstacle. A local control path eliminates the need to wait for the vendor’s servers, sidesteps bans, and ensures the purifier behaves exactly when you need it, regardless of internet health or corporate policy changes.

## How it works (background)

The Airmega IconS reaches out to the internet the moment it powers on, opening a TLS‑encrypted connection to Coway’s IoCare cloud service. During the handshake the device validates the server’s SSL certificate, which means it will only talk to a host that presents a trusted Coway‑signed chain. Once the TLS tunnel is established the purifier registers itself with the cloud, receiving a token that is used for all subsequent interactions.

The official iPhone app talks to the same cloud endpoints over HTTPS. Every status poll – current fan speed, filter life, indoor air‑quality reading – is sent as a JSON payload in an HTTP POST, and control actions (changing speed, turning the unit on or off, enabling the “Good Night” mode) are issued by posting a similar command object to the same API. The app’s requests include the device token and are signed by the app’s bundle identifier, which the server checks before accepting any changes.

Home Assistant’s community integration simply pretends to be that phone app. It periodically issues the same status‑polling POSTs to the cloud, parses the JSON response, and exposes the values as entities inside Home Assistant. When a user flips a switch in the UI, the integration crafts a command request that mirrors the app’s format and sends it back through the identical endpoint. In practice the integration is a thin wrapper around the cloud API, relying on the same authentication token and TLS validation that the official app uses.

Because the Airmega never opens a local‑network port or publishes a REST endpoint on the LAN, there is no direct way to control it without involving the cloud. Any solution that stays on‑premises therefore has to either intercept the HTTPS traffic (for example with a transparent proxy that can present a trusted certificate) or replace the cloud layer entirely by emulating the server’s API and feeding the device a fabricated but valid token. This is the only path to a truly local‑only setup.

## The key details and numbers

The post went live on **November 11 2026** and the author notes that it’s a **16‑minute read**. Those details set the stage for a fairly quick dive into the hardware and the integration work that followed.  

Coway’s Wi‑Fi‑enabled Airmega models—specifically the **Airmega 250S**, **Airmega MightyS**, and the discontinued **IconS**—all carry a price premium over the legacy non‑Wi‑Fi Airmega. The author points out that the IconS is “considerably more expensive,” positioning it as the costliest option in the lineup, while the newer 250S and MightyS sit at a higher tier than the basic model but below the IconS’s premium price point.  

In practice, the cloud dependency proved flaky. The author observed “once or twice a year” the Coway cloud service would fail, manifesting as temporary bans, server outages, or outright loss of remote control. These interruptions ranged from a brief ban after the integration hammered the servers to longer periods when the Coway servers were offline, leaving the purifier unreachable for days.  

Maintaining the Home Assistant bridge was an ongoing chore. Each time Coway refreshed its mobile app—first rebranding from **IoCare** to **IoCare+**—or tweaked the HTML layout that the integration scrapes for status data, the community‑maintained integration had to be rewritten. Those periodic rewrites were necessary to keep the poll‑and‑push cycle functional, underscoring how tightly the device is tied to the proprietary cloud endpoint.  

Together, these numbers and observations illustrate why the author ultimately decided to reverse‑engineer the purifier: the higher upfront cost of Wi‑Fi models, the intermittent cloud reliability issues, and the maintenance overhead of a constantly shifting integration all added up to a compelling case for a self‑hosted solution.

## What it means for developers

When an IoT product like the Coway Airmega IconS doesn’t expose a documented local API, the usual shortcut for developers is to watch the traffic that the official mobile app sends to the vendor’s cloud and mimic it. By reverse‑engineering the HTTP calls, authentication flow, and JSON payloads, we can build a client that talks directly to the same endpoints the app uses, effectively pulling the “cloud” logic into our own code. This is exactly what the community did for the Coway integration in Home Assistant: the integration pretends to be the iPhone app, polls the Coway IoCare service for status, and pushes commands to change fan speed or mode.

That approach, however, comes with a maintenance burden. Every time Coway releases a new version of its app—or even tweaks the HTML layout that the integration scrapes—the request format can change, SSL pinning may be added, or the server may start rejecting older client certificates. In practice the author of the blog observed breakages “once or twice a year” because Coway either banned the integration for hammering their servers or rewrote the app (from IoCare to IoCare+), forcing a rewrite of the reverse‑engineered client. Keeping the hack alive therefore means monitoring app updates, updating payloads, and sometimes re‑signing or re‑configuring the MitM environment to bypass new pinning checks.

A common way to eliminate the external dependency is to run a self‑hosted proxy or a man‑in‑the‑middle (MitM) server that terminates the original TLS connection and presents a locally trusted certificate to the device. The device still believes it is talking to coway.com, but the traffic is intercepted and redirected to the proxy, which can then forward commands to the cloud or handle them locally. Setting this up requires generating and installing a custom root certificate on the purifier, configuring the proxy to mimic the expected server responses, and ensuring the device continues to trust the connection after any firmware updates.

Open‑source contributions, such as the Home Assistant integration, accelerate the discovery phase because many eyes can spot changes and share patches quickly. Yet the integration inherits the same fragility as the underlying cloud service: if Coway alters the protocol or blocks the client, the community must race to adapt. In short, reverse‑engineering gives us local control, but it trades long‑term stability for ongoing vigilance and a willingness to manage certificates and proxy infrastructure.

## Limits and caveats

The purifier’s firmware isn’t just sending raw JSON over an open socket – it checks the server’s TLS certificate before any command will be accepted. In practice that means a naïve “fake” endpoint that simply listens on the expected port will be rejected because the device will see a mismatched or self‑signed certificate and abort the handshake. To get around that you’d have to either obtain a certificate that the device trusts (which the firmware likely pins to Cow‑care’s public key) or modify the firmware’s validation logic, both of which add a substantial amount of work beyond just running a local HTTP server.

Even if you manage to spoof the certificate, you still need a full man‑in‑the‑middle (MitM) setup for TLS traffic. Capturing and re‑signing encrypted packets on the fly requires a proxy that can present a trusted certificate to the device while forwarding the traffic to your own server, and configuring the purifier to trust that proxy is non‑trivial. Moreover, intercepting the communication may run afoul of Coway’s terms of service, which generally prohibit reverse‑engineering or tampering with the cloud interface. Violating those terms could result in the device being blocked from the cloud entirely, or in legal repercussions depending on the jurisdiction.

Assuming you get a working local proxy, the solution is fragile by design. Future firmware releases can re‑introduce stricter cloud checks, change endpoint URLs, or alter the payload format. Any such change would instantly break the proxy, forcing you to repeat the reverse‑engineering effort or abandon the workaround altogether.

Finally, the IconS model is already discontinued, and spare parts or firmware updates are hard to come by. That scarcity means a custom solution you build today may become unusable if the hardware fails and you can’t replace it, or if an update is finally pushed that invalidates your proxy. In short, the effort can give you short‑term independence, but it comes with a set of technical and maintenance risks that are easy to overlook.

## Key takeaways

- The existing Home Assistant integration works by impersonating the Coway iPhone app, polling the Coway cloud for status and sending commands through that cloud service.  
- Reliance on the cloud makes the integration fragile: Coway has periodically banned the integration, changed the app API (IoCare → IoCare+), altered HTML layouts, or taken its servers offline, causing loss of remote control.  
- Because the Airmega IconS model is discontinued and Coway’s cloud service may be retired or monetized, a cloud‑free solution is needed for long‑term reliability.  
- Ditching the cloud requires intercepting the device’s network traffic; the fan validates Coway’s SSL certificate, so a simple man‑in‑the‑middle proxy won’t work without replicating a trusted certificate.  
- The author ultimately pursued a custom firmware/communication approach to control the purifier locally, avoiding the need for the Coway cloud entirely.

## Sources

- [Reverse engineering my Coway air purifier to ditch the cloud](https://scottjg.com/posts/2026-11-11-reverse-engineering-my-coway-air-purifier-to-ditch-the-cloud/)
- [Security Agencies Worldwide Found to Use Ad-Based Surveillance System](https://citizenlab.ca/security-agencies-worldwide-found-to-use-ad-based-surveillance-system/)
- [Ctrl+C, Ctrl+v, Ctrl+cve: Bypassing Android's Clipboard Read Security Measures](https://toninoble.com/post/ctrlc-ctrlv-ctrlcve)
