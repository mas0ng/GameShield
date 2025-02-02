// pageScript.js

(function() {
  /**
   * Listen for key events and post messages to the content script
   */
  window.addEventListener("keydown", function(event) {
    window.postMessage({
      type: "GAME_BLOCKER_KEYPRESS",
      key: event.key
    }, "*");
  }, { capture: true });
  
  window.addEventListener("keyup", function(event) {
    window.postMessage({
      type: "GAME_BLOCKER_KEYPRESS",
      key: event.key
    }, "*");
  }, { capture: true });
  
  window.addEventListener("keypress", function(event) {
    window.postMessage({
      type: "GAME_BLOCKER_KEYPRESS",
      key: event.key
    }, "*");
  }, { capture: true });
})();

