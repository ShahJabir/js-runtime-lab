// var
console.log(num1);
var num1 = 1;
console.log(num1);

// let
// console.log(num2); // Throwing error because tdz
let num2 = 2;
console.log(num2);

// const
// console.log(num3); // Throwing error because tdz
const num3 = 3;
console.log(num3);

// function
console.log(myFunc());
function myFunc() {
  return 4;
}
console.log(myFunc());

// class
// Throwing error because tdz
// const myInstance1 = new MyClass("MyInstance1");
// console.log(myInstance1.name);
class MyClass {
  constructor(name) {
    this.name = name;
  }
}
const myInstance2 = new MyClass("MyInstance2");
console.log(myInstance2.name);

// function expression
// console.log(myFuncExpr()); // Throwing error because tdz
const myFuncExpr = function () {
  return 5;
};
console.log(myFuncExpr());

// arrow function
// console.log(myArrowFunc()); // Throwing error because tdz
const myArrowFunc = () => 6;
console.log(myArrowFunc());
