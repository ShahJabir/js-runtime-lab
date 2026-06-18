# JS Event Loop

## The Concurrency Model

JavaScript is **single-threaded** — one call stack, one piece of code running at any instant. The event loop is the mechanism that lets JS handle async work (I/O, timers, network) without blocking that single thread. It coordinates between the engine (V8/SpiderMonkey/etc.) and the host environment (browser/Node/Bun/Deno).

The spec (WHATWG HTML spec for browsers, `libuv` for Node) defines the event loop. ECMAScript itself only defines the microtask checkpoint — the outer scheduling loop is host-defined.

---

## The Components

```
┌───────────────────────────────────────────────────┐
│                    Call Stack                     │
│  (JS engine execution contexts)                   │
└─────────────────────────┬─────────────────────────┘
                          │ empty?
                          ▼
┌───────────────────────────────────────────────────┐
│              Microtask Queue                      │
│  Promise callbacks, queueMicrotask, MutationObs   │
│  → Drained COMPLETELY before moving on            │
└─────────────────────────┬─────────────────────────┘
                          │ empty?
                          ▼
┌───────────────────────────────────────────────────┐
│               Task Queue (Macrotask)              │
│  setTimeout, setInterval, I/O callbacks,          │
│  MessageChannel, setImmediate (Node)              │
│  → ONE task dequeued per loop iteration           │
└───────────────────────────────────────────────────┘
```

---

## The Loop Algorithm (simplified)

```
while (true) {
  // 1. Dequeue ONE macrotask and run it to completion
  task = taskQueue.dequeue();
  execute(task);               // call stack runs until empty

  // 2. Drain the entire microtask queue
  while (microtaskQueue.length > 0) {
    microtask = microtaskQueue.dequeue();
    execute(microtask);
    // new microtasks queued during this step are also drained here
  }

  // 3. (Browser only) Render if needed
  if (shouldRender()) render();
}
```

Critical property: **microtasks are drained to exhaustion** after every task and after every microtask. This means a microtask can queue more microtasks and starve the macrotask queue indefinitely.

---

## Task Queue vs. Microtask Queue

### Macrotask sources

- `setTimeout(fn, 0)` — minimum 4ms delay in browsers per spec; 1ms in Node
- `setInterval`
- I/O callbacks (file reads, network responses in Node)
- `MessageChannel.postMessage`
- `setImmediate` (Node — runs in its own dedicated phase, not the generic task queue)
- `requestAnimationFrame` (browser — technically a rendering step, not macrotask)
- `<script>` tag parsing/execution is itself the initial macrotask

### Microtask sources

- `Promise.then / .catch / .finally` callbacks
- `queueMicrotask(fn)` — direct, synchronous-relative enqueueing
- `async/await` continuations (every `await` resumes as a microtask)
- `MutationObserver` callbacks (browser)
- `process.nextTick` (Node — special: runs before other microtasks in Node's model)

```js
console.log("1 - sync");

setTimeout(() => console.log("2 - macrotask"), 0);

Promise.resolve()
  .then(() => console.log("3 - microtask"))
  .then(() => console.log("4 - microtask chained"));

queueMicrotask(() => console.log("5 - microtask"));

console.log("6 - sync");

// Output: 1, 6, 3, 5, 4, 2
```

---

## Node.js Event Loop Phases (libuv)

Node's event loop is more granular than the browser's. libuv runs it in phases:

```
   ┌─────────────────────────────┐
   │           timers            │  setTimeout, setInterval callbacks
   └──────────────┬──────────────┘
                  │
   ┌──────────────▼──────────────┐
   │     pending callbacks       │  I/O errors from previous iteration
   └──────────────┬──────────────┘
                  │
   ┌──────────────▼──────────────┐
   │       idle, prepare         │  internal use
   └──────────────┬──────────────┘
                  │
   ┌──────────────▼──────────────┐
   │           poll              │  retrieve new I/O events; block if queue empty
   └──────────────┬──────────────┘
                  │
   ┌──────────────▼──────────────┐
   │           check             │  setImmediate callbacks
   └──────────────┬──────────────┘
                  │
   ┌──────────────▼──────────────┐
   │      close callbacks        │  socket.on('close', ...) etc.
   └─────────────────────────────┘
```

**Between each phase**, Node drains `process.nextTick` queue first, then the Promise microtask queue.

### `process.nextTick` vs `Promise.then` in Node

```js
Promise.resolve().then(() => console.log("promise"));
process.nextTick(() => console.log("nextTick"));
// Output: nextTick, promise
```

`process.nextTick` has its own queue that's drained before the standard microtask queue. It's not technically a microtask per the spec, but it behaves like one with higher priority. Overuse can starve I/O.

### `setImmediate` vs `setTimeout(fn, 0)`

```js
// Outside I/O callback — order is NON-DETERMINISTIC
setTimeout(() => console.log("timeout"), 0);
setImmediate(() => console.log("immediate"));

// Inside an I/O callback — setImmediate ALWAYS runs first
fs.readFile("file", () => {
  setTimeout(() => console.log("timeout"), 0);
  setImmediate(() => console.log("immediate")); // always first here
});
```

Inside I/O, `setImmediate` wins because the event loop is already in the `poll` phase — next stop is `check` (setImmediate), not `timers`.

---

## `async/await` Under the Hood

Every `await` desugars to a Promise `.then`:

```js
async function foo() {
  console.log("A");
  await bar(); // suspends foo, queues continuation as microtask
  console.log("C"); // resumes when microtask runs
}

// Roughly equivalent to:
function foo() {
  console.log("A");
  return bar().then(() => {
    console.log("C");
  });
}
```

Each `await` point is a microtask boundary. Multiple awaits chain microtasks:

```js
async function main() {
  await step1(); // microtask 1
  await step2(); // microtask 2
  await step3(); // microtask 3
}
```

This means a deeply awaited chain will interleave with other microtasks at each suspension point.

---

## Starvation Scenarios

### Microtask starvation

```js
function infinite() {
  Promise.resolve().then(infinite);
}
infinite();
// setTimeout callbacks will NEVER run — microtask queue never empties
```

### `process.nextTick` starvation (Node)

```js
function tick() {
  process.nextTick(tick);
}
tick();
// I/O, Promise callbacks, timers — all starved
```

---

## Browser: Rendering and `requestAnimationFrame`

```
[macrotask] → [microtasks] → [render?] → [RAF callbacks] → [next macrotask]
```

`requestAnimationFrame` callbacks fire as part of the rendering step, not the task queue. If your macrotask + microtasks take >16ms (60fps budget), the render step is skipped and frames drop.

`setTimeout(fn, 0)` is NOT frame-aligned. For animation logic, always use `rAF`.

---

## Key Takeaways

- One call stack; async work is dispatched to host APIs and re-enters via queues
- Microtasks drain **completely** (including newly enqueued ones) before any macrotask
- Node.js has a multi-phase libuv loop; `process.nextTick` > microtasks > phases
- `setImmediate` vs `setTimeout(0)` order is non-deterministic outside I/O; inside I/O, `setImmediate` always wins
- `async/await` is syntactic sugar for Promise chains — each `await` is a microtask boundary
- Infinite microtask recursion starves the macrotask queue permanently
