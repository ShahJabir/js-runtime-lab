const user = new Proxy(
  {
    fname: "Shah Jabir",
    lname: "Taqi",
    age: 21,
    experience: "Co-Founder and Lead Developer of SysBitz",
    _secret: "hacked",
  },
  {
    get(target, prop) {
      if (!(prop in target)) {
        return `Property '${prop}' does not exist`;
      } else if (prop === "_secret") {
        return `You can't access the secret property`;
      } else {
        return Reflect.get(target, prop);
      }
    },
    set(target, prop, value) {
      if (!(prop in target)) {
        console.error(`Property '${prop}' does not exist`);
      } else if (prop === "_secret") {
        console.error(`You can't modify the secret property`);
        return false;
      } else {
        switch (prop) {
          case "fname":
            if (typeof value !== "string")
              console.error(`Property '${prop}' must be a string`);
            return false;
            break;
          case "lname":
            if (typeof value !== "string")
              console.error(`Property '${prop}' must be a string`);
            return false;
            break;
          case "age":
            if (typeof value !== "number") {
              console.error(`Property '${prop}' must be a number`);
              return false;
            } else if (value < 0) {
              console.error(`Property '${prop}' must be a positive number`);
              return false;
            }
            break;
          case "experience":
            if (typeof value !== "string")
              console.error(`Property '${prop}' must be a string`);
            return false;
            break;
          default:
            console.error(`Property '${prop}' is not allowed`);
            return false;
        }
        return Reflect.set(target, prop, value);
      }
    },
    deleteProperty(target, prop) {
      if (prop.startsWith("_")) {
        return `Cannot delete private property: ${prop}`;
      }
      delete target[prop];
      return true;
    },
  },
);

console.log(user.age);
console.log(user.fname);
console.log(user.xyz);

user.age = "ABC";
user.age = -21;
user.fname = 123;
user._secret = "secure";

console.log(user.age);
console.log(user.fname);
console.log(user._secret);
