console.log("Gmail Extension: Content script active!");

window.onload = (event) => {
  console.log("Hello from window.onload");
  console.log("Calling browser.runtime.sendMessage()...");
  try {
    browser.runtime.sendMessage({
      action: "connectGmail",
    });
  } catch (e) {
    console.error(`Error: ${e}`);
  }
};

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
          // console.log("HTML from fetched DOM:", node.innerHTML);
          injectCustomButton(node);
        }
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(parentNode, targetConfig);
  console.log(
    "MutationObserver is now actively watching Gmail DOM for changes...",
  );
}

function injectCustomButton(target) {
  // Check if the button already exists to avoid duplicates
  if (document.querySelector("[custom-organise-button]")) {
    console.log("Custom button already exists. Skipping injection.");
    return;
  }

  console.log("Injecting custom button into the target", target);
  const root = document.createElement("div");
  const button = document.createElement("div");
  const image = document.createElement("img");
  const span = document.createElement("span");

  root.classList.add("custom-container");
  image.id = "manage-folder";

  image.src = chrome.runtime.getURL("assets/folder_managed_2.png");

  button.id = "re-organise";
  button.role = "button";
  button.tabIndex = 0;

  button.addEventListener("click", async () => {
    console.log("Custom button clicked!");

    // Add your custom button logic here
    const url = "http://localhost:8000";
    let arrayEmails;

    console.log("getEmails called");
    arrayEmails = await browser.runtime.sendMessage({
      action: "getEmails",
    });

    console.log(arrayEmails);

    try {
      let result = await fetch(`${url}/emails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(arrayEmails),
      });
      const response = await result.json();
      console.log("HTTP Status: ", result.status);
      console.log("FastAPI response:", response);
    } catch (error) {
      console.log(`Fetch Error: ${error}`);
    }

    labelsAdd = await browser.runtime.sendMessage({
      action: "addLabels",
    });
  });

  button.appendChild(image);
  button.appendChild(document.createTextNode("Organise My Gmail"));
  root.appendChild(button);
  target.appendChild(root);

  // console.log("BUTTON IN DOM: ", document.querySelector("#re-organise"));
  document.querySelector("#re-organise").addEventListener("click", () => {
    console.log("Click test is working!");
  });
}

// Safely ensure the document body exists before begin observing the DOM
// If the observer function run before 'document.body' fully loads, it will return "null".
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startDOMObserver);
} else {
  startDOMObserver();
}
