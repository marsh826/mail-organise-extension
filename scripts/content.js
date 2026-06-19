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

document.querySelector(".aim");
