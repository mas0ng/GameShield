/************************************
 * contentScript.js
 ************************************/

console.log("[GameBlocker] Content script loaded.");

/**
 * Injects a script into the page's context
 */
function injectPageScript() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('pageScript.js');
  script.onload = function() {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);
}

/**
 * Listen for messages from the injected script
 */
window.addEventListener("message", function(event) {
  if (event.source !== window) return;
  
  if (event.data.type && event.data.type === "GAME_BLOCKER_KEYPRESS") {
    handleKeyPress(event.data.key);
  }
}, false);

/**
 * Handle keypress events received from the page context
 */
function handleKeyPress(key) {
  if (blockTriggered) return; // If already triggered a block, do nothing
  
  totalKeyPressCount++;
  
  if (collecting) {
    sequences.forEach(seq => {
      if (seq.keys.includes(key)) {
        sequenceCounts[seq.id]++;
      }
    });
  }
  
  if (totalKeyPressCount === 50) {
    if (collecting) {
      // Check each sequence against its threshold
      for (let seq of sequences) {
        const count = sequenceCounts[seq.id];
        const ratio = count / 50;
        console.log(`[GameBlocker] Sequence: ${seq.id}, Count: ${count}, Ratio: ${ratio}`);
        
        if (ratio >= seq.threshold) {
          redirectToBlockedPage("Game like activity auto detected");
          return; // Exit after blocking
        }
      }
    }
    
    // Reset counters for the next cycle
    totalKeyPressCount = 0;
    initSequenceCounts();
    collecting = !collecting; // Toggle collecting/skipping
    console.log(`[GameBlocker] Cycle complete. Next cycle is ${collecting ? "collecting" : "skipping"}.`);
  }
}

/**
 * Redirect to the blocked page
 */
function redirectToBlockedPage(reason) {
    blockTriggered = true;
    console.log(`[GameBlocker] Blocking page due to '${reason}'.`);
  
    // Ensure 'reason' is a string before encoding
    const reasonString = String(reason);  // Convert to string if necessary
    
    // Base64 encode the reason
    const encodedReason = btoa(reasonString);  // Use btoa for Base64 encoding

    // Log to check the value of encodedReason
    console.log(encodedReason);

    // Generate the URL using chrome.runtime.getURL() with the encoded reason
    const url = chrome.runtime.getURL(`blocked.html?reason=${encodedReason}`);

    // Log to check the final URL
    console.log(url);

    // Now redirect to the generated URL
    window.location.href = url;
}

/**
 * Initialize tracking variables
 */
let sequences = [];              // Loaded sequences from sequences.json
let allowlist = [];              // Loaded allowlist
let blockImmediatelyList = [];   // Loaded block immediately list
let bannedConnections = [];      // Loaded banned connections
let totalKeyPressCount = 0;      // Total key presses in the current cycle
let sequenceCounts = {};         // Counts per sequence
let blockTriggered = false;      // Whether this frame has triggered a block
let currentDomain = window.location.hostname;
let collecting = true;           // Whether currently collecting key presses

/**
 * Initialize counts for each sequence
 */
function initSequenceCounts() {
  sequences.forEach(seq => {
    sequenceCounts[seq.id] = 0;
  });
}

/**
 * Reset state when navigating to a new domain
 */
function resetState() {
  currentDomain = window.location.hostname;
  totalKeyPressCount = 0;
  collecting = true;
  blockTriggered = false;
  initSequenceCounts();
  console.log(`[GameBlocker] State reset for new domain: ${currentDomain}`);
}

/**
 * Fetch JSON file
 */
async function fetchJSON(fileName) {
  try {
    const response = await fetch(chrome.runtime.getURL(fileName));
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`[GameBlocker] Failed to load ${fileName}: ${error}`);
    return null;
  }
}

/**
 * Load all necessary JSON files
 */
async function loadResources() {
  const sequencesData = await fetchJSON('sequences.json');
  if (sequencesData && sequencesData.sequences) {
    sequences = sequencesData.sequences;
    console.log(`[GameBlocker] Loaded ${sequences.length} sequences.`);
  }
  
  const allowlistData = await fetchJSON('allowlist.json');
  if (allowlistData && allowlistData.allowlist) {
    allowlist = allowlistData.allowlist;
    console.log(`[GameBlocker] Loaded ${allowlist.length} allowlist domains.`);
  }
  
  const blockImmediatelyData = await fetchJSON('blockimmediatelylist.json');
  if (blockImmediatelyData && blockImmediatelyData.blockImmediatelyList) {
    blockImmediatelyList = blockImmediatelyData.blockImmediatelyList;
    console.log(`[GameBlocker] Loaded ${blockImmediatelyList.length} block immediately domains.`);
  }

  const bannedConnectionsData = await fetchJSON('bannedConnections.json');
  if (bannedConnectionsData && bannedConnectionsData.bannedConnections) {
    bannedConnections = bannedConnectionsData.bannedConnections;
    console.log(`[GameBlocker] Loaded ${bannedConnections.length} banned connections.`);
  }
}

/**
 * Add event listeners for key events with capture phase
 */
function addKeyListeners() {
  // Original event listeners
  window.addEventListener("keydown", handleKeyPress, { capture: true });
  window.addEventListener("keyup", handleKeyPress, { capture: true });
  window.addEventListener("keypress", handleKeyPress, { capture: true });
}

/**
 * Initialize the content script
 */
async function initialize() {
  await loadResources();
  
  // Check if current domain is in blockImmediatelyList
  if (blockImmediatelyList.includes(currentDomain)) {
    console.log(`[GameBlocker] Current domain '${currentDomain}' is in block immediately list. Blocking immediately.`);
    redirectToBlockedPage(`${currentDomain} is on the block list`);
    return;
  }
  
  // Check if current domain is in allowlist
  if (isInAllowList(currentDomain)) {
    console.log(`[GameBlocker] Current domain '${currentDomain}' is in allowlist. No action taken.`);
    return;
  }
  
  // Initialize sequence counts and add key listeners
  initSequenceCounts();
  addKeyListeners();
  
  // Inject the page script to capture key events more effectively
  injectPageScript();
  
  // Wait for the page to load before scanning for banned words or connections
  window.onload = async function() {
    await initializeBannedWordScanning();
    await scanForBannedConnections();
  };
}

/**
 * Load the list of banned words from bannedWords.json
 */
let bannedWords = [];

async function loadBannedWords() {
  const bannedWordsData = await fetchJSON('bannedWords.json');
  if (bannedWordsData && bannedWordsData.bannedWords) {
    bannedWords = bannedWordsData.bannedWords.map(word => word.toLowerCase());
    console.log(`[GameBlocker] Loaded ${bannedWords.length} banned words.`);
  }
}

/**
 * Scan the webpage for banned words and block if found
 */
function scanForBannedWords() {
  const pageText = document.body ? document.body.innerText.toLowerCase() : '';

  for (const word of bannedWords) {
    if (pageText.includes(word)) {
      console.log(`[GameBlocker] Blocking page due to banned word: "${word}"`);
      redirectToBlockedPage(`Page contained blocked word/phrase: ${word}`);
      return;
    }
  }
}

/**
 * Initialize banned words scanning
 */
async function initializeBannedWordScanning() {
  await loadBannedWords();
  scanForBannedWords();
}

/**
 * Scan the entire webpage content (HTML, JavaScript) for banned connections (URLs or domains)
 * This checks if the URL matches any sub-URL or path to the banned connections
 */
async function scanForBannedConnections() {
  const pageSource = document.documentElement.innerHTML.toLowerCase();
  
  
  // Check if the banned connection appears anywhere in the page content (HTML, JS, etc.)
  for (const connection of bannedConnections) {
    if (pageSource.includes(connection.toLowerCase())) {
      console.log(`[GameBlocker] Blocking page due to banned connection: "${connection}"`);
      redirectToBlockedPage("Page attempted to make a connection to a blocked connection");
      return;
    }
  }
}

/**
 * Check if the current domain is in the allowlist
 * Excludes checking for subdomains of allowed domains
 */
function isInAllowList(domain) {
  // Check for exact matches in the allowlist (does not block main domain)
  return allowlist.some(allowedDomain => domain === allowedDomain || domain.endsWith(`.${allowedDomain}`));
}

// Initialize on script load
initialize();

/**
 * Periodically check if the domain has changed
 * This handles single-page applications where the domain might not change
 */
setInterval(() => {
  if (window.location.hostname !== currentDomain) {
    resetState();
    initialize();
  }
}, 1000);
