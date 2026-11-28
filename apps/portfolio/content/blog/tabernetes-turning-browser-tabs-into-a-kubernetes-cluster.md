---
title: "Tabernetes: Turning Browser Tabs into a Kubernetes Cluster"
description: "Tabernetes just turned a quirky demo into a concrete way to run Kubernetes workloads on anything that can open a web page. By downloading a ~5 MB bundle, a"
pubDate: 2026-11-28
category: "Tools & Automation"
readTime: 12
cover: "/blog-covers/tabernetes-turning-browser-tabs-into-a-kubernetes-cluster.png"
blocks: {"tldr":["Tabernetes turns a browser tab into a Kubernetes node with a ~5 MB WebAssembly Linux bundle.","The tab runs a single‑core pod via the custom tabc runtime; closing the tab removes the node.","No control‑plane changes are needed – standard Kubernetes objects work unchanged.","Ideal for opportunistic, transient compute using idle browsers."],"stats":[{"value":"5 MB","label":"One‑time download size for a tab node"},{"value":"1 core","label":"CPU capacity per tab node"},{"value":"seconds","label":"Onboarding latency from download to pod start"}],"chart":null,"flow":{"kind":"steps","title":"How a Tabernetes node is created and used","steps":[{"label":"Join page","text":"User clicks “join”, opening a WebSocket to the agent."},{"label":"Download bundle","text":"Browser downloads ~5 MB WebAssembly Linux bundle."},{"label":"Boot kernel","text":"The bundle boots a tiny Linux kernel inside the tab."},{"label":"Schedule pod","text":"Kubernetes scheduler assigns a pod with runtimeClassName tab to the tab node."},{"label":"Run container","text":"The tabc runtime launches the container inside the WebAssembly kernel."},{"label":"Close tab","text":"User closes the tab, the node deregisters and the pod is rescheduled elsewhere."}]}}
slides: ["/blog-covers/tabernetes-turning-browser-tabs-into-a-kubernetes-cluster-slide-1.png","/blog-covers/tabernetes-turning-browser-tabs-into-a-kubernetes-cluster-slide-2.png"]
---

Tabernetes just turned a quirky demo into a concrete way to run Kubernetes workloads on anything that can open a web page. By downloading a ~5 MB bundle, a browser tab becomes a full Kubernetes node: a tiny Linux kernel compiled to WebAssembly boots inside the tab, the scheduler hands it a pod, and the pod’s container runs on that tab’s single core. Close the tab and the node disappears, prompting the control plane to reschedule the pod elsewhere. The project is live at tabernet.es, showing real‑time metrics such as boot time, request latency, and a live map of which devices are currently contributing nodes.

In this post we’ll walk through how Tabernetes wires a standard Kubernetes control plane to the “tabc” container runtime, what the performance characteristics look like today, and what kinds of workloads make sense to offload to a fleet of browser tabs. We’ll also compare the approach to other distributed‑agent frameworks like Fleetlayer, highlighting the trade‑offs of using WebAssembly‑based Linux in the browser versus native agents on separate machines. By the end you’ll have a clear picture of whether turning tabs into a cluster is a fun experiment or a practical tool for edge‑scale compute.

## What happened

Tabernetes debuted as a proof‑of‑concept that turns ordinary browser tabs into Kubernetes nodes. When a user visits the join page, the page pulls down roughly 5 MB of assets and immediately boots a tiny Linux guest inside the tab. That guest is not a full VM; the Linux kernel itself is compiled to WebAssembly, so it runs directly on the tab’s JavaScript engine and can use the tab’s single CPU core and whatever memory the browser allocates to it.

Once the kernel is up, the scheduler treats the tab as a regular Kubernetes node. It schedules a pod to the node, and the pod’s container is started by a custom runtime called **tabc**. The container’s filesystem and image live on the central control plane, while the actual program code executes inside the WebAssembly‑based kernel, leveraging the tab’s native CPU and memory. Closing the tab instantly removes the node, prompting the control plane to reschedule the pod elsewhere.

The whole flow hinges on the WebAssembly‑compiled kernel, which provides the low‑level system calls that containers expect, but without needing any privileged host access. Because the kernel runs in the same sandbox as the rest of the page, the pod’s workload is isolated by the browser’s security model while still getting near‑native performance on the tab’s resources. This design lets anyone with a modern browser contribute compute simply by opening a page, turning the ubiquitous act of browsing into a distributed Kubernetes cluster.

## Why it matters

Tabernetes shows that Kubernetes isn’t limited to traditional VMs or bare‑metal nodes – it can schedule pods onto environments that exist only for the lifetime of a browser tab. The platform downloads a ~5 MB agent, boots a Linux kernel compiled to WebAssembly, and then runs the pod’s container inside that tab on a single core. Because the scheduler treats the tab exactly like any other node, a pod can be placed, started, and later rescheduled when the user closes the tab, proving that even ultra‑lightweight, transient runtimes can participate in a full‑featured cluster 【Source 1】.  

By turning any device with a modern browser into a compute node, Tabernetes collapses the classic client‑side/server‑side boundary. A phone, laptop, or even a remote workstation can contribute CPU cycles without installing a native agent; the only requirement is an open tab that maintains a socket to the control plane. This means that the same code you would normally run on a server can now be dispatched to a user’s browser, making the distinction between “frontend” and “backend” more a matter of intent than of infrastructure 【Source 1】.  

The approach also demonstrates a practical way to harvest idle browser resources for distributed workloads. Since the node disappears as soon as the tab is closed, the cluster automatically re‑balances pods onto other available tabs, eliminating the need for manual provisioning or cleanup. This model could be extended to opportunistic compute scenarios—such as rendering a Mandelbrot set across dozens of visitors’ browsers—without ever touching the users’ file system or requiring privileged installations 【Source 1】.  

In short, Tabernetes validates a new class of Kubernetes nodes: lightweight, transient, and entirely browser‑based. It opens the door to leveraging the vast, otherwise untapped compute capacity of everyday browsers, turning every web session into a potential participant in a distributed system.

## How it works (background)

When a user clicks the “join” button, the page opens a long‑lived WebSocket to a small agent that lives next to the Kubernetes API server. That agent immediately registers a new node object in the cluster, using the tab’s unique identifier as the node name. From the control‑plane’s point of view the tab is now just another compute resource, and the node stays registered for as long as the socket remains open. Closing the tab tears down the socket, the agent deregisters the node, and the scheduler will automatically reschedule any pods that were running there onto other available tabs.

The scheduler can target these transient nodes by using a special `runtimeClassName`. When a pod manifest includes `runtimeClassName: tab`, the scheduler treats it as a “tab pod” and assigns it to any node that reports the `tab` runtime. Once the assignment is made, the agent on the chosen tab receives the pod spec and invokes **tabc**, a custom container runtime built for the browser environment. Tabc is responsible for pulling the container image metadata (the image itself stays on the cluster’s machine) and preparing it for execution inside the tab.

Tabc’s core trick is to launch a Linux kernel that has been compiled to WebAssembly. The WebAssembly module runs in the browser’s JavaScript engine, boots the kernel, and then mounts the container’s filesystem layers as a virtual block device. With the kernel up and the image mounted, the pod’s entrypoint runs exactly as it would on a regular node, using the tab’s CPU core and memory. Because the kernel and the container live entirely inside the tab, the pod’s files and network endpoints remain reachable through the normal Kubernetes service mesh, while the tab can be dropped at any time without affecting the rest of the cluster.

## Key details and numbers

Joining a Tabernetes cluster is intentionally lightweight. The one‑time download that a browser tab needs to become a node is about 5 MB, after which a tiny Linux guest runs inside the tab. That guest boots a WebAssembly‑compiled kernel and immediately starts the assigned pod, so the onboarding latency is measured in seconds rather than minutes. Because the payload is so small, even users on constrained mobile connections can contribute a tab without noticeable impact on their browsing experience.  

Once the tab is registered, the pod it hosts is confined to a single CPU core. The runtime, called **tabc**, maps the pod’s process directly onto the tab’s JavaScript thread, which means the pod can only consume the CPU cycles and memory that the browser tab itself is allowed to use. There is no hidden pool of resources behind the scenes; if the tab is throttled by the browser or the device, the pod’s performance scales down accordingly. This design keeps the cluster’s resource accounting simple and mirrors the way traditional Kubernetes nodes report their capacity.  

The control plane does not change at all. Tabernetes plugs its custom node registration and the **tabc** runtime into a regular Kubernetes API server, scheduler, and controller manager stack. All standard Kubernetes objects—pods, services, deployments—behave exactly as they would on a conventional cluster. The only deviation is the node‑registration step, where the agent opens a socket to an auxiliary service that creates a node object for the tab and hands the pod to the tab‑based runtime.  

Because the control plane remains untouched, existing tooling (kubectl, Helm, CI pipelines) works without modification. The cluster’s state is stored in the same etcd database, and the scheduler continues to make placement decisions based on the node’s reported capacity (one core, limited memory). In practice, this means you can spin up a Tabernetes cluster, add a few browser tabs as nodes, and manage it with the exact same commands you use for any other Kubernetes deployment.

## What it means for developers

Developers can keep their existing Kubernetes manifests almost unchanged and simply point a pod at a browser tab by adding `runtimeClassName: tab`. The only line that differs from a regular pod spec is that the scheduler recognises the `tab` runtime class and hands the pod off to the tiny container runtime (`tabc`) that runs inside a WebAssembly‑compiled Linux kernel in the tab. Because the pod’s image, environment variables and command are still defined in the usual `containers` block, you can reuse the same CI pipelines, Helm charts, and GitOps workflows you already have. In practice, you write the spec once, and the same YAML can land on a cloud node today and on a user’s browser tomorrow without any other changes.

Even though the compute happens in the tab, the pod’s filesystem and networking remain anchored to the cluster’s control plane machine. That means all the familiar tooling—`kubectl logs`, `kubectl exec`, Prometheus scrapes, and OpenTelemetry exporters—continue to work exactly as they do for pods on traditional nodes. The Linux kernel inside the tab presents a standard POSIX view, so you can attach debuggers, inspect files, or stream metrics without learning a new stack. From a developer’s perspective, the only difference is that the underlying hardware is the user’s browser CPU and memory, while observability stays in the central cluster.

The biggest practical upside is speed of iteration. Instead of provisioning a new VM, installing a container runtime, and waiting for the node to join the cluster, you can spin up an additional tab, hit “join”, and immediately have a fresh node ready to run a pod. This makes it trivial to prototype distributed workloads—think map‑reduce style image processing or multi‑user demos—by just opening more tabs in your own browser or asking colleagues to open theirs. Because the pods are still scheduled by the same Kubernetes scheduler, you get the same load‑balancing and failover semantics, but the turnaround time for testing a new microservice drops from minutes to seconds.

## Limits and caveats

The biggest practical limitation of Tabernetes is that a node only lives as long as its browser tab stays open. When the user closes the tab, the agent that registered the node disappears and the Kubernetes scheduler immediately treats the node as gone, rescheduling any pod that was running there to another tab (or back to the control‑plane machine). This “ephemeral‑node” model means you can’t rely on any long‑running workload staying on a particular device, and the cluster’s stability depends on users keeping tabs alive.

Even while a tab is active, the compute envelope is very modest. Each node runs a single‑core Linux kernel compiled to WebAssembly, and the container runtime (tabc) executes the pod inside that sandbox. The combination of a single CPU core, the overhead of the WebAssembly layer, and the memory limits imposed by the browser means performance is far below what you would expect from a traditional Kubernetes node. Heavy workloads quickly become CPU‑bound, and latency-sensitive services will suffer from the extra translation steps between JavaScript, WebAssembly, and the guest kernel.

The live dashboard on the Tabernetes site currently shows “0 nodes” and “0 pods”, indicating that no tabs have joined the cluster at the time of writing. This lack of active participants tells us the project is still in an early, experimental phase; there are no real‑world usage metrics or stress‑test results to validate its scalability. Until users start contributing tabs and the control plane records meaningful activity, we have little evidence that the scheduler, networking, and storage integrations can handle anything beyond toy examples.

Because of these constraints—transient nodes, single‑core WebAssembly execution, and the absence of any running workload—Tabernetes should be viewed as a proof‑of‑concept rather than a production‑ready way to turn browsers into a Kubernetes fleet. It’s an interesting exploration of what browsers can host, but the current limits mean it’s best suited for demos, education, or very lightweight tasks that can tolerate frequent pod migration.

## Key takeaways

- Tabernetes lets a regular web browser tab act as a Kubernetes node by booting a Linux kernel compiled to WebAssembly inside the tab.  
- Joining the cluster requires downloading about 5 MB and runs a single‑core Linux guest that hosts a pod’s container via the custom “tabc” runtime.  
- When a tab is closed, its node disappears and the scheduler automatically relocates the pod to another available tab in the cluster.  
- Pods run ordinary container images (e.g., an Alpine image) with a `runtimeClassName: tab` specification, while the pod’s filesystem and networking remain on the central control plane.  
- The system can distribute compute tasks across tabs, such as rendering a Mandelbrot set split into 64 tiles, with each tab’s pod processing its assigned tile.  
- All control‑plane components (API server, scheduler, etc.) are standard Kubernetes components; the only new element is the scheduler’s ability to place pods on tabs using the tabc runtime.

## Sources

- [Tabernetes: A Kubernetes cluster whose nodes are browser tabs](https://tabernet.es/)
- [Show HN: Fleetlayer – Framework for running many AI agents on multiple machines](https://fleetlayer.ai/)
- [The State of Allocators in 2026 - Finally Stabilised](https://cetra3.github.io/blog/state-of-allocators-2026-finally-stabilised/)
