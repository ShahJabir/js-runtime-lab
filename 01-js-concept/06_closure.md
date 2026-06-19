# JS Closure

## What a Closure Actually Is

A **closure** is a function bundled together with references to the **environment** in which it was created. More precisely: a closure is a function object that holds a reference to the **Lexical Environment** (environment record) that was active at the time the function was defined — not called.

This is not a special opt-in feature. Every function in JavaScript is a closure. The question is whether the captured environment outlives the scope that created it, which is when closures become observable and interesting.

---

## The Spec Internals

Every function object has an internal slot:

```
[[Environment]] → LexicalEnvironment (at definition time)
```

When a function is created, the engine captures the _current_ Lexical Environment and stores it in `[[Environment]]`. When that function is later called, a new `FunctionEnvironmentRecord` is created whose **outer reference** points to `[[Environment]]`.

This forms the **scope chain** — a linked list of environment records resolved at runtime.

```
FunctionEnvironmentRecord (call site)
        │ outer
        ▼
LexicalEnvironment captured at definition  ← [[Environment]]
        │ outer
        ▼
    parent scope
        │ outer
        ▼
  GlobalEnvironmentRecord
        │ outer
        ▼
       null
```

Identifier resolution walks this chain. The function's _call site_ is irrelevant — only its _definition site_ determines scope.

---

## The Minimal Closure

```js
function makeCounter() {
  let count = 0; // lives in makeCounter's environment record

  return function () {
    // this function closes over that environment record
    return ++count;
  };
}

const counter = makeCounter(); // makeCounter's stack frame is gone
counter(); // 1
counter(); // 2
counter(); // 3 — count persists because the returned function holds [[Environment]]
```

`makeCounter`'s execution context is popped from the call stack after it returns. But its `FunctionEnvironmentRecord` is **not garbage collected** because the returned function's `[[Environment]]` still references it. The record stays alive as long as the closure does.

---

## Environment Records, Not Values

Closures capture **bindings** (references to variables in an environment record), not values. This is the source of most closure-related bugs.

```js
const fns = [];

for (var i = 0; i < 3; i++) {
  fns.push(function () {
    return i;
  });
}

fns[0](); // 3
fns[1](); // 3
fns[2](); // 3
```

All three functions close over the _same_ `i` binding in the _same_ environment record. `var` doesn't create a new binding per iteration — there's one `i` in the enclosing function's record, and by the time the functions execute, the loop has incremented it to `3`.

Fix with `let` — which creates a new `FunctionEnvironmentRecord` (actually a new declarative env record) per iteration:

```js
for (let i = 0; i < 3; i++) {
  fns.push(function () {
    return i;
  });
}

fns[0](); // 0
fns[1](); // 1
fns[2](); // 2
```

`let` in a `for` loop is specced to create a fresh binding per iteration, copying the previous value in. Each function closes over a _different_ environment record with its own `i`.

Fix with IIFE (pre-ES6 pattern, forces a new scope):

```js
for (var i = 0; i < 3; i++) {
  fns.push(
    (function (i) {
      // new scope, new `i` parameter binding
      return function () {
        return i;
      };
    })(i),
  );
}
```

---

## Mutation Through Closures

Because closures share the binding, mutations are visible across all closures over the same environment:

```js
function shared() {
  let x = 0;

  const inc = () => ++x;
  const dec = () => --x;
  const get = () => x;

  return { inc, dec, get };
}

const s = shared();
s.inc(); // x = 1
s.inc(); // x = 2
s.dec(); // x = 1
s.get(); // 1 — all three functions see the same x
```

This is the module pattern — intentional shared mutable state, encapsulated behind a function boundary.

---

## Closures and the Scope Chain in Detail

```js
const a = 1;

function outer() {
  const b = 2;

  function middle() {
    const c = 3;

    function inner() {
      console.log(a, b, c); // all resolved via scope chain
    }

    return inner;
  }

  return middle;
}

const m = outer(); // outer's env record kept alive by middle's [[Environment]]
const i = m(); // middle's env record kept alive by inner's [[Environment]]
i(); // 1 2 3
```

`inner`'s scope chain at call time:

```
inner's env record (c is here? no — c is in middle's record)
  → middle's env record  (c = 3)
    → outer's env record (b = 2)
      → global env record (a = 1)
```

Each function along the chain keeps its environment record alive as long as a closure that references it is reachable.

---

## Closures Over `let` and `const`

`const` closes over the binding, not the value — but since `const` bindings are immutable after initialization, there's no observable mutation:

```js
function makeGreeter(name) {
  const greeting = `Hello, ${name}`;
  return () => greeting; // closes over const binding — effectively closes over value
}
```

`let` closures can be mutated from outside the closure via another function in the same scope:

```js
function pair() {
  let val = 0;
  return {
    set: (v) => {
      val = v;
    },
    get: () => val,
  };
}

const p = pair();
p.set(42);
p.get(); // 42
```

---

## Closure Over `this` — Arrow Functions

Regular functions have their own `this` binding, determined at call time. Arrow functions have no `[[ThisValue]]` slot — they close over `this` from their enclosing lexical scope exactly like any other variable.

```js
function Timer() {
  this.ticks = 0;

  // Regular function — `this` is undefined (strict) or global (sloppy) in the callback
  setInterval(function () {
    this.ticks++; // wrong `this`
  }, 1000);

  // Arrow function — closes over `this` from Timer's execution context
  setInterval(() => {
    this.ticks++; // correct — lexical `this`
  }, 1000);
}
```

Internally: when an arrow function is created, the engine captures the current `this` binding from the environment and stores it. There's no dynamic `this` binding at call time.

---

## Partial Application and Currying via Closure

Closures are the mechanism behind partial application:

```js
function multiply(a) {
  return function (b) {
    // closes over `a`
    return a * b;
  };
}

const double = multiply(2); // a = 2 locked in
double(5); // 10
double(9); // 18
```

And currying:

```js
const curry = (fn) => {
  const arity = fn.length;
  return function curried(...args) {
    // closes over fn and arity
    if (args.length >= arity) return fn(...args);
    return (...more) => curried(...args, ...more); // closes over args
  };
};
```

Each returned function closes over the accumulated arguments, forming a chain of environment records.

---

## Memory Implications

A closure keeps its entire captured environment record alive, not just the variables it references. Engines like V8 perform **escape analysis** and try to prune unreferenced bindings from the captured scope, but this is an optimization, not a guarantee.

```js
function leak() {
  const HUGE = new Array(1_000_000).fill(0); // 8MB+ on heap
  const small = 1;

  return function () {
    return small; // only references small — but HUGE may still be retained
  };
}

const fn = leak(); // HUGE potentially kept alive until fn is GC'd
```

Practical implication: long-lived closures (event listeners, timers, module-level functions) that close over large scopes can cause memory leaks. Nullify references explicitly when needed:

```js
function cleanup() {
  let data = heavyLoad();
  const result = process(data);
  data = null; // release before returning closure
  return () => result;
}
```

---

## Closures in Modules (ES Modules)

ES module top-level bindings live in a `ModuleEnvironmentRecord`. Named exports are live bindings — consumers of the module observe mutations:

```js
// counter.mjs
export let count = 0;
export const increment = () => count++;

// main.mjs
import { count, increment } from "./counter.mjs";
console.log(count); // 0
increment();
console.log(count); // 1 — live binding, not a copy
```

This is closure at the module level — `increment` closes over the module's environment record, and the export is a live reference into the same record.

---

## IIFE — Immediately Invoked Function Expression

Before block scoping, IIFEs were the standard way to create isolated closure scopes:

```js
const module = (function () {
  let private = 0; // not accessible outside

  return {
    get: () => private,
    set: (v) => {
      private = v;
    },
  };
})();
```

With `let`/`const` and ES modules, IIFEs are mostly obsolete for this purpose — but still valid for immediately-needed scope isolation or wrapping async top-level logic.

---

## Closure vs. Class — Tradeoffs

Both closures and classes encapsulate state. Key differences:

|                     | Closure                                    | Class                                      |
| ------------------- | ------------------------------------------ | ------------------------------------------ |
| State storage       | Environment record (heap)                  | Object properties                          |
| Method sharing      | Each instance gets its own function object | Methods on prototype (shared)              |
| Privacy             | Genuine — no external access path          | `#privateField` (spec-level) or convention |
| `this` binding      | Captured lexically (arrow) or dynamic      | Dynamic, receiver-based                    |
| Memory per instance | Higher (N function objects)                | Lower (shared prototype methods)           |
| Inheritance         | Via composition                            | Via prototype chain                        |

```js
// Closure — each call creates new function objects
function makePoint(x, y) {
  return {
    getX: () => x, // new function object per instance
    getY: () => y,
  };
}

// Class — getX/getY live on prototype, shared across instances
class Point {
  #x;
  #y;
  constructor(x, y) {
    this.#x = x;
    this.#y = y;
  }
  getX() {
    return this.#x;
  }
  getY() {
    return this.#y;
  }
}
```

For high-volume object creation (thousands of instances), classes win on memory. For low-count, privacy-critical encapsulation, closures are cleaner.

---

## Key Takeaways

- Every function is a closure — it holds `[[Environment]]` pointing to its definition-time Lexical Environment
- Closures capture **bindings** in environment records, not values — mutations are shared
- `var` in loops creates one binding; `let` creates a new binding per iteration
- Arrow functions close over `this` lexically — no dynamic `this` at all
- Closure scope chains are walked at **call time** but rooted at **definition time**
- Long-lived closures retain entire environment records — can cause memory leaks
- ES module named exports are live bindings — also closure semantics at module level
- Closures vs. classes is a memory/privacy/composition tradeoff, not a right/wrong choice
