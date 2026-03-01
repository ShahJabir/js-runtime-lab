# 📦 Node.js Core Module — events

> Use this template for **every core module** you study.

---

## 1️⃣ Overview

- **Module name:** `events`
- **Purpose:** Provide a lightweight in-process event system via `EventEmitter`
- **Category:** Runtime / Architecture / Event-driven systems

---

## 2️⃣ Why This Module Exists

- **What problem does it solve?**
  Enables decoupled communication between different parts of an application without direct function calls.

- **What would break if it didn’t exist?**
  Node core modules (streams, HTTP, net, fs, child_process) would need tightly coupled callbacks, making extensibility and composability extremely hard.

- **Why is this handled at the runtime level?**
  Because event-driven architecture is a _foundational design principle_ of Node.js, not a userland abstraction.

---

## 3️⃣ Public API Overview

Important APIs:

- `EventEmitter` – Base class implementing event-driven communication
- `emitter.on(event, listener)` – Register a persistent listener
- `emitter.once(event, listener)` – Register a one-time listener
- `emitter.emit(event, ...args)` – Synchronously emit an event
- `emitter.off(event, listener)` – Remove a specific listener
- `emitter.removeAllListeners(event)` – Clear listeners
- `emitter.listenerCount(event)` – Inspect listener usage

Focus is on **behavior**, not exhaustiveness.

---

## 4️⃣ Internal Architecture

- Pure JavaScript abstraction
- No direct libuv or OS interaction
- Used as a base class by many Node core subsystems

Internal flow (simplified):

```text
emit(event)
  → lookup listeners
  → invoke each listener synchronously
```

`EventEmitter` is _in-process_ and _single-threaded_ by design.

---

## 5️⃣ Asynchronous Behavior

- **Is it async?** No — event emission is synchronous
- **Why?** Predictability and simplicity
- **Event loop phase?** Same tick, no scheduling

Implication:

- Blocking listeners block the emitter
- Async behavior must be introduced manually

---

## 6️⃣ Performance Characteristics

- **Blocking vs non-blocking:** Blocking if listeners are blocking
- **Memory usage:** Minimal, but listener leaks are common
- **CPU usage:** Function-call overhead only

Common pitfalls:

- Long-running listeners
- Unbounded listener registration

---

## 7️⃣ Common Mistakes

- Assuming events are asynchronous
- Expecting return values from `emit`
- Ignoring `error` events (can crash the process)
- Using events where simple functions are clearer

---

## 8️⃣ Experiments

- Emit an event with a blocking listener and observe execution order
- Trigger an `error` event without a listener and observe process behavior
- Measure listener leak warnings by repeated registration

---

## 9️⃣ Real-World Use Cases

- Streams emit `data`, `end`, `error`
- HTTP servers emit `request`, `connection`, `close`
- Frameworks use events for lifecycle hooks and plugins

---

## 🔚 Summary

- `events` enables loose coupling
- Emission is synchronous and predictable
- It is foundational to Node.js architecture
