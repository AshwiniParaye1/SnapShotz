//background.js

/* global chrome */

let mediaRecorder;
let recordedChunks = [];
let stream;
let isRecording = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "start_recording") {
    chrome.tabCapture.capture(
      { video: true, audio: false },
      (capturedStream) => {
        if (chrome.runtime.lastError || !capturedStream) {
          sendResponse({
            error: chrome.runtime.lastError?.message || "Failed to capture tab"
          });
          return;
        }

        stream = capturedStream;
        recordedChunks = [];
        mediaRecorder = new MediaRecorder(stream, {
          mimeType: "video/webm; codecs=vp9"
        });

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
        isRecording = true;
        sendResponse({ success: true });
      }
    );

    return true; // Keep the message channel open
  }

  if (message.action === "stop_recording") {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      isRecording = false;
      sendResponse({ success: true });
    } else {
      sendResponse({ error: "No recording in progress" });
    }
  }
});
