/* global chrome */

// let mediaRecorder;
// let recordedChunks = [];
// let isRecording = false;

//TODO - work on screen recording in new tab

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

  // if (message.action === "request_screen_recording") {
  //   // Step 1: Get the active tab
  //   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  //     if (!tabs.length) {
  //       sendResponse({ error: "No active tab found." });
  //       return;
  //     }
  //     const tab = tabs[0];
  //     // Step 2: Open permission window in a valid tab context
  //     chrome.desktopCapture.chooseDesktopMedia(
  //       ["screen", "window", "tab"],
  //       tab,
  //       (streamId) => {
  //         if (!streamId) {
  //           sendResponse({ error: "Permission denied or no screen selected." });
  //           return;
  //         }
  //         // Step 3: Send the streamId back to start recording
  //         chrome.runtime.sendMessage({ action: "start_recording", streamId });
  //       }
  //     );
  //   });
  //   return true; // Keep the message channel open for async response
  // }

  // if (message.action === "start_recording") {
  //   navigator.mediaDevices
  //     .getUserMedia({
  //       video: {
  //         mandatory: {
  //           chromeMediaSource: "desktop",
  //           chromeMediaSourceId: message.streamId
  //         }
  //       }
  //     })
  //     .then((stream) => {
  //       recordedChunks = [];
  //       mediaRecorder = new MediaRecorder(stream, {
  //         mimeType: "video/webm; codecs=vp9"
  //       });

  //       mediaRecorder.ondataavailable = (event) => {
  //         if (event.data.size > 0) recordedChunks.push(event.data);
  //       };

  //       mediaRecorder.onstop = () => {
  //         const blob = new Blob(recordedChunks, { type: "video/webm" });
  //         const url = URL.createObjectURL(blob);
  //         chrome.storage.local.set({ recordedVideoUrl: url });
  //         chrome.runtime.sendMessage({
  //           action: "recording_stopped",
  //           videoUrl: url
  //         });
  //       };

  //       mediaRecorder.start();
  //       isRecording = true;
  //     })
  //     .catch((error) => {
  //       console.error("Error capturing screen:", error);
  //       sendResponse({ error: error.message });
  //     });
  //   return true;
  // }

  // if (message.action === "stop_recording") {
  //   if (mediaRecorder && isRecording) {
  //     mediaRecorder.stop();
  //     isRecording = false;
  //     sendResponse({ success: true });
  //   } else {
  //     sendResponse({ error: "No recording in progress" });
  //   }
  // }
});
