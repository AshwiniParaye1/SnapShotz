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

  if (message.action === "get_page_info") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0 || !tabs[0].title) {
        sendResponse({ error: "Failed to get page title." });
      } else {
        sendResponse({ title: tabs[0].title });
      }
    });

    return true;
  }
});
