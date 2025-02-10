/* eslint-disable no-unused-vars */
/* global chrome */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "capture_visible") {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (image) => {
      sendResponse({ screenshotUrl: image });
    });
    return true;
  }

  if (message.action === "capture_full_page") {
    captureFullPage(sender.tab.id, sendResponse);
    return true;
  }
});

async function captureFullPage(tabId, sendResponse) {
  const screenshots = [];
  const result = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => ({
      width: document.body.scrollWidth,
      height: document.body.scrollHeight,
      viewportHeight: window.innerHeight
    })
  });

  const { width, height, viewportHeight } = result[0].result;
  let scrollY = 0;

  while (scrollY < height) {
    await chrome.tabs.sendMessage(tabId, { scrollY });
    await new Promise((resolve) => setTimeout(resolve, 500));
    const image = await chrome.tabs.captureVisibleTab(null, { format: "png" });
    screenshots.push(image);
    scrollY += viewportHeight;
  }

  sendResponse({ screenshots });
}
