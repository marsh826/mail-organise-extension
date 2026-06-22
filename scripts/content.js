console.log("This is a popup!");

function printTestMSG() {
  console.log("The DOM is fully parsed. HTML elements are safe to manipulate!");
}

// Checks if DOM has fully loaded
// if (document.readyState === "loading") {
//   // if DOM has not loaded yet
//   document.addEventListener("DOMContentLoaded", printTestMSG);
// } else {
//   // if DOM has loaded
//   printTestMSG();
// }

// var el = document.querySelector(div["aim"]);
// console.log(el);

// const iframe =

const parentNode = document.body;

const targetConfig = {
  attributes: true,
  childList: true,
  subtree: true,
};

const callback = (mutationList, observer) => {
  // if (!target) {
  //   window.setTimeout(callback, 3000);
  //   return;
  // }

  // if (target) {
  //   observer.disconnect();
  //   console.log("target found");
  //   console.log(target);
  // }

  const target = document.querySelector(".TK");

  if (target) {
    console.log("Target located");
    // console.log(target);
    observer.disconnect();
  }

  // for (const mutation of mutationList) {
  //   if (mutation.type === "childList") {
  //     console.log("A child node has been added or removed.");
  //     console.log(mutation);
  //   } else if (mutation.type === "attributes") {
  //     // console.log(`The ${mutation.attributeName} attribute was modified.`);
  //     console.log(mutation);
  //   }
  // }
};

const observer = new MutationObserver(callback);

observer.observe(parentNode, targetConfig);

console.log("Checkpoint 2 from popup. Observer finished.");

// const fragment = document.createDocumentFragment();
// const li = fragment
//   .appendChild(document.createElement("section"))
//   .appendChild(document.createElement("ul"))
//   .appendChild(document.createElement("li"));
// li.textContent = "hello world";

// el.appendChild(fragment);
