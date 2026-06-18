# JS Temporal Dead Zone (TDZ)

## What TDZ Is

The **Temporal Dead Zone** is the period between:

1. A `let`, `const`, or `class` binding being **created** (environment record instantiation), and
2. That binding being **initialized** (execution reaches the declaration line)

During this window, the binding _exists_ in the environment record but is in an **uninitialized** state. Any read or write attempt throws a `ReferenceError`. The word "temporal" refers to time/execution order, not code position.

---

## The Spec Mechanism

ECMAScript defines a binding's lifecycle states:

- **Uninitialized** — created but not yet initialized; access throws `ReferenceError`
- **Initialized** — value has been set (may be `undefined` for `let` without assignment)
- **Mutable / Immutable** — `let` is mutable after init; `const` is immutable after init

`var` bindings skip the uninitialized state entirely — they're initialized to `undefined` at creation. `let`/`const`/`class` bindings are created uninitialized, which is the TDZ.

The spec operation is `GetBindingValue`. If the binding's value is uninitialized, it throws:

```
If the binding exists but is uninitialized → throw ReferenceError
```

---

## TDZ in Practice

```js
// TDZ starts here for `x`
console.log(x); // ReferenceError: Cannot access 'x' before initialization
let x = 5; // TDZ ends here — x is initialized to 5
console.log(x); // 5
```

```js
// const — same TDZ behavior
console.log(y); // ReferenceError
const y = 10;

// class — same
const obj = new Foo(); // ReferenceError
class Foo {}
```

---

## TDZ is Temporal, Not Positional

The name "temporal" is precise — it's about _execution time_, not source code position. A reference above the declaration in source code doesn't automatically hit TDZ if the code never executes before initialization.

```js
// This is fine — the function captures x, but doesn't execute before x is initialized
function getX() {
  return x; // not in TDZ when called
}

let x = 42;
getX(); // 42 — x was initialized before getX() was called
```

```js
// This hits TDZ — the function is called before x is initialized
function getX() {
  return x;
}

getX(); // ReferenceError — x hasn't been initialized yet
let x = 42;
```

---

## TDZ in Default Parameter Values

Default parameters are evaluated in their own scope, in order. A later parameter can reference an earlier one, but not vice versa — earlier params are in TDZ when they reference later ones:

```js
// Fine — b defaults to a, which is already initialized
function f(a = 1, b = a) {
  return [a, b];
}
f(); // [1, 1]

// TDZ — a tries to default to b, but b is still uninitialized
function g(a = b, b = 2) {}
g(); // ReferenceError: Cannot access 'b' before initialization
```

---

## TDZ in `typeof`

`typeof` on an undeclared variable returns `'undefined'` (no error). But `typeof` on a TDZ variable throws:

```js
console.log(typeof undeclaredVar); // 'undefined' — safe
console.log(typeof tdzVar); // ReferenceError — NOT safe
let tdzVar;
```

This breaks the old "safe typeof check" pattern if used with `let`/`const`.

---

## TDZ in Class Bodies

Class declarations have TDZ like `let`. Additionally, within a class body, referencing `this` before `super()` in a derived constructor is also a form of TDZ — the `this` binding is uninitialized until `super()` completes:

```js
class Animal {
  constructor(name) {
    this.name = name;
  }
}

class Dog extends Animal {
  constructor(name) {
    console.log(this.name); // ReferenceError — `this` is uninitialized (must call super first)
    super(name);
  }
}
```

---

## TDZ Across Block Scopes

Each block creates a new scope. TDZ applies per-scope per-binding:

```js
let x = "outer";

{
  // TDZ for inner `x` starts here — shadows outer x
  console.log(x); // ReferenceError — NOT 'outer', because inner x is in TDZ
  let x = "inner";
  console.log(x); // 'inner'
}
```

This is a subtle gotcha: the inner `let x` shadows the outer `x` from the start of the block, putting the entire pre-declaration region into TDZ — even though `outer` would be accessible without the inner declaration.

---

## TDZ with `const`

`const` has the same TDZ rules as `let`, with the additional constraint that it **must** be initialized at declaration — you can't declare `const` without an initializer:

```js
const z; // SyntaxError: Missing initializer in const declaration
```

After initialization, any assignment (including `++`, `+=`) throws a `TypeError`:

```js
const z = 5;
z = 6; // TypeError: Assignment to constant variable
z++; // TypeError
```

---

## Why TDZ Exists (Design Rationale)

`var` was already in the language. When ES6 added `let`/`const`, the goals were:

1. **Fail-fast** — accessing a binding before its initialization is almost certainly a bug; TDZ surfaces this immediately rather than silently returning `undefined`
2. **Correctness for `const`** — a `const` that starts as `undefined` and then gets initialized would allow observing it in two states, undermining immutability
3. **Predictability** — makes binding initialization order explicit and enforced by the runtime
4. **Enables class semantics** — the derived constructor `this`-before-`super` restriction relies on the same uninitialized binding mechanism

---

## TDZ vs. `ReferenceError` for Undeclared Variables

Two different errors, same surface appearance:

```js
console.log(a); // ReferenceError: a is not defined (undeclared — no binding at all)

console.log(b); // ReferenceError: Cannot access 'b' before initialization (TDZ)
let b = 1;
```

The error message distinguishes them. "not defined" = no binding. "before initialization" = binding exists, in TDZ.

---

## Summary Table

| Scenario                              | Behavior                                                  |
| ------------------------------------- | --------------------------------------------------------- |
| `var` before declaration              | `undefined`                                               |
| `let`/`const` before declaration      | `ReferenceError` (TDZ)                                    |
| `typeof` undeclared                   | `'undefined'`                                             |
| `typeof` TDZ variable                 | `ReferenceError`                                          |
| Function called before `let` init     | TDZ if function body accesses the binding                 |
| Inner block `let` shadows outer       | TDZ applies from block start, even if outer would resolve |
| Default param referencing later param | TDZ                                                       |
| `super()` not called before `this`    | `this` is in TDZ                                          |

---

## Key Takeaways

- TDZ is the gap between **binding creation** (creation phase) and **binding initialization** (execution phase)
- The binding _exists_ in TDZ — the engine knows about it — but accessing it throws
- TDZ is temporal (execution-order-based), not spatial (position-based); closures make this matter
- `typeof` is not a TDZ-safe guard — it throws on TDZ variables
- Inner `let`/`const` that shadows outer from the start of the block creates TDZ even where the outer would be visible
- This mechanism underpins `const` immutability guarantees and derived class `this` initialization
