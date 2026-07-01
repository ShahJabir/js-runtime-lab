# JS Proxy and Reflect

## The Core Idea

Normally, when you access a property, call a function, or delete a key on an object, the JS engine just does it — you have no way to intercept that operation. **Proxy** changes that. It lets you wrap any object and intercept fundamental operations on it: reads, writes, deletes, function calls, `in` checks, `Object.keys()`, and more.

**Reflect** is the companion API. It gives you a clean, function-based way to perform those same fundamental operations — the default behavior — so you can do it yourself inside a trap, or just use it standalone instead of the old operator syntax.

They were both introduced in ES2015 and are deeply connected.

---

## Proxy — Intercepting Object Operations

### Basic Structure

```js
const proxy = new Proxy(target, handler);
```

- **`target`** — the original object being wrapped
- **`handler`** — a plain object whose methods ("traps") intercept operations

Every operation on `proxy` that has a matching trap in `handler` gets intercepted. Everything else passes through to `target` unchanged.

```js
const user = { name: 'Taqi', role: 'admin' };

const proxy = new Proxy(user, {
  get(target, key, receiver) {
    console.log(`Reading: ${key}`);
    return target[key];
  }
});

proxy.name;  // logs "Reading: name", returns 'Taqi'
proxy.role;  // logs "Reading: role", returns 'admin'
user.name;   // 'Taqi' — original object is untouched, no trap fires
```

The `target` is always the real object. The `proxy` is the interceptor shell in front of it.

---

## The Traps

There are 13 traps in total — one for each fundamental object operation defined in the spec. The most important ones:

| Trap                       | Intercepts          | Triggered by                            |
| -------------------------- | ------------------- | --------------------------------------- |
| `get`                      | Property read       | `proxy.x`, `proxy[x]`                   |
| `set`                      | Property write      | `proxy.x = v`                           |
| `has`                      | `in` operator       | `'x' in proxy`                          |
| `deleteProperty`           | `delete` operator   | `delete proxy.x`                        |
| `apply`                    | Function call       | `proxy()`, `proxy.call()`               |
| `construct`                | `new` operator      | `new proxy()`                           |
| `ownKeys`                  | Key enumeration     | `Object.keys()`, `for...in`             |
| `getOwnPropertyDescriptor` | Descriptor read     | `Object.getOwnPropertyDescriptor()`     |
| `defineProperty`           | Descriptor write    | `Object.defineProperty()`               |
| `getPrototypeOf`           | Prototype read      | `Object.getPrototypeOf()`, `instanceof` |
| `setPrototypeOf`           | Prototype write     | `Object.setPrototypeOf()`               |
| `isExtensible`             | Extensibility check | `Object.isExtensible()`                 |
| `preventExtensions`        | Lock object         | `Object.freeze()`, `Object.seal()`      |

If a trap is not defined in the handler, the operation passes through to the target directly — no wrapping needed.

---

## `get` Trap — Intercept Property Reads

```js
const handler = {
  get(target, key, receiver) {
    if (key in target) {
      return target[key];
    }
    return `Property "${key}" does not exist`;
  }
};

const proxy = new Proxy({}, handler);
proxy.name = 'Taqi';

proxy.name;    // 'Taqi'
proxy.age;     // 'Property "age" does not exist'  — instead of undefined
```

The three parameters every trap receives:

- **`target`** — the original object
- **`key`** — the property name (always a string or Symbol)
- **`receiver`** — the proxy itself (or whatever object initiated the lookup — matters for inheritance)

---

## `set` Trap — Intercept Property Writes

```js
const handler = {
  set(target, key, value, receiver) {
    if (typeof value !== 'number') {
      throw new TypeError(`${key} must be a number`);
    }
    target[key] = value;
    return true; // MUST return true — signals success; false throws TypeError in strict mode
  }
};

const stats = new Proxy({}, handler);

stats.score = 100;    // fine
stats.score = 'high'; // TypeError: score must be a number
```

The `set` trap **must return `true`** to signal that the assignment succeeded. Returning `false` (or nothing, which is `undefined` = falsy) will throw a `TypeError` in strict mode.

---

## `has` Trap — Intercept `in` Checks

```js
const range = new Proxy({ min: 1, max: 100 }, {
  has(target, key) {
    const num = Number(key);
    return num >= target.min && num <= target.max;
  }
});

50 in range;  // true
200 in range; // false
5 in range;   // true
```

This completely redefines what `in` means for this object — without touching the actual properties.

---

## `apply` Trap — Intercept Function Calls

The target must be a function for this to work:

```js
function add(a, b) { return a + b; }

const proxy = new Proxy(add, {
  apply(target, thisArg, args) {
    console.log(`Called with args: ${args}`);
    const result = target.apply(thisArg, args);
    console.log(`Result: ${result}`);
    return result;
  }
});

proxy(2, 3);
// Called with args: 2,3
// Result: 5
```

- **`target`** — the original function
- **`thisArg`** — what `this` is during the call
- **`args`** — the arguments array

---

## `construct` Trap — Intercept `new`

```js
class User {
  constructor(name) { this.name = name; }
}

const SafeUser = new Proxy(User, {
  construct(target, args, newTarget) {
    if (!args[0]) throw new Error('Name is required');
    return new target(...args);
  }
});

new SafeUser('Taqi'); // { name: 'Taqi' }
new SafeUser();       // Error: Name is required
```

---

## `deleteProperty` and `ownKeys` Traps

```js
const locked = new Proxy({ a: 1, b: 2, _secret: 'hidden' }, {
  deleteProperty(target, key) {
    if (key.startsWith('_')) {
      throw new Error(`Cannot delete private property: ${key}`);
    }
    delete target[key];
    return true;
  },

  ownKeys(target) {
    // Hide properties starting with _
    return Object.keys(target).filter(k => !k.startsWith('_'));
  }
});

delete locked.a;        // fine
delete locked._secret;  // Error: Cannot delete private property: _secret

Object.keys(locked);    // ['a', 'b'] — _secret is hidden
```

---

## Reflect — The Clean Default Behavior API

`Reflect` is a built-in object (not a constructor — you never use `new Reflect()`) with one static method per trap. Each method does exactly what the engine would do by default.

```js
Reflect.get(target, key, receiver)
Reflect.set(target, key, value, receiver)
Reflect.has(target, key)
Reflect.deleteProperty(target, key)
Reflect.apply(target, thisArg, args)
Reflect.construct(target, args, newTarget)
Reflect.ownKeys(target)
Reflect.defineProperty(target, key, descriptor)
Reflect.getOwnPropertyDescriptor(target, key)
Reflect.getPrototypeOf(target)
Reflect.setPrototypeOf(target, proto)
Reflect.isExtensible(target)
Reflect.preventExtensions(target)
```

### Why Use Reflect at All?

Before `Reflect`, you'd do the default operation inside a trap using operators or old APIs:

```js
// Old way — using operators directly
get(target, key) {
  return target[key]; // works, but misses receiver context
}

// Better way — using Reflect
get(target, key, receiver) {
  return Reflect.get(target, key, receiver); // preserves receiver correctly
}
```

The key reason is **`receiver`**. When you access a property using `target[key]` inside a get trap, you bypass the proxy for that access. If the property is a getter on the prototype, `this` inside that getter will be `target` (the raw object), not the proxy. `Reflect.get(target, key, receiver)` passes the receiver through, so `this` in a getter is the proxy — which means further get accesses inside that getter are also intercepted.

```js
const base = {
  get double() {
    return this.value * 2; // `this` here matters
  }
};

const obj = Object.create(base);
obj.value = 5;

const proxy = new Proxy(obj, {
  get(target, key, receiver) {
    console.log('Getting:', key);
    return Reflect.get(target, key, receiver); // receiver = proxy
    // vs target[key] — receiver would be lost, `this` in `double` would be obj, not proxy
  }
});

proxy.double;
// Getting: double
// Getting: value  ← Reflect passes receiver, so `this.value` triggers the trap too
// 10
```

### Reflect as a Cleaner Operator Replacement

`Reflect` also cleans up older awkward patterns:

```js
// Old: function call with specific this
fn.apply(obj, args);
Function.prototype.apply.call(fn, obj, args); // if fn.apply is overridden

// New: clean
Reflect.apply(fn, obj, args); // always works, can't be overridden

// Old: check own key
Object.prototype.hasOwnProperty.call(obj, key); // verbose, fragile

// New
Reflect.has(obj, key); // checks own + prototype (same as `in`)
Object.hasOwn(obj, key); // own only (ES2022, simpler for own checks)
```

`Reflect.set` also returns a boolean (success/failure) instead of throwing, which is useful in non-strict contexts.

---

## Proxy + Reflect Together — The Right Pattern

The standard pattern for a proxy that does something extra but still behaves normally otherwise:

```js
const handler = {
  get(target, key, receiver) {
    console.log(`GET ${key}`);
    return Reflect.get(target, key, receiver); // delegate to default behavior
  },

  set(target, key, value, receiver) {
    console.log(`SET ${key} = ${value}`);
    return Reflect.set(target, key, value, receiver); // delegate, return its boolean
  },

  deleteProperty(target, key) {
    console.log(`DELETE ${key}`);
    return Reflect.deleteProperty(target, key);
  }
};

const proxy = new Proxy({ x: 1 }, handler);
proxy.y = 2;   // SET y = 2
proxy.y;       // GET y → 2
delete proxy.y; // DELETE y
```

This is called a **transparent proxy** — it intercepts everything but changes nothing about the behavior. Build on this pattern to add validation, logging, or reactivity.

---

## Real Use Cases

### 1. Validation

```js
function createValidator(target, schema) {
  return new Proxy(target, {
    set(obj, key, value) {
      if (key in schema) {
        const { type, min, max } = schema[key];
        if (typeof value !== type) throw new TypeError(`${key} must be ${type}`);
        if (min !== undefined && value < min) throw new RangeError(`${key} must be >= ${min}`);
        if (max !== undefined && value > max) throw new RangeError(`${key} must be <= ${max}`);
      }
      return Reflect.set(obj, key, value);
    }
  });
}

const user = createValidator({}, {
  age: { type: 'number', min: 0, max: 150 },
  name: { type: 'string' }
});

user.name = 'Taqi'; // fine
user.age = 28;      // fine
user.age = -5;      // RangeError: age must be >= 0
user.age = 'old';   // TypeError: age must be number
```

### 2. Reactivity (Vue 3 / Signal-style)

```js
function reactive(target, onChange) {
  return new Proxy(target, {
    set(obj, key, value, receiver) {
      const result = Reflect.set(obj, key, value, receiver);
      if (result) onChange(key, value);
      return result;
    }
  });
}

const state = reactive({ count: 0 }, (key, value) => {
  console.log(`State changed: ${key} = ${value}`);
  // re-render UI, notify subscribers, etc.
});

state.count = 1; // State changed: count = 1
state.count = 2; // State changed: count = 2
```

Vue 3's reactivity system is built on exactly this pattern.

### 3. Read-Only / Immutable Wrapper

```js
function readOnly(target) {
  return new Proxy(target, {
    set() {
      throw new Error('This object is read-only');
    },
    deleteProperty() {
      throw new Error('This object is read-only');
    }
  });
}

const config = readOnly({ port: 3000, host: 'localhost' });
config.port;       // 3000
config.port = 80;  // Error: This object is read-only
```

### 4. Default Values

```js
function withDefaults(target, defaults) {
  return new Proxy(target, {
    get(obj, key, receiver) {
      return key in obj
        ? Reflect.get(obj, key, receiver)
        : defaults[key];
    }
  });
}

const settings = withDefaults({ theme: 'dark' }, {
  theme: 'light',
  language: 'en',
  fontSize: 14
});

settings.theme;    // 'dark' — own property wins
settings.language; // 'en'  — from defaults
settings.fontSize; // 14    — from defaults
```

### 5. Negative Array Indexing

```js
function negativeIndex(arr) {
  return new Proxy(arr, {
    get(target, key, receiver) {
      const index = Number(key);
      const actualKey = index < 0 ? target.length + index : key;
      return Reflect.get(target, actualKey, receiver);
    }
  });
}

const arr = negativeIndex([10, 20, 30, 40]);
arr[-1]; // 40
arr[-2]; // 30
arr[0];  // 10
```

---

## What Proxies Cannot Do

- **Wrap primitives** — `new Proxy(42, handler)` throws; only objects and functions
- **Hide their existence from `===`** — `proxy !== target`; they are different references
- **Intercept private class fields** — `#privateField` is accessed via internal slot, not property lookup; traps never fire for them
- **Be reverted** — once created, a regular Proxy is permanent. Use `Proxy.revocable()` if you need to disable it later

```js
// Revocable proxy
const { proxy, revoke } = Proxy.revocable(target, handler);
proxy.name; // works
revoke();
proxy.name; // TypeError: Cannot perform 'get' on a proxy that has been revoked
```

---

## Key Takeaways

- `Proxy` wraps an object and intercepts fundamental operations via **traps** in a handler
- `Reflect` provides the default implementation of each trap as a clean function call
- Always use `Reflect.get(target, key, receiver)` — not `target[key]` — inside traps, to preserve the `receiver` for inherited getter correctness
- `set` and `deleteProperty` traps must return `true` to signal success
- Traps map 1-to-1 with JS's internal object operations — there are exactly 13
- Core use cases: validation, reactivity, read-only wrappers, default values, logging
- Proxies cannot intercept private class fields (`#field`) — those bypass the property lookup system entirely
