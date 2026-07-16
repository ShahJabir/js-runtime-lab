# 📚 Resources

> A curated list of books, papers, documentation, talks, courses, and tools that guide this journey.
> Quality over quantity — everything here has earned its place.

---

## 🏛️ Legend

| Symbol | Meaning                     |
| ------ | --------------------------- |
| ⭐      | Essential — read this first |
| 📖      | Book                        |
| 📄      | Paper / Article / Spec      |
| 🎥      | Talk / Video / Course       |
| 🌐      | Documentation / Website     |
| 🛠️      | Tool                        |
| ✅      | Completed                   |
| 🟡      | In Progress                 |
| ⬜      | Queued                      |

---

## 🌍 Foundational — All Runtimes

### Specs & Docs

| Resource                                                                     | Status | Notes                                                                  |
| ---------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------- |
| ⭐ 📄 [ECMA-262 — ECMAScript Language Specification](https://tc39.es/ecma262/) | ⬜      | The actual language spec. Every runtime implements this, nothing more. |
| 🌐 [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript)    | 🟡      | Best day-to-day reference for language + Web-standard APIs.            |
| 🌐 [TC39 Proposals](https://github.com/tc39/proposals)                        | ⬜      | Track what's coming into the language next, and why.                   |

### Books

| Resource                                                                                                                             | Status | Notes                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------- |
| ⭐ 📖 [You Don't Know JS (Yet) — Kyle Simpson](https://github.com/getify/You-Dont-Know-JS)                                             | 🟡      | Closest thing to a spec-level book that's still readable.                 |
| 📖 [JavaScript: The Definitive Guide — David Flanagan](https://www.oreilly.com/library/view/javascript-the-definitive/9781491952016/) | ⬜      | Comprehensive reference, good for the parts YDKJS doesn't cover in depth. |

### Talks

| Resource                                                                                                    | Status | Notes                                                     |
| ----------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------- |
| ⭐ 🎥 [What the heck is the event loop anyway? — Philip Roberts](https://www.youtube.com/watch?v=8aGhZQkoFbQ) | ✅      | Still the clearest visual mental model of the event loop. |
| 🎥 [In The Loop — Jake Archibald (JSConf.Asia)](https://www.youtube.com/watch?v=cCOL7MC4Pl0)                 | ⬜      | Deeper dive into microtasks vs macrotasks vs rendering.   |

---

## 🟡 Phase 1 — JavaScript & TypeScript Core

| Resource                                                                                                            | Status | Notes                                                                      |
| ------------------------------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------- |
| ⭐ 🌐 [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)                                  | 🟡      | Primary reference for the type system, not just syntax.                    |
| 🌐 [TypeScript's `tsconfig` Reference](https://www.typescriptlang.org/tsconfig)                                      | ⬜      | Every option, especially module resolution across runtimes.                |
| 🎥 [Frontend Masters / Master.dev — JavaScript Learning Path](https://frontendmasters.com/learn/javascript/)         | 🟡      | Core coursework path — professional modern JavaScript.                     |
| 🎥 [Frontend Masters / Master.dev — JavaScript Performance](https://frontendmasters.com/learn/performance/)          | ⬜      | Core coursework path — JavaScript core performance.                        |
| 🎥 [Frontend Masters / Master.dev — Functional JavaScript](https://frontendmasters.com/learn/functional-javascript/) | ⬜      | Core coursework path — professional functional JavaScript.                 |
| 🎥 [Frontend Masters / Master.dev — TypeScript](https://frontendmasters.com/learn/typescript/)                       | ⬜      | Core coursework path — professional modern TypeScript.                     |
| 🎥 [Frontend Masters / Master.dev — Build Tools & Testing](https://frontendmasters.com/learn/build-tools/)           | ⬜      | Core coursework path — professional modern Build Testing Tools.            |
| 🎥 [Frontend Masters / Master.dev — Browser APIs](https://frontendmasters.com/learn/browser-apis/)                   | ⬜      | Core coursework path — Browser APIs.                                       |
| 📄 [V8 Blog](https://v8.dev/blog)                                                                                    | ⬜      | Engine-level notes straight from the V8 team — JIT, GC, ignition/turbofan. |

---

## 🟡 Phase 2 — Node.js

### Courses

| Resource                                                                                    | Status | Notes                                                                              |
| ------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------- |
| ⭐ 🎥 [NodeJS Internals and Architecture — Hussein Nasser (Udemy)](https://www.udemy.com/)    | 🟡      | Connects Node internals to OS/networking fundamentals directly.                    |
| ⭐ 🎥 [Understanding Node.js: Core Concepts — Joseph Heidari (Udemy)](https://www.udemy.com/) | 🟡      | Core-module-first, no-framework approach — matches this repo's philosophy exactly. |

### Official Docs & Source

| Resource                                                    | Status | Notes                                                                        |
| ----------------------------------------------------------- | ------ | ---------------------------------------------------------------------------- |
| ⭐ 🌐 [Node.js Official Docs](https://nodejs.org/en/docs)     | 🟡      | Primary reference. Never skip the official docs.                             |
| 🌐 [libuv Documentation](https://docs.libuv.org/en/v1.x/)    | ⬜      | The actual async I/O engine underneath Node — separate mental model from V8. |
| 🌐 [Node.js source — GitHub](https://github.com/nodejs/node) | ⬜      | Read the C++/JS boundary directly (`lib/`, `src/`).                          |

### Books

| Resource                                                                                              | Status | Notes                                                                |
| ----------------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------- |
| 📖 [Node.js Design Patterns — Mario Casciaro & Luciano Mammino](https://www.nodejsdesignpatterns.com/) | ⬜      | Goes past "how" into architectural trade-offs for real Node systems. |

---

## ⬜ Phase 3 — Deno

_Resources will be expanded when Phase 3 begins._

### Bookmarked for Later

| Resource                                                                                             | Notes                                                       |
| ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| ⭐ 🌐 [Deno Manual](https://docs.deno.com/runtime/manual)                                              | Primary reference, incl. permission model.                  |
| 🌐 [Deno source — GitHub](https://github.com/denoland/deno)                                           | Rust core + Tokio — worth reading once Rust phase overlaps. |
| 📄 [Deno vs Node.js — Deno's own comparison](https://docs.deno.com/runtime/manual/node/compatibility) | Where npm compatibility does and doesn't hold up.           |

---

## ⬜ Phase 4 — Bun

_Resources will be expanded when Phase 4 begins._

### Bookmarked for Later

| Resource                                                | Notes                                                     |
| ------------------------------------------------------- | --------------------------------------------------------- |
| ⭐ 🌐 [Bun Docs](https://bun.sh/docs)                     | Primary reference.                                        |
| 🌐 [Bun source — GitHub](https://github.com/oven-sh/bun) | Zig codebase — a preview of the eventual Rust/Zig phases. |
| 📄 [Bun's JavaScriptCore rationale](https://bun.sh/blog) | Why JSC over V8, and what that trades off in practice.    |

---

## 🟡 Phase 5 — Cloudflare Workers

| Resource                                                                                                         | Status | Notes                                                                                      |
| ---------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------ |
| ⭐ 🌐 [Cloudflare Docs](https://developers.cloudflare.com/)                                                        | 🟡      | Primary reference for the entire stack (Pages, D1, KV, R2, Queues, Durable Objects, etc.). |
| 🌐 [`workerd` source — GitHub](https://github.com/cloudflare/workerd)                                             | ⬜      | The actual open-source Workers runtime — V8 isolates without Node.                         |
| 📄 [How Workers isolates work — Cloudflare Blog](https://blog.cloudflare.com/cloud-computing-without-containers/) | ⬜      | Isolate-per-request model vs container/VM cold starts, from the source.                    |

---

## 🔬 Cross-Runtime & Engine-Level (Cross-cutting)

These apply across Node, Deno, Bun, and Workers phases.

| Resource                                                                                                                              | Status | Notes                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------- |
| 📄 [State of JS — Runtime section (annual survey)](https://stateofjs.com/)                                                             | ⬜      | Yearly pulse on runtime adoption and sentiment.                            |
| 📄 [WinterCG — Web-interoperable Runtimes Community Group](https://wintercg.org/)                                                      | ⬜      | The actual standardization effort behind Deno/Bun/Workers API convergence. |
| 🎥 [JS engines: the good parts — various conf talks](https://www.youtube.com/results?search_query=js+engine+internals+conference+talk) | ⬜      | Rotating watchlist, not a single fixed resource.                           |

---

## 🧰 General Tools Used Across This Repo

| Tool                   | Purpose                                                       |
| ---------------------- | ------------------------------------------------------------- |
| 🛠️ Node.js / Deno / Bun | The three runtimes under direct comparison                    |
| 🛠️ `wrangler`           | Cloudflare Workers local dev, deploy, and D1/KV/R2 management |
| 🛠️ `clinic.js`          | Node performance profiling (event loop delay, flame graphs)   |
| 🛠️ `0x`                 | Flame graph generation for Node processes                     |
| 🛠️ Excalidraw           | Diagramming event loops, isolate models, and architecture     |

---

> 📌 This list grows as the journey does. A resource earns its place here by being genuinely useful — not just frequently cited.
