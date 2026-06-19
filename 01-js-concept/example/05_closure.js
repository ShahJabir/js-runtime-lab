let init = 50;
(() => {
  var num = 1;
  var num0 = 0;
  let num01 = 10;
  const num02 = 20;

  var sum = function () {
    let num2 = 2;
    const num3 = 5;
    return () => {
      return init + num + num0 + num01 + num02 + num2 + num3;
    };
  };

  var myFunc = sum();

  console.dir(sum);
  console.dir(myFunc);
  console.log(myFunc());

  num = 2;
  num01 = 4;
  console.dir(myFunc);
  console.log(myFunc());
})();

var a;

async function async() {
  a = 20;
  var myFunc = async () => {
    console.log(a);
  };
  setTimeout(myFunc, 3000);

  console.dir(myFunc);
}

async();
a = 30;

for (let index = 0; index < 3; index++) {
  const myFunc = () => {
    console.log(index);
  };
  console.log(index);
  console.dir(myFunc);
  setTimeout(myFunc, 3000);
}
console.log("After let for loop");

for (var index = 0; index < 3; index++) {
  const myFunc = () => {
    console.log(index);
  };
  console.log(index);
  console.dir(myFunc);
  setTimeout(myFunc, 3000);
}
console.log("After var for loop");
