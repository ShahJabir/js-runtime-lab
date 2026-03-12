let currentCount;
let savedValue; // Stores the value when 'Save' is clicked

if (localStorage.getItem("savedValue") !== null) {
  currentCount = localStorage.getItem("savedValue");
  savedValue = localStorage.getItem("savedValue");
} else {
  currentCount = 0;
  savedValue = 0;
}

let demo = document.getElementById("demo");

// Initialize display
demo.innerText = currentCount;

function add() {
  currentCount++;
  demo.innerText = currentCount;
}

function sub() {
  currentCount--;
  demo.innerText = currentCount;
}

function save() {
  // Store the current number into the savedValue variable
  savedValue = currentCount;
  localStorage.setItem("savedValue", currentCount);
  alert("Value Saved: " + savedValue);
}

function restart() {
  // Sets the counter back to whatever the last SAVED value was
  currentCount = localStorage.getItem("savedValue");
  demo.innerText = currentCount;
}

function reset() {
  // Hard reset: clears the counter AND the saved memory back to 0
  currentCount = 0;
  savedValue = 0;
  localStorage.setItem("savedValue", currentCount);
  demo.innerText = currentCount;
}
