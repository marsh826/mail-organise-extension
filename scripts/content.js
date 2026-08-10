console.log("Gmail Extension: Content script active!");

function startDOMObserver() {
  console.log("The DOM is fully parsed. HTML elements are safe to manipulate!");
  
  const parentNode = document.body;
  if (!parentNode) return;
  
  const targetConfig = {
    // Don't need 'attributes: true' because it will slow down Gmail Web Page performance
    // 'attributes: true' tracks all class and style changes, Gmail's attributes are constantly changing and will trigger the observer too often
    // In this case, we only need to track the addition of newly added elements/nodes into the DOM
    childList: true,
    subtree: true,
  };
  
  const callback = (mutationList) => {
    for (const mutation of mutationList) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) {
          continue;
        }
        // Process the added HTMLElement
        // Target Selector: ".G-tF" (Flex container for the button rows in Gmail)

        // Check if the added node matches the target selector
        if (node.matches(".G-tF")) {
          console.log("Target '.G-tF' located");
          console.log("DOM Element:", node);
          console.log("HTML from fetched DOM:", node.innerHTML);
          injectCustomButton(node);
        }

        // Check if newly added subtree contains the target selector
        // node.querySelectorAll(".G-tF").forEach((target) => {
        //   injectCustomButton(target);
        // });
      }
    }
    // if (target) {
    //   // The following console logs are for debugging purposes,
    //   // to ensure that the targeted DOM element is the one correctly fetched.

    //   // Disconnect to early?
    //   observer.disconnect();

    //   // Execute main extension logic from here
    //   injectCustomButton(target);
    // }
  };

  const observer = new MutationObserver(callback);
  observer.observe(parentNode, targetConfig);
  console.log("MutationObserver is now actively watching Gmail DOM for changes...");
}

// function searchForTargetElement() {
//   const target = document.querySelectorAll(".G-tF");
//   target.forEach((element) => {
//       console.log("Target '.G-tF' located");
//       console.log("DOM Element:", element);
//       console.log("HTML from fetched DOM:", element.innerHTML);
//       injectCustomButton(target);
//   })
// }

function injectCustomButton(target) {
  // Check if the button already exists to avoid duplicates
  if (document.querySelector("[custom-organise-button]")) {
    console.log("Custom button already exists. Skipping injection.");
    return;
  }
  
  console.log("Injecting custom button into the target", target);
  const root = document.createElement("div");
  const button = document.createElement("button");

  root.classList.add("custom-organise-button");
  root.style.display = "flex";
  root.style.alignItems = "center";

  button.type = "button";
  button.textContent = "Custom Button";
  button.style.padding = "8px 16px";
  button.style.marginLeft = "8px";
  button.style.backgroundColor = "#1a73e8";
  button.style.cursor = "pointer";

  button.addEventListener("click", () => {
    console.log("Custom button clicked!");
    // Add your custom button logic here
  });

  root.appendChild(button);
  target.appendChild(root);
}

// Safely ensure the document body exists before begin observing the DOM
// If the observer function run before 'document.body' fully loads, it will return "null".
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startDOMObserver);
} else {
  startDOMObserver();
}

