const clientId = "INSERT_ID_HERE"
// const redirectUri = browser.identity.getRedirectURL();

console.log("Background.js is loaded and running");
// console.log(`Redirect URL: ${browser.identity.getRedirectURL()}`);

let token_Storage = null;
let token_ExpiryTimer = 0;
let timer;

// window.addEventListener("beforeunload", (event) => {
//   event.preventDefault();
//   token_ExpiryTimer = 0;
//   token_LocalStorage = "";
//   localStorage.removeItem("has_api_token");
//   clearInterval(timer);
// });

function setLocalStorage() {
  if (token_Storage !== null) {
    localStorage.setItem("has_api_token", "Assigned");
  } else {
    localStorage.setItem("has_api_token", "Empty");
  }

  if (token_ExpiryTimer > 0) {
    timer = setInterval(function () {
      token_ExpiryTimer--;
      console.log(token_ExpiryTimer);
      console.log(`token_Storage: ${localStorage.getItem("has_api_token")}`);

      if (token_ExpiryTimer === 0) {
        console.log("Token Time Out");
        token_Storage = null;
        setLocalStorage();
        localStorage.removeItem("has_api_token");
      }
    }, 1000);
  } else {
    clearInterval(timer);
  }
}

async function connectGmail() {
  if (token_Storage === null) {
    try {
      const redirectUri = browser.identity.getRedirectURL();
      console.log(`Redirect URL: ${redirectUri}`);

      const cleanedURI = redirectUri.slice(
        redirectUri.indexOf("/") + 2,
        (0, redirectUri.indexOf(".")),
      );

      const googleRedirectURI = `http://127.0.0.1/mozoauth2/${cleanedURI}`;
      console.log(googleRedirectURI);

      // Gmail's allowed access to read the data
      const scopes = [
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.labels",
        "https://www.googleapis.com/auth/gmail.modify",
      ];

      const authUrl =
        "https://accounts.google.com/o/oauth2/v2/auth" +
        `?client_id=${encodeURIComponent(clientId)}` +
        `&response_type=token` +
        `&redirect_uri=${encodeURIComponent(googleRedirectURI)}` +
        `&scope=${encodeURIComponent(scopes.join(" "))}`;

      const redirectedTo = await browser.identity.launchWebAuthFlow({
        url: authUrl,
        interactive: true,
      });

      console.log("Success! Full redirect URL containing token:", redirectedTo);

      const returnedURL = new URL(redirectedTo);
      const hashedParams = new URLSearchParams(returnedURL.hash.substring(1));

      token_Storage = hashedParams.get("access_token");
      token_ExpiryTimer = hashedParams.get("expires_in");

      // token_ExpiryTimer = 15;

      setLocalStorage();

      console.log("Access Token:", !!token_Storage);
      console.log("Token Expiry:", token_ExpiryTimer);
      console.log("Token Assigned to Local Storage:", token_Storage !== null);
    } catch (error) {
      console.error(`OAuth authorisation failed: ${error}`);
    }
  } else {
    console.log("token_Storage still has a token!");
  }
}

async function getEmails() {
  let response;
  let emailList = [];
  try {
    const results = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/?maxResults=10",
      {
        headers: {
          Authorization: `Bearer ${token_Storage}`,
        },
      },
    );
    response = await results.json();
    // console.log("Gmail Response:", JSON.stringify(response));
    // console.log("Gmail Response:", response);
    console.log("testing response.messages: ");
    console.log(response.messages);

    console.log("for loop area");
    for (let i = 0; i < response.messages.length; i++) {
      //   console.log(response.messages[i].id);
      let item = await extractEmails(response.messages[i].id);
      //   console.log(item);
      emailList.push(item);
    }

    console.log(emailList);
    return emailList;
  } catch (error) {
    console.error(`Gmail Fetch Error: ${error}`);
  }
}

// Extracting Payload Headers from returned Objects
function getHeader(message, headerName) {
  return (
    message.payload.headers.find(
      (header) => header.name.toLowerCase() === headerName.toLowerCase(),
    )?.value ?? null
  );
}

function decodeHtmlEntities(text) {
  const parser = new DOMParser();
  const document = parser.parseFromString(text, "text/html");

  return document.body.textContent || "";
}

function decodeHTML(text) {
  const data = new DOMParser().parseFromString(text, "text/html");
  return data.body.textContent || "";
}

function textSantisation(text) {
  return text
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function removeLinks(text) {
  return text
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeBase64(message) {
  const base64 = message.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  return new TextDecoder("utf-8").decode(bytes);
}

function objectGmailPart(payload, mimeType) {
  // If the body already present in the payload and not nested in another layer
  if (payload.mimeType === mimeType && payload.body.data) {
    // console.log("Payload:", payload);
    return payload;
  }

  if (!payload.parts) {
    return null;
  }

  // If the body is nested in another layer of the email
  for (const part of payload.parts) {
    const subPart = objectGmailPart(part, mimeType);
    if (subPart) return subPart;
  }

  return null;
}

function getPlainText(response) {
  const part = objectGmailPart(response.payload, "text/plain");

  if (!part) {
    return null;
  }

  let result = decodeBase64(part.body.data);

  result = decodeHTML(result);
  result = textSantisation(result);

  return removeLinks(result);
}

async function extractEmails(id) {
  console.log("function called");
  try {
    const results = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token_Storage}`,
        },
      },
    );

    const response = await results.json();
    // console.log("Returned response: ", response);

    // REFORMATTING EMAILS TO RETURN ONLY NECESSARY ELEMENTS OF RESPONSE OBJECT
    let data;
    try {
      data = {
        id: response.id,
        threadId: response.threadId,
        from_: getHeader(response, "From"),
        to: getHeader(response, "To"),
        subject: getHeader(response, "Subject"),
        date: getHeader(response, "Date"),
        category: "",
        // pinkGuy: "hey bauss",
        snippet: response.snippet.replace(/[\uFEFF\u200C]/g, "").trim(),
        body: getPlainText(response),
      };
    } catch (error) {
      console.error(error);
    }
    return data;
  } catch (error) {
    console.error(`Fetch messsage error: ${error}`);
  }
}

async function addLabels() {
  const url = "http://localhost:8000";
  try {
    let results = await fetch(`${url}/ollama-run`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!results.ok) {
        console.error( "Ollama endpoint failed:", results.status, await results.text());
        return;
    }

    const data = await results.json();
    let labels = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/labels/`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token_Storage}`,
        },
    });
    const labelsData = await labels.json();
    console.log("Status:", labels.status);
    console.log("Labels called:", labelsData);

    for (let i = 0; i < data.length; i++) {
    let labelParam = "Label_11343340264044746"
      const response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${data[i].email}/modify`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token_Storage}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // addLabelIds: [data[i].category],
            addLabelIds: labelParam,
          }),
        },
      );
        const gmailData = await response.json();
        console.log("Gmail response:", response.status, gmailData);
    }
  } catch (error) {
    console.error("Error Labeling email:", error);
  }
}

browser.runtime.onMessage.addListener(async (message) => {
  console.log("background.js received: ", message["action"]);

  switch (message.action) {
    case "connectGmail":
      connectGmail();
      break;

    case "getEmails":
      return await getEmails();

    case "addLabels":
      return await addLabels();

    default:
      return {
        message:
          "All my characters are me. I'm not a good enough actor to become a character. (Ryan Gosling)",
      };
  }
});
