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
  
  const callback = (mutationList, observer) => {
    const target = document.querySelector(".G-tF");
    if (target) {
      // The following console logs are for debugging purposes,
      // to ensure that the targeted DOM element is the one correctly fetched.
      console.log("Target '.G-tF' located");
      console.log("DOM Element:", target);
      console.log("HTML from fetched DOM:", target.innerHTML);

      observer.disconnect();
      // Execute main extension logic from here
    }
  };

  
  
  const observer = new MutationObserver(callback);
  observer.observe(parentNode, targetConfig);
  console.log("MutationObserver is now actively watching Gmail DOM for changes...");
}

// Safely ensure the document body exists before begin observing the DOM
// If the observer function run before 'document.body' fully loads, it will return "null", crashing the script. 
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startDOMObserver);
} else {
  startDOMObserver();
}

