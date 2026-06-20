console.log("This is a popup!");

function printTestMSG() {
  console.log("The DOM is fully parsed. HTML elements are safe to manipulate!");
}

// Checks if DOM has fully loaded
if (document.readyState === "loading") {
  // if DOM has not loaded yet
  document.addEventListener("DOMContentLoaded", printTestMSG);
} else {
  // if DOM has loaded
  printTestMSG();
}

console.log("Checkpoint 2 from popup");

// var el = document.querySelector(div["aim"]);
// console.log(el);

// const iframe =

const fragment = document.createDocumentFragment();
const li = fragment
  .appendChild(document.createElement("section"))
  .appendChild(document.createElement("ul"))
  .appendChild(document.createElement("li"));
li.textContent = "hello world";

el.appendChild(fragment);
