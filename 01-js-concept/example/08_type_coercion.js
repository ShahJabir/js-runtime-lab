const userStored = { name: "Will", id: 123 };
const userSuggested = { name: "Will", id: 123 };

function onSubmit() {
  if (+userStored === +userSuggested) {
    console.log(true);
  } else {
    console.log(false);
  }
}

function coerce() {
  return 105;
}

onSubmit();

userStored[Symbol.toPrimitive] = coerce;
userSuggested[Symbol.toPrimitive] = coerce;

onSubmit();
