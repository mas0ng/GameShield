/************************************
 * background.js
 ************************************/

console.log("[GameBlocker] Background service worker loaded.");

/**
 * Define an allowlist to exclude specific domains from being blocked
 * Note: Since allowlist.json is handled in the content script, this is optional
 */
const allowlist = [
  "google.com",
  "gmail.com",
  "stackoverflow.com",
  "example.com" // Add other domains you want to exclude from blocking
];

/**
 * Listen for messages from content scripts
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "blockPage") {
    const tabId = sender.tab.id;
    const url = request.url;
    const sequenceId = request.sequenceId;

    console.log(`[GameBlocker] Received block request from tab ${tabId} for URL: ${url}`);

    // Parse the URL to extract the hostname
    let urlObj;
    try {
      urlObj = new URL(url);
    } catch (error) {
      console.error(`[GameBlocker] Invalid URL: ${url}`);
      return;
    }

    const domain = urlObj.hostname;

    // Check if the domain is in the allowlist
    if (allowlist.includes(domain)) {
      console.log(`[GameBlocker] Skipping blocking for allowed domain: ${domain}`);
      return;
    }

    // Inject the blocking script into the main frame (remove 'frameId')
    chrome.scripting.executeScript({
      target: { tabId: tabId }, // Removed 'frameId'
      func: replacePageContent,
      args: [sequenceId]
    }).then(() => {
      console.log(`[GameBlocker] Blocking script injected into tab ${tabId}.`);
    }).catch(err => {
      console.error(`[GameBlocker] Failed to inject blocking script: ${err}`);
    });
  }
});

/**
 * Function to replace the entire page content with a blocked message
 * This function runs in the context of the web page
 */
function replacePageContent(sequenceId) {
  console.log(`[GameBlocker] Blocking the page due to sequence '${sequenceId}'.`);

  // Fetch the blocked.html content
  fetch(chrome.runtime.getURL('blocked.html'))
    .then(response => response.text())
    .then(html => {
      document.documentElement.innerHTML = html;
    })
    .catch(error => {
      console.error(`[GameBlocker] Failed to load blocked.html: ${error}`);
    });
}
