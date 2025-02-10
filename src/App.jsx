/* global chrome */

import { useState } from "react";

function App() {
  const [screenshot, setScreenshot] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const captureVisible = async () => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: "capture_visible" }, resolve);
      });

      if (response?.error) {
        setError(response.error);
      } else if (response?.screenshotUrl) {
        setScreenshot(response.screenshotUrl);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: "10px", width: "250px", textAlign: "center" }}>
      <h3>SnapShotz</h3>
      <button onClick={captureVisible} disabled={isLoading}>
        {isLoading ? "Capturing..." : "Capture Visible"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {screenshot && (
        <div style={{ marginTop: "10px" }}>
          <h4>Visible Area Screenshot</h4>
          <img
            src={screenshot}
            alt="Screenshot"
            style={{ width: "100%", marginTop: "10px" }}
          />
          <a
            href={screenshot}
            download="screenshot.png"
            style={{ display: "block", marginTop: "5px" }}
          >
            Download
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
