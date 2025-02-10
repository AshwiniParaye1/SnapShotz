/* global chrome */

document.getElementById("startRecording").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "start_recording" }, (response) => {
    if (response.success) {
      alert("Recording started!");
    } else {
      alert("Error: " + response.error);
    }
  });
});

document.getElementById("stopRecording").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "stop_recording" }, (response) => {
    if (response.success) {
      alert("Recording stopped!");
      chrome.storage.local.get("recordedVideoUrl", (data) => {
        if (data.recordedVideoUrl) {
          const videoElement = document.getElementById("videoPreview");
          videoElement.src = data.recordedVideoUrl;
          videoElement.loop = true;
          videoElement.play();
        }
      });
    } else {
      alert("Error: " + response.error);
    }
  });
});
