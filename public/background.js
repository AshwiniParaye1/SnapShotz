/* global chrome */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message);

  if (message.action === "capture_visible") {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (image) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        sendResponse({ error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ screenshotUrl: image });
      }
    });
    return true;
  }
});
