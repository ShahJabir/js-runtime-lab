let a = -0;

console.log("a:", a);

console.log("a === 0:", a === 0);
console.log("a > 0:", a > 0);
console.log("a < 0:", a < 0);

console.log("Object.is(a, 0):", Object.is(a, 0));

console.log("Math.sign(-0):", Math.sign(-0));
console.log("Math.sign(0):", Math.sign(0));

function sign(v) {
  return v !== 0 ? Math.sign(v) : Object.is(v, -0) ? -1 : 1;
}

console.log("sign(-0):", sign(-0));
console.log("sign(0):", sign(0));
