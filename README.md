# ⚙️ js-runtime-lab — A Systems-Level Learning Path

> **Not a tutorial dump. Not a framework crash course.**
> This repository is a **deep, internals-first journey into JavaScript/TypeScript runtimes** — from the engine and event loop up through Node.js, Deno, Bun, and Cloudflare Workers.

If you are here to _"learn Express"_ or _"learn a framework"_, this repo is **not for you**.
If you want to **understand what a JS runtime really is and how it works under the hood — in all its current forms**, welcome.

![Alt](https://repobeats.axiom.co/api/embed/abce5e301e4393e503fdfb70248e5d576ec8da16.svg "Repobeats analytics image")

---

## 🎯 Purpose of This Repository

This repository exists to:

- Understand **runtimes as systems**, not just "places JS runs"
- Learn **core/native APIs** in every runtime before reaching for a framework
- Build **deep intuition** for the event loop, I/O, and concurrency models each runtime uses
- Understand the **engines** underneath (V8, JavaScriptCore) and how each runtime embeds them
- Compare runtimes **against each other**, not just learn them in isolation
- Learn how each runtime achieves **async I/O, isolation, and performance**
- Read and understand **runtime source code and specs** confidently
- Explore **edge computing architecture** through Cloudflare Workers

This is a **learning log + reference + code lab**.

---

## 🧠 Philosophy

```text
Frameworks come and go.
Runtimes and their internals stay forever.
```

Principles followed in this repo:

- ❌ No Express / Nest / Fresh / Hono without understanding what's underneath
- ❌ No unnecessary npm packages when a native/core API does the job
- ✅ Core/native APIs first, in every runtime
- ✅ Source-code and spec curiosity over blog-post trust
- ✅ Performance and correctness over convenience
- ✅ Understanding "why", not just "how"

Whenever possible, things are built **from scratch using each runtime's native APIs**.

---

## 🗺️ Learning Scope

This repository covers **far more than just Node.js**:

- JavaScript engine internals (V8, JavaScriptCore) — event loop, memory, JIT basics
- TypeScript — type system internals, not just syntax
- Node.js architecture — libuv, async I/O, streams, native addons
- Deno — permission model, Web-standard APIs, secure-by-default design
- Bun — Zig-based runtime, native bundler/test runner, JavaScriptCore integration
- Cloudflare Workers — V8 isolates, `workerd`, Durable Objects, edge-native storage (D1/KV/R2)
- Cross-runtime comparisons — where these runtimes agree, diverge, and why

Think of this as:

> **Systems Engineering through the lens of JavaScript Runtimes**

---

## 📍 Current Focus

```text
Phase 1 → JavaScript & TypeScript Core (engine-level)
Phase 2 → Node.js Internals
Phase 3 → Deno
Phase 4 → Bun
Phase 5 → Cloudflare Workers
Phase 6 → Cross-Runtime Systems & Architecture
```

See [`LEARNING_LOG.md`](./LEARNING_LOG.md) for the running journal and [`RESOURCES.md`](./RESOURCES.md) for the curated reading list per phase.

---

## 📦 Core Rule: Depth Before Breadth

Every topic explored here follows the same progression:

1. **What is it?** — Conceptual foundation
2. **How does it work?** — Internal mechanics
3. **Why is it designed this way?** — Trade-offs and history
4. **Where does it break?** — Failure modes and edge cases
5. **How do I use it well?** — Practical, performance-aware application

External frameworks and GUIs are only discussed **conceptually** or for comparison — native APIs, CLIs, and official docs are the primary interface.

---

## 🧪 How to Use This Repository

### 1️⃣ Read

Each directory contains **Markdown notes** explaining concepts, internals, and trade-offs — not just "how to."

### 2️⃣ Code

Every concept is backed by small, runnable experiments — minimal examples, no boilerplate.

### 3️⃣ Break Things Intentionally

- Block the event loop
- Exhaust memory
- Flood sockets
- Force a Worker isolate to cold-start under load
- Compare the same program's behavior across Node, Deno, and Bun

Then understand **why it broke** and what the runtime was doing.

---

## 🚀 Who This Repo Is For

This repository is ideal for:

- Backend engineers who want **real depth**, not framework fluency
- Security engineers who need to understand runtime attack surfaces
- Systems programmers curious about how JS runtimes are actually built
- Developers moving beyond frameworks
- Anyone who wants to read Node/Deno/Bun/`workerd` source code and follow it

This repo is **not beginner-friendly** — and that is intentional.

---

## 📌 Expected Outcome

After completing this repository, you should be able to:

- Explain the event loop and I/O model of Node, Deno, and Bun — and where they differ
- Build servers without frameworks, on any of the four runtimes
- Write memory-efficient streaming systems
- Debug event-loop blocking and isolate cold-start issues
- Reason about V8 isolates vs OS processes vs containers
- Design an edge-native architecture on Cloudflare Workers (Durable Objects, D1, KV, R2, Queues)
- Learn any new JS-runtime-adjacent tool effortlessly, because the fundamentals are solid

---

## 🛠️ Environment Setup

> 📌 Each runtime folder is self-contained. Install what you need for the phase you're on.

```bash
node -v      # Node.js — v22+ recommended
deno -v      # Deno — v2+
bun -v       # Bun — v1.3+
wrangler -v  # Cloudflare Workers CLI, for phase 5
```

```bash
# Run a Node example
node 02-node/core-modules/<example>/main.js

# Run a Deno example
deno run --allow-net 03-deno/<example>/main.ts

# Run a Bun example
bun run 04-bun/<example>/main.ts

# Run a Worker locally
cd 05-cloudflare-workers/<example> && wrangler dev
```

---

## ⚠️ Disclaimer

This repository is:

- Opinionated
- Internals-focused
- Performance-oriented

It prioritizes **understanding over speed** and **depth over comfort**.

Notes here may contradict conventional wisdom — when they do, there will always be a reason.

---

## 👤 Author

<p align="center">
<a href="https://shahjabir.com.bd">
<img src="https://img.shields.io/badge/Website-ShahJabir-black" alt="Website" /></a>
<a href="https://github.com/ShahJabir">
<img src="https://img.shields.io/badge/Github-ShahJabir-white" alt="Github" /></a>
<a href="https://www.facebook.com/sjtaqi">
<img src="https://img.shields.io/badge/Facebook-ShahJabir-blue" alt="Facebook" /></a>
<a href="https://x.com/TaqiJabir">
<img src="https://img.shields.io/badge/X-TaqiJabir-black" alt="Twitter" />
</a>
<a href="https://www.linkedin.com/in/shahjabir/">
<img src="https://img.shields.io/badge/Linkedin-shahjabirtaqi-blue" alt="Linkedin" /></a>
</p>

---

## 📄 License

This repository is licensed under the [MIT License](./LICENSE).
All notes, diagrams, and code are original work unless explicitly cited.

---

## 🏁 Final Words

```text
Most people use a JS runtime.
Very few understand more than one.
This repo is for the second group.
```

Happy Noding, Denoing, Bunning, and Working 🚀
