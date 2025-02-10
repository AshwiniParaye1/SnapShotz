/* global chrome */

import { useState } from "react";

function App() {
  const [screenshot, setScreenshot] = useState(null);
  const [fullPageImages, setFullPageImages] = useState([]);

  const captureVisible = () => {
    chrome.runtime.sendMessage({ action: "capture_visible" }, (response) => {
      setScreenshot(response.screenshotUrl);
    });
  };

  const captureFullPage = () => {
    chrome.runtime.sendMessage({ action: "capture_full_page" }, (response) => {
      setFullPageImages(response.screenshots);
    });
  };

  return (
    <div style={{ padding: "10px", width: "250px", textAlign: "center" }}>
      <h3>Screenshot Tool</h3>
      <button onClick={captureVisible}>Capture Visible</button>
      <button onClick={captureFullPage} style={{ marginTop: "10px" }}>
        Capture Full Page
      </button>

      {screenshot && (
        <>
          <img
            src={screenshot}
            alt="Screenshot"
            style={{ width: "100%", marginTop: "10px" }}
          />
          <a href={screenshot} download="screenshot.png">
            Download
          </a>
        </>
      )}

      {fullPageImages.length > 0 && (
        <>
          <h4>Full Page Screenshots</h4>
          {fullPageImages.map((img, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              <img src={img} alt={`Part ${index}`} style={{ width: "100%" }} />
              <a href={img} download={`screenshot_part_${index}.png`}>
                Download Part {index + 1}
              </a>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default App;
