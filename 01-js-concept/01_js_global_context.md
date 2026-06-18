# JS Global Context

## What Is the Global Context?

The **global context** is the default execution context created by the JS engine before any user code runs. It consists of two concrete things:

1. **The global object** — a single object that lives at the top of the scope chain
2. **`this` binding** — in the global context, `this === globalObject`

The engine creates this context, pushes it onto the call stack, and it stays there for the entire lifetime of the program (it's never popped).

---

## The Global Object by Environment

| Environment | Global Object                   | Access                     |
| ----------- | ------------------------------- | -------------------------- |
| Browser     | `window`                        | `window`, `self`, `frames` |
| Node.js     | `global`                        | `global`                   |
| Web Worker  | `self`                          | `self`                     |
| Bun         | `globalThis` (aliased `global`) | `globalThis`               |
| Deno        | `globalThis`                    | `globalThis`               |

`globalThis` (ES2020) is the unified, spec-level accessor that works everywhere. Under the hood, it's just a reference to whatever the host environment calls the global object.

```js
// All of these are the same object in a browser
window === globalThis; // true
self === globalThis; // true

// In Node.js
global === globalThis; // true
```

---

## What Lives on the Global Object

When JS engine initializes:

- **Intrinsic built-ins** are installed: `Object`, `Array`, `Function`, `Promise`, `Symbol`, `Error`, etc.
- **Host-provided APIs**: `setTimeout`, `fetch`, `console`, `document` (browser), `process` (Node) — these are NOT part of the ECMAScript spec; they're injected by the host
- **Your `var` declarations and function declarations** at the top level get attached as properties

```js
var x = 42;
console.log(globalThis.x); // 42 — var leaks onto global object

let y = 99;
console.log(globalThis.y); // undefined — let/const do NOT attach to global object

function foo() {}
console.log(globalThis.foo); // [Function: foo] — function declarations do
```

`let`, `const`, and `class` at the top level create bindings in a **script-scoped declarative environment record** — separate from the global object. This is a deliberate ES6 design decision.

---

## Execution Context Internals

Every execution context (including global) is an internal record with:

```
ExecutionContext {
  CodeEvaluationState  // generator/async resume point
  Function             // null for global
  Realm                // set of intrinsics, global object, etc.
  ScriptOrModule       // the source
  LexicalEnvironment   // for let/const/class
  VariableEnvironment  // for var/function declarations
  PrivateEnvironment   // for class private fields
}
```

For the **global context** specifically:

- `LexicalEnvironment` → `GlobalEnvironmentRecord` → wraps an `ObjectEnvironmentRecord` (for vars) + a `DeclarativeEnvironmentRecord` (for let/const)
- `VariableEnvironment` → same `GlobalEnvironmentRecord`
- `this` binding → the global object

---

## The Realm

A **Realm** is the full set of intrinsics + global object that forms one self-consistent JS world. Each iframe gets its own Realm, which is why:

```js
// In a browser with an iframe
const arr = iframe.contentWindow.Array;
[] instanceof arr; // false — different Realm, different Array.prototype
```

Node.js exposes `vm.createContext()` to create additional Realms. The TC39 `ShadowRealm` proposal (Stage 3) aims to standardize this.

---

## `this` in the Global Context

```js
// Non-strict mode (sloppy)
console.log(this === globalThis); // true (browser or Node.js REPL)

// Strict mode (at the top level of a module or with 'use strict')
("use strict");
console.log(this); // undefined inside a function, but still globalThis at top-level script scope
```

ES Modules have an implicit `'use strict'`. In a module:

```js
// module.mjs
console.log(this); // undefined — module top-level `this` is undefined, NOT globalThis
```

This is a deliberate spec decision: modules are strict, and strict-mode functions don't get the global object as `this`.

---

## Node.js Nuance: `global` vs `module` Scope

Node.js wraps every CommonJS file in a module wrapper:

```js
(function (exports, require, module, __filename, __dirname) {
  // Your file code runs here
});
```

So `this` at the top of a CJS file is `module.exports`, not `global`:

```js
// file.js (CJS)
console.log(this === global); // false
console.log(this === module.exports); // true

var x = 1;
console.log(global.x); // undefined — it's scoped to the wrapper function
```

In contrast, a `.mjs` file or `"type": "module"` package: top-level `this` is `undefined`.

---

## The Global Scope Chain

```
Global Environment Record
├── ObjectEnvironmentRecord  (backed by globalThis)
│   └── var declarations, function declarations → properties on globalThis
└── DeclarativeEnvironmentRecord
    └── let, const, class → NOT on globalThis
```

Scope chain lookup hits the `DeclarativeEnvironmentRecord` first, then falls through to the `ObjectEnvironmentRecord`, then to the global object itself.

---

## Key Takeaways

- There is exactly **one global context** per Realm; it's never popped off the call stack
- `var` + function declarations at the top level pollute the global object; `let`/`const` do not
- `this` at module top-level is `undefined` — not `globalThis`
- Node.js CJS wrapping means `this !== global` inside a file; use `globalThis` for portability
- Each iframe/worker/vm context has its own Realm and thus its own global object
