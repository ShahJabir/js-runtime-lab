# Stack and Heap Memory in JavaScript

> Series: Node.js Core & Internals
> Related: JS Global Context · Event Loop · Hoisting · TDZ · Closures

## TL;DR

JS has two memory regions at runtime: the **call stack** (fixed-size, LIFO, holds execution contexts and — in some engines — unboxed primitives) and the **heap** (large, unordered, holds objects, closures, and anything with a lifetime that outlives a single function call). Where a value physically lives is an _engine implementation detail_, not a language guarantee — the spec only defines observable behavior (pass-by-value for primitives, pass-by-reference-to-object for objects), not memory layout. Everything below describes how V8 actually does it, since that's what Node, Chrome, and Deno run on.

---

## 1. The Two Regions

|                         | Stack                                                                                                 | Heap                                                                         |
| ----------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Structure               | Contiguous, LIFO                                                                                      | Unordered graph of objects                                                   |
| Size                    | Fixed, small (~1MB default per thread in V8/Node)                                                     | Large, grows dynamically (GBs)                                               |
| Allocation/deallocation | Automatic, O(1), pointer bump on push/pop                                                             | Managed by garbage collector, non-deterministic timing                       |
| What lives there        | Execution contexts (stack frames): function call info, primitive values, references _to_ heap objects | Objects, arrays, functions, closures' environment records, strings (usually) |
| Failure mode            | `RangeError: Maximum call stack size exceeded`                                                        | `FATAL ERROR: Reached heap limit... JavaScript heap out of memory`           |

The stack is conceptually identical to what you already know from C/Rust/Go — every function call pushes a frame, every return pops it. The difference in JS (and Python) is that frames hold **references**, not the objects themselves, for anything non-primitive.

---

## 2. Primitives vs Reference Types — Where They Actually Live

The spec defines 7 primitive types: `undefined`, `null`, `boolean`, `number`, `bigint`, `string`, `symbol`. These are **immutable** and **compared/passed by value**.

```javascript
let a = 10;
let b = a; // value copied
b++;
console.log(a, b); // 10 11 — independent
```

In V8 specifically:

- Small integers (**Smis** — 31-bit signed on 32-bit builds, 32-bit on 64-bit builds with pointer compression) are encoded directly in the pointer slot — no heap allocation at all. This is a classic tagged-pointer trick: the low bit distinguishes a Smi from a heap pointer.
- Numbers outside the Smi range become **HeapNumber** objects — boxed doubles, allocated on the heap, with the stack slot holding a pointer to them.
- Strings are heap-allocated (V8 has multiple string representations — `SeqString`, `ConsString` for concatenation, `SlicedString` for substrings — entirely invisible to you, but it's why naive string concat in a hot loop used to be a known perf trap before V8's rope-like `ConsString` optimization).

So even "primitives" aren't purely stack-resident in V8 — small numbers are inlined into the pointer, everything else is a heap object referenced by a stack (or heap) slot. This is different from Rust, where `i32` genuinely is N bytes on the stack with zero indirection, no tagging, no boxing.

Objects, arrays, and functions are always heap-allocated and **passed by reference to the object** (not "by reference" in the C++/pointer-parameter sense — you can't reassign the caller's binding, but you can mutate the shared object):

```javascript
function mutate(obj) {
  obj.x = 99;
} // mutates shared heap object
function reassign(obj) {
  obj = { x: 1 };
} // rebinds local reference only

const o = { x: 1 };
mutate(o);
console.log(o.x); // 99
reassign(o);
console.log(o.x); // still 99
```

---

## 3. The Call Stack — Mechanics

Each function call pushes a **stack frame** (V8 calls it an execution context) containing:

- A reference to the **variable environment** (where `var`/function-scoped bindings resolve — this is the same environment record machinery from the closures doc)
- The `this` binding
- A return address
- References to arguments and local primitives (or pointers to heap objects)

```javascript
function c() {
  console.log(new Error().stack);
} // frame 3
function b() {
  c();
} // frame 2
function a() {
  b();
} // frame 1
a(); // frame 0 (global)
```

At the deepest point you have 4 frames stacked. Pop on return, same as any native call stack — V8 doesn't reinvent this part.

### Stack overflow

```javascript
function recurse(n) {
  return recurse(n + 1);
}
recurse(0); // RangeError: Maximum call stack size exceeded
```

No implicit tail-call optimization in V8 (despite `'use strict'` proper-tail-calls being briefly spec'd and shipped in Safari/JSC, then never adopted by V8 — TCO in JS is effectively dead outside of JavaScriptCore). Deep recursion without an explicit base case, or genuinely deep-but-correct recursion (e.g. walking a large unbalanced tree), will blow the stack. Compare to Scheme/Haskell where TCO is a language guarantee you can lean on architecturally — in JS you generally rewrite to an explicit loop + manual stack (array) for unbounded recursion depth.

You can raise the limit via `node --stack-size=<KB>`, though this just resizes the OS thread stack V8 runs on — it doesn't change the fundamental constraint, and setting it too high risks a hard native crash (SIGSEGV) instead of a catchable `RangeError`, because V8's stack-limit check is a soft guard against the real OS stack boundary.

---

## 4. V8's Heap Architecture

V8's heap is **generational**, built on the empirical observation that most objects die young (the "generational hypothesis" — same premise behind Java's JVM heap design and Python's gen0/1/2).

```
┌─────────────────────────────────────────────┐
│                  V8 Heap                     │
│  ┌───────────────┐  ┌──────────────────────┐ │
│  │ New Space      │  │ Old Space            │ │
│  │ (Young Gen)    │  │ (Old Gen)            │ │
│  │  ~1-16MB       │  │  grows as needed     │ │
│  │  two semi-     │  │  Mark-Sweep-Compact  │ │
│  │  spaces        │  │                      │ │
│  └───────────────┘  └──────────────────────┘ │
│  ┌───────────────┐  ┌──────────────────────┐ │
│  │ Large Object   │  │ Code Space           │ │
│  │ Space (>~1MB)  │  │ (JIT-compiled code)  │ │
│  └───────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────┘
```

### New Space (Young Generation) — the Scavenger

Split into two **semi-spaces** ("from" and "to"). New objects allocate into "to" via simple pointer-bump (fast — no free-list search needed). When "to" fills:

1. **Scavenge**: walk live objects reachable from roots, copy them into "from" (which is currently empty)
2. Swap the labels — "from" becomes "to" and vice versa
3. Everything _not_ copied is simply abandoned — no per-object free() call, the whole semi-space is just reclaimed wholesale

This is **Cheney's algorithm**, and it's why young-gen collection is cheap: cost is proportional to _surviving_ objects, not total garbage. An object surviving two scavenges gets **promoted** ("tenured") to Old Space.

### Old Space (Old Generation) — Mark-Sweep-Compact

Long-lived objects (closures capturing module-level state, caches, anything referenced from a long-lived object graph) end up here. V8 uses:

- **Mark phase**: traverse from GC roots (stack, globals, handles), mark every reachable object
- **Sweep phase**: reclaim unmarked memory, add to free lists
- **Compact phase** (periodic, not every cycle): defragment by relocating live objects, updating all pointers — expensive, so V8 runs this incrementally and concurrently to avoid long main-thread pauses

Since V8 8.0+, most of this runs via **Orinoco** — V8's concurrent/incremental/parallel GC — which moves marking and sweeping off the main thread where possible, specifically to avoid the "stop the world for 200ms" jank that older GC designs caused in long-running Node services.

### Pointer compression

On 64-bit builds, V8 compresses heap pointers to 32 bits (relative to a base address) by default since V8 7.0. This roughly halves memory for pointer-heavy object graphs at a small dereference cost — relevant if you're ever explaining why a Node process's heap footprint looks smaller than naive 64-bit pointer math would suggest.

---

## 5. Closures and the Heap (tying back to the closures doc)

This is the part that connects directly to what you already documented. When a function is returned and it references an outer variable, that variable's binding **cannot live on `outer`'s stack frame** — that frame is popped when `outer` returns. V8 has to detect this (via escape analysis at parse/compile time) and allocate the **environment record holding that variable on the heap** instead of the stack, so it survives the enclosing frame's death.

```javascript
const outer = () => {
  let counter = 0; // would normally be stack-local...
  const add1 = () => {
    counter++; // ...but is REFERENCED by an escaping closure
    return counter;
  };
  return add1; // so V8 heap-allocates counter's binding
};
```

This is exactly why your earlier `outer()`/`add1` examples worked at all — `counter` outlived `outer`'s call. If a variable is _not_ captured by anything that escapes the function, V8's optimizing compiler (TurboFan) can prove it never escapes and keep it purely on the stack (or even in a register) — a real, measurable optimization, conceptually identical to **Go's escape analysis** deciding stack vs heap per variable, except Go's decision is made by the compiler ahead-of-time and is far more reliably stack-favoring, while V8's is a runtime JIT heuristic that can de-optimize if your assumptions about a function's usage turn out wrong (e.g. a previously non-escaping closure suddenly being stored somewhere long-lived).

---

## 6. Stack Overflow vs Out-of-Memory — Different Failure Modes

|                 | Cause                                                      | Error                                            | Recoverable?                                                 |
| --------------- | ---------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------ |
| Stack overflow  | Too many nested function calls                             | `RangeError: Maximum call stack size exceeded`   | Yes — catchable `RangeError`, process survives               |
| Heap exhaustion | Too many live objects, or a leak preventing GC reclamation | `FATAL ERROR: ... JavaScript heap out of memory` | **No** — V8 aborts the process; not a catchable JS exception |

The asymmetry matters operationally: a runaway recursive function degrades gracefully (throw, catch, continue), while a heap leak in a long-running Node server eventually hard-crashes the process. This is the practical reason memory leak detection in Node services (unbounded caches, event listeners never removed, closures pinning large objects) gets disproportionate attention compared to stack issues.

---

## 7. Inspecting It Yourself

```bash
# Raise/inspect heap limits
node --max-old-space-size=4096 app.js      # cap old-gen heap at 4GB
node --stack-size=2000 app.js               # raise stack size (KB)

# Runtime introspection
node -e "console.log(process.memoryUsage())"
# { rss, heapTotal, heapUsed, external, arrayBuffers }
```

```javascript
const used = process.memoryUsage();
console.log(`heapUsed: ${(used.heapUsed / 1024 / 1024).toFixed(2)} MB`);
```

For real leak hunting: `node --inspect`, take heap snapshots via Chrome DevTools' Memory tab, diff two snapshots taken before/after a suspected leaking operation, look at retainer paths (what's holding a reference preventing GC) rather than just object counts.

---

## 8. Cross-Engine Nuances

| Engine                   | Used by                     | GC design                                                                                                                                                      |
| ------------------------ | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **V8**                   | Node.js, Chrome, Deno, Edge | Generational: Scavenger (young) + Orinoco mark-sweep-compact (old), as above                                                                                   |
| **JavaScriptCore (JSC)** | Bun, Safari                 | Different generational design — a nursery + an old-gen with its own concurrent marking ("Riptide"); also notably _does_ implement proper tail calls, unlike V8 |
| **SpiderMonkey**         | Firefox                     | Generational + incremental, distinct implementation (not relevant to your Node/Bun/Deno stack but worth knowing it's a third independent design)               |

**Deno** runs on V8, same as Node — heap/stack behavior is essentially identical at this layer; the differences between Deno and Node live in the permissions model and module system, not memory architecture.

**Bun** runs on JSC, not V8. This means heap snapshot tooling, GC tuning flags, and exact promotion/collection behavior all differ from Node — you cannot assume a `--max-old-space-size`-equivalent flag works, and JSC's GC pause characteristics differ from Orinoco's. If you're ever debugging a memory issue in a Bun service, the V8-specific intuition from this doc only transfers at the conceptual level (generational hypothesis, mark-sweep), not the tooling level.

---

## 9. Cross-Language Comparison

| Language       | Stack/heap decision                                                                                                                                                                                           | GC model                                                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **JS (V8)**    | Engine heuristic via escape analysis; primitives often inlined (Smis), objects always heap                                                                                                                    | Generational, tracing GC (Scavenger + Orinoco)                                                                                                                |
| **Python**     | Everything is a heap object, even small ints (with a cached pool for -5..256) — no stack-allocated value types at all                                                                                         | Reference counting (immediate) + generational cycle-detecting GC for reference cycles refcounting can't resolve                                               |
| **Go**         | Compiler-determined per variable via static escape analysis — provably non-escaping vars are stack-allocated, period, decided at compile time                                                                 | Concurrent tri-color mark-sweep, non-generational (deliberately — Go's GC team found generational hypothesis didn't hold as cleanly for typical Go workloads) |
| **Rust**       | Explicit and compile-time enforced: stack by default, heap only via `Box`, `Vec`, `String`, `Rc`/`Arc`. Ownership model means deallocation is deterministic (`Drop` runs at scope exit), not GC-driven at all | None — ownership/borrowing replaces GC entirely                                                                                                               |
| **Java (JVM)** | Heap by default for objects; JIT escape analysis can stack-allocate or scalar-replace objects proven non-escaping (similar spirit to V8/Go)                                                                   | Generational by default (young/old, or G1/ZGC/Shenandoah depending on JVM flags)                                                                              |
| **C/C++**      | Fully manual/explicit — `int x` is stack, `malloc`/`new` is heap, you own the lifetime                                                                                                                        | None in C; C++ RAII/smart pointers (`unique_ptr`, `shared_ptr`) give deterministic-ish destruction without a tracing GC                                       |

The throughline worth keeping: **JS sits closest to Java's pre-escape-analysis model** — heap-by-default with engine-level heuristics trying to claw back stack allocation where provably safe — while Go and Rust both push that decision to compile time with much stronger guarantees (Go via mandatory escape analysis, Rust via the ownership system making it part of the type system itself). Python is the most heap-committed of the bunch — there's no stack-allocated value type story there at all, which is part of why Python's per-object overhead is famously high compared to Go or Rust for equivalent data.
