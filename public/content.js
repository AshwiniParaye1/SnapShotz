/* global chrome */

chrome.runtime.onMessage.addListener((message) => {
  if (message.scrollY !== undefined) {
    window.scrollTo(0, message.scrollY);
  }
});
