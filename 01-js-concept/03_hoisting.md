# JS Hoisting

## What Hoisting Actually Is

"Hoisting" is a mental model, not a runtime operation. Nothing physically moves. What actually happens: during the **creation phase** of an execution context, the engine scans for declarations and creates bindings in the environment record _before_ any code runs. By the time execution begins, those bindings already exist — which _appears_ as if declarations were "moved to the top."

The spec term is **binding instantiation**.

---

## Execution Context: Two Phases

When a function (or the global context) is entered:

1. **Creation phase** (binding instantiation)
   - All `var` declarations are found and initialized to `undefined`
   - All function declarations are fully hoisted (name + function object)
   - `let` / `const` / `class` bindings are created but left **uninitialized** (TDZ)
   - The `arguments` object is created (non-arrow functions)

2. **Execution phase**
   - Code runs line by line
   - Assignments execute, initializations happen

---

## `var` Hoisting

`var` bindings are:

- **Scoped to the enclosing function** (or global), not the block
- **Initialized to `undefined`** during creation phase
- Re-assignable by the declaration when execution reaches it

```js
console.log(x); // undefined — binding exists, not yet assigned
var x = 5;
console.log(x); // 5

// What the engine effectively does:
var x; // creation phase: initialized to undefined
console.log(x); // undefined
x = 5; // execution phase: assignment happens here
console.log(x); // 5
```

### `var` in blocks — no block scope

```js
if (true) {
  var x = 10; // hoisted to enclosing function/global, NOT block-scoped
}
console.log(x); // 10 — leaks out of the block

for (var i = 0; i < 3; i++) {}
console.log(i); // 3 — leaks out of the for loop
```

This is why the classic `var` in a loop closure bug exists:

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // 3, 3, 3 — all closures share one `i`
}

// Fix: use let (block-scoped, new binding per iteration)
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // 0, 1, 2
}
```

---

## Function Declaration Hoisting

Function **declarations** are fully hoisted — name AND body. You can call them before the declaration line.

```js
foo(); // works — 'foo' binding exists and holds the full function object

function foo() {
  console.log("hoisted");
}
```

### Function declaration vs. function expression

```js
bar(); // TypeError: bar is not a function
var bar = function () {};
// `bar` is hoisted as `undefined` (var hoisting), not as a function
```

```js
baz(); // ReferenceError (TDZ) if let/const, or TypeError if var
const baz = () => {};
```

### Function declarations in blocks (FiB)

This behavior is **not specified by ECMAScript** and varies by engine/strict mode:

```js
if (true) {
  function blockFn() {
    return 1;
  }
}

// Non-strict: blockFn may or may not be hoisted to enclosing scope (engine-dependent)
// Strict: blockFn is block-scoped — NOT hoisted outside the block
```

Always avoid function declarations inside blocks. Use `const fn = () => {}` instead.

---

## `let` and `const` Hoisting

`let` and `const` bindings **are** hoisted (created in environment record during creation phase) — but they are **not initialized**. Accessing them before initialization throws a `ReferenceError`. The period between binding creation and initialization is the **Temporal Dead Zone (TDZ)** (covered separately).

```js
console.log(a); // ReferenceError: Cannot access 'a' before initialization
let a = 1;
```

---

## `class` Hoisting

Classes are hoisted (binding created) but not initialized — same as `let`. The class body is evaluated when execution reaches the declaration.

```js
const obj = new MyClass(); // ReferenceError — TDZ
class MyClass {}
```

---

## Function Declarations vs `var` — Name Collision

When both a `var` and a function declaration share the same name, the **function declaration wins** during initialization (it overwrites the `undefined` that `var` would set):

```js
console.log(typeof foo); // 'function' — not 'undefined'
var foo = "overwritten";
function foo() {}
console.log(typeof foo); // 'string' — var assignment ran
```

Order of binding instantiation per spec:

1. `var` declarations → initialized to `undefined`
2. Function declarations → bind function object, potentially overwriting `undefined`

---

## Hoisting in the Environment Record

Internally, bindings live in **Environment Records**:

- `FunctionEnvironmentRecord` — for function execution contexts
- `GlobalEnvironmentRecord` — for the global context
- `DeclarativeEnvironmentRecord` — for blocks, modules

During `FunctionDeclarationInstantiation` (the spec algorithm):

1. Create bindings for all formal parameters
2. Create bindings for all `var` names → initialize to `undefined`
3. Create bindings for function declarations → initialize to function object
4. Create bindings for `let`/`const` names → leave **uninitialized**

---

## Hoisting Priority Summary

| Declaration                                  | Hoisted?          | Initial Value        | Scope           |
| -------------------------------------------- | ----------------- | -------------------- | --------------- |
| `var`                                        | ✅                | `undefined`          | function/global |
| `function` declaration                       | ✅                | full function object | function/global |
| `let`                                        | ✅ (binding only) | uninitialized (TDZ)  | block           |
| `const`                                      | ✅ (binding only) | uninitialized (TDZ)  | block           |
| `class`                                      | ✅ (binding only) | uninitialized (TDZ)  | block           |
| function expression (`var f = function(){}`) | var part only     | `undefined`          | function/global |
| arrow function (`const f = () => {}`)        | `const` part only | uninitialized (TDZ)  | block           |

---

## Practical Implications

```js
// 1. Always declare vars at top of function — matches the engine's behavior
// 2. Prefer let/const — TDZ errors are caught at the right point
// 3. Never rely on function hoisting for order-dependent logic in modules
// 4. Avoid var in loops unless you explicitly want shared binding semantics
```

---

## Key Takeaways

- Hoisting is **binding instantiation** during the creation phase, not physical code movement
- `var` bindings are initialized to `undefined`; accessible (as `undefined`) before assignment
- Function declarations are fully available before their line — name + body
- `let`/`const`/`class` bindings exist (hoisted) but are uninitialized → TDZ until the declaration line
- Function declarations inside blocks behave inconsistently in non-strict mode; avoid them
- When `var` and `function` share a name, the function overwrites the `undefined` during instantiation
