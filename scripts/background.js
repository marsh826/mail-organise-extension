// async function testFetch() {
//      // Add your custom button logic here
//     const url = "tba";
    
//     try {
//       let result = await fetch(url);

//       if(result.status(200)) {
//         console.log(result.body);
//       }
//     } catch (e) {
//       console.log(e);
//     }
// }

// background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fetchData") {
    fetch(message.url)
      .then(response => response.json())
      .then(data => sendResponse({ success: true, data: data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true; // Keeps the message channel open for asynchronous responses
  }
});
