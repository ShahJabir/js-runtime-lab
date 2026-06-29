# JavaScript Promise — Concept, Internals & Necessity

## What is a Promise?

A **Promise** is an object representing the eventual completion or failure of an asynchronous operation. It is a placeholder for a value that is not yet available but will be at some point in the future — or never, if an error occurs.

Before Promises existed, async work was handled with nested callbacks, which led to deeply indented, hard-to-read code known as **Callback Hell**.

```js
// Callback Hell
getUser(id, (user) => {
  getPosts(user, (posts) => {
    getComments(posts[0], (comments) => {
      // ... goes deeper and deeper
    });
  });
});
```

Promises solve this by making async flow linear and composable.

---

## The Three States

A Promise exists in exactly one of three states at any point in time. Transitions are **one-way and irreversible**.

```text
             resolve(value)
  PENDING ──────────────────▶ FULFILLED
     │
     │ reject(reason)
     ▼
  REJECTED
```

| State       | Meaning                              | Can transition? |
| ----------- | ------------------------------------ | --------------- |
| `pending`   | Initial state, operation in progress | ✅ Yes           |
| `fulfilled` | Operation completed successfully     | ❌ No            |
| `rejected`  | Operation failed                     | ❌ No            |

Once a promise settles (fulfills or rejects), it is **immutable** — calling `resolve` or `reject` again has no effect.

---

## Anatomy of a Promise

```js
const promise = new Promise((resolve, reject) => {
  // executor function — runs synchronously
  const data = doSomething();

  if (data) {
    resolve(data);   // transition → FULFILLED
  } else {
    reject("failed"); // transition → REJECTED
  }
});
```

The function passed into `new Promise(...)` is called the **executor**. It runs **immediately and synchronously**. The `resolve` and `reject` functions it receives are provided by the Promise internals.

---

## The `.then()`, `.catch()`, `.finally()` API

### `.then(onFulfilled, onRejected?)`

Registers a callback to run when the promise fulfills. Returns a **new Promise**, enabling chaining.

```js
fetch("/api/data")
  .then(res => res.json())
  .then(data => console.log(data));
```

### `.catch(onRejected)`

Syntactic sugar for `.then(undefined, onRejected)`. Handles rejection anywhere in the chain above it.

```js
fetch("/api/data")
  .then(res => res.json())
  .catch(err => console.error("Failed:", err));
```

### `.finally(onFinally)`

Runs regardless of outcome — fulfilled or rejected. Does **not** receive the value or reason. Used for cleanup (hiding spinners, closing connections).

```js
setLoading(true);

fetch("/api/data")
  .then(res => res.json())
  .catch(err => console.error(err))
  .finally(() => setLoading(false));  // always runs
```

---

## Promise Chaining

Each `.then()` returns a **new Promise** wrapping the return value of the callback. This is what makes chaining work — not the original promise.

```js
Promise.resolve(1)
  .then(v => v + 1)   // returns Promise<2>
  .then(v => v * 3)   // returns Promise<6>
  .then(v => console.log(v)); // logs 6
```

If a `.then()` callback throws or returns a rejected Promise, the chain short-circuits to the next `.catch()`.

```js
Promise.resolve(1)
  .then(v => { throw new Error("oops"); })
  .then(v => console.log("never runs"))
  .catch(err => console.error(err.message)); // "oops"
```

---

## The Microtask Queue

Promise callbacks (`.then`, `.catch`, `.finally`) do **not** run synchronously, even if the promise is already settled. They are scheduled on the **microtask queue**, which is drained after the current synchronous task completes but **before** any macrotasks (setTimeout, setInterval).

```js
console.log("1");

Promise.resolve().then(() => console.log("2"));

console.log("3");

// Output: 1, 3, 2
```

This is a fundamental property of the JavaScript event loop. Microtasks always run before the next macrotask, giving Promise callbacks higher priority than `setTimeout(..., 0)`.

```js
setTimeout(() => console.log("macro"), 0);
Promise.resolve().then(() => console.log("micro"));

// Output: micro, then macro
```

---

## Static Promise Methods

### `Promise.all(iterable)`

Waits for **all** promises to fulfill. Rejects immediately if **any** one rejects (fail-fast).

```js
const [user, posts] = await Promise.all([
  fetchUser(1),
  fetchPosts(1),
]);
```

### `Promise.allSettled(iterable)`

Waits for **all** promises to settle (fulfill or reject). Never short-circuits. Returns an array of `{ status, value/reason }` objects.

```js
const results = await Promise.allSettled([p1, p2, p3]);
results.forEach(r => {
  if (r.status === "fulfilled") use(r.value);
  else log(r.reason);
});
```

### `Promise.race(iterable)`

Settles with the **first** promise that settles, in either direction.

```js
// timeout pattern
const result = await Promise.race([
  fetch("/api/slow"),
  new Promise((_, reject) => setTimeout(() => reject("timeout"), 3000)),
]);
```

### `Promise.any(iterable)`

Fulfills with the **first** fulfilled promise. Rejects only if **all** reject (AggregateError).

### `Promise.resolve(value)` / `Promise.reject(reason)`

Creates an already-settled promise synchronously. Useful for wrapping sync values or testing.

---

## Why Promises are Necessary

| Problem                     | Without Promise                         | With Promise                          |
| --------------------------- | --------------------------------------- | ------------------------------------- |
| Nested async calls          | Callback hell, deeply indented code     | Flat `.then()` chains                 |
| Error propagation           | Manual error passing in every callback  | `.catch()` captures errors chain-wide |
| Parallel async operations   | Complex counter/flag management         | `Promise.all()`                       |
| Composability               | Impossible to return async work cleanly | Promises are first-class values       |
| Readable async/await syntax | Not possible                            | `async/await` is built on Promises    |

`async/await` is **syntactic sugar over Promises**. Under the hood, every `await` expression is a `.then()` call, and every `async` function returns a Promise.

```js
// These are equivalent
async function getUser() {
  const res = await fetch("/user");
  return res.json();
}

function getUser() {
  return fetch("/user").then(res => res.json());
}
```

---

## Promise vs Callback vs Observable

| Feature              | Callback      | Promise          | Observable (RxJS)     |
| -------------------- | ------------- | ---------------- | --------------------- |
| Multiple values      | ✅ (via calls) | ❌ (single value) | ✅                     |
| Cancellable          | Manual        | ❌ (natively)     | ✅                     |
| Lazy execution       | ✅             | ❌ (eager)        | ✅                     |
| Chaining / operators | ❌             | Limited          | ✅ rich operators      |
| Error handling       | Manual        | `.catch()`       | `.pipe(catchError())` |
| Native in JS         | ✅             | ✅                | ❌ (needs library)     |

---

## Summary

- A Promise represents a **future value** in one of three irreversible states: pending, fulfilled, rejected.
- The **executor** runs synchronously; its callbacks schedule async work.
- `.then()` / `.catch()` / `.finally()` return new Promises, enabling a **flat, composable chain**.
- Callbacks are queued in the **microtask queue** — they always run after the current synchronous frame.
- `async/await` is Promise-based syntax — understanding Promises is fundamental to understanding all modern JavaScript async code.
