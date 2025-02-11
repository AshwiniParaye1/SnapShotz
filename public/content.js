//content.js

/* global chrome */

let mediaRecorder;
let recordedChunks = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "start_recording") {
    navigator.mediaDevices
      .getDisplayMedia({ video: true, audio: true })
      .then((stream) => {
        mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
        recordedChunks = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunks, { type: "video/webm" });
          const url = URL.createObjectURL(blob);
          chrome.storage.local.set({ recordedVideoUrl: url });
        };

        mediaRecorder.start();

        // Check storage for stop signal
        chrome.storage.local.get(["stopRecording"], (data) => {
          if (data.stopRecording) {
            mediaRecorder.stop();
            chrome.storage.local.remove("stopRecording");
          }
        });

        sendResponse({ success: true });
      })
      .catch((err) => {
        sendResponse({ error: err.message });
      });

    return true;
  }
});
