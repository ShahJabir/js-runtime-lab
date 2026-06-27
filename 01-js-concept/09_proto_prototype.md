# JS Prototypes: `prototype` and `__proto__`

## The Core Idea

JavaScript objects can **inherit properties from other objects**. The mechanism is simple: every object has a hidden link to another object called its **prototype**. When you access a property, if the engine doesn't find it on the object itself, it follows that link and looks on the prototype. If it's not there either, it follows the prototype's link, and so on — until it either finds the property or hits `null`.

That chain of links is the **prototype chain**.

---

## Two Different Things With Similar Names

This is where most confusion starts. There are two distinct things:

|             | What it is                                                                  | Who has it     |
| ----------- | --------------------------------------------------------------------------- | -------------- |
| `__proto__` | The hidden link on every object pointing to its prototype                   | Every object   |
| `prototype` | A regular property on function objects, used as the prototype for instances | Only functions |

They are related but not the same thing.

---

## `__proto__` — The Actual Link

Every object has an internal slot called `[[Prototype]]`. `__proto__` is the legacy accessor that exposes it. When you write:

```js
const obj = {};
obj.__proto__ === Object.prototype; // true
```

You're reading that internal `[[Prototype]]` slot. The modern, spec-approved way to read/write it:

```js
Object.getPrototypeOf(obj);           // read
Object.setPrototypeOf(obj, newProto); // write (avoid in hot paths — breaks engine optimizations)
Object.create(proto);                 // create object with specific [[Prototype]]
```

`__proto__` still works in all engines but is considered legacy. Use `Object.getPrototypeOf` in production code.

---

## `prototype` — The Constructor's Template

When you define a function, the engine automatically creates a `prototype` property on it — a plain object with a `.constructor` property pointing back to the function:

```js
function Dog(name) {
  this.name = name;
}

Dog.prototype;             // { constructor: Dog }
Dog.prototype.constructor === Dog; // true
```

When you call that function with `new`, the engine:

1. Creates a new empty object
2. Sets that object's `[[Prototype]]` (`__proto__`) to `Dog.prototype`
3. Runs the function body with `this` = that new object
4. Returns the object

```js
Dog.prototype.bark = function() {
  return `${this.name} says woof`;
};

const rex = new Dog('Rex');

rex.__proto__ === Dog.prototype; // true
rex.bark();                      // 'Rex says woof' — found on Dog.prototype, not rex itself
```

So:

- `Dog.prototype` is the object that becomes the `[[Prototype]]` of all `Dog` instances
- `rex.__proto__` is how rex points back to `Dog.prototype`

---

## The Prototype Chain — Step by Step

```js
function Animal(type) {
  this.type = type;
}
Animal.prototype.describe = function() {
  return `I am a ${this.type}`;
};

function Dog(name) {
  Animal.call(this, 'dog'); // borrow Animal's constructor
  this.name = name;
}
Dog.prototype = Object.create(Animal.prototype); // set up inheritance
Dog.prototype.constructor = Dog;                 // fix constructor reference
Dog.prototype.bark = function() {
  return `${this.name} says woof`;
};

const rex = new Dog('Rex');
```

When you call `rex.describe()`:

```text
rex                     → own properties: { type: 'dog', name: 'Rex' }
  │ __proto__
  ▼
Dog.prototype           → { bark: fn, constructor: Dog }
  │ __proto__
  ▼
Animal.prototype        → { describe: fn, constructor: Animal }  ← found here
  │ __proto__
  ▼
Object.prototype        → { toString, hasOwnProperty, ... }
  │ __proto__
  ▼
null                    ← end of chain
```

Engine checks each level for `describe`. Finds it on `Animal.prototype`. Calls it with `this = rex`.

---

## `class` Is the Same Thing, Cleaner Syntax

ES6 `class` is syntactic sugar over the exact same prototype mechanism:

```js
class Animal {
  constructor(type) {
    this.type = type;
  }
  describe() {
    return `I am a ${this.type}`;
  }
}

class Dog extends Animal {
  constructor(name) {
    super('dog');
    this.name = name;
  }
  bark() {
    return `${this.name} says woof`;
  }
}

const rex = new Dog('Rex');
```

Under the hood:

- `describe` lives on `Animal.prototype`
- `bark` lives on `Dog.prototype`
- `Dog.prototype.__proto__ === Animal.prototype` — `extends` wires this up
- `rex.__proto__ === Dog.prototype` — same as before

Nothing fundamentally changed. `class` just removes the manual `Object.create` and constructor wiring.

---

## Own Properties vs. Inherited Properties

```js
const rex = new Dog('Rex');

rex.hasOwnProperty('name');     // true — defined in constructor, lives directly on rex
rex.hasOwnProperty('bark');     // false — lives on Dog.prototype
rex.hasOwnProperty('describe'); // false — lives on Animal.prototype

'bark' in rex;                  // true — `in` checks the entire chain
```

`hasOwnProperty` vs `in` is the practical distinction between own and inherited.

---

## `Object.create` — Prototype Without a Constructor

You don't need `new` and a constructor function to set up a prototype chain:

```js
const animal = {
  describe() {
    return `I am a ${this.type}`;
  }
};

const rex = Object.create(animal); // rex.__proto__ === animal
rex.type = 'dog';
rex.name = 'Rex';

rex.describe(); // 'I am a dog'
```

`Object.create(null)` creates an object with **no prototype** — no chain, no inherited `toString`, `hasOwnProperty`, etc. Useful for pure dictionary/map objects:

```js
const map = Object.create(null);
map.key = 'value';
'toString' in map; // false — truly empty, no inherited properties
```

---

## Common Gotcha — Shared Reference on Prototype

Primitive values on the prototype are shadowed correctly per instance. But **reference types** (objects, arrays) on the prototype are shared:

```js
function Pack() {}
Pack.prototype.members = []; // shared array — THIS IS A BUG

const pack1 = new Pack();
const pack2 = new Pack();

pack1.members.push('Rex');
pack2.members; // ['Rex'] — same array, mutation visible everywhere
```

Fix: always initialize reference-type state in the constructor, not on the prototype:

```js
function Pack() {
  this.members = []; // own property per instance
}
```

---

## Summary

```text
Constructor function:
  Dog.prototype  ──────────────────────────┐
                                           │
Instance:                                  │
  rex.__proto__  ──────────────────────────┘  (same object)

Prototype chain:
  rex → Dog.prototype → Animal.prototype → Object.prototype → null
```

- `__proto__` (or `[[Prototype]]`) is the link every object has to its parent object
- `prototype` is the object a constructor function uses to set that link on instances
- `class`/`extends` is sugar over the same mechanism
- The engine walks the chain on every property lookup until it finds the key or hits `null`
- Own properties shadow prototype properties of the same name
- Shared reference types on the prototype are shared across all instances — put them in the constructor

---

## Key Takeaways

- Every object has `[[Prototype]]` — the actual chain link. `__proto__` reads it; `Object.getPrototypeOf()` is the clean API
- Only functions have a `.prototype` property — it becomes the `[[Prototype]]` of instances created with `new`
- Prototype chain lookup is live and walks at runtime — finding `undefined` at the end of the chain is NOT an error; reaching a missing key *is*
- `class` compiles down to exactly this; no magic, no separate system
- `Object.create(null)` gives you a prototype-free object — useful for safe dictionaries
