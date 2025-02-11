/* global chrome */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "capture_visible") {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (screenshotUrl) => {
      if (chrome.runtime.lastError || !screenshotUrl) {
        sendResponse({ error: "Failed to capture screenshot." });
      } else {
        sendResponse({ screenshotUrl });
      }
    });

    return true; // Keep the message channel open for async response
  }
});
