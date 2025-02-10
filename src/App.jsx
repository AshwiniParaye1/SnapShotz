/* global chrome */

import { useState } from "react";

function App() {
  const [screenshot, setScreenshot] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const playClickSound = () => {
    const audio = new Audio("/sounds/click.mp3");
    audio.volume = 0.2;
    audio.play();
  };

  const captureVisible = async () => {
    playClickSound();
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
    <div className="container">
      <h3>SnapShotz</h3>

      <button
        onClick={captureVisible}
        disabled={isLoading}
        className="icon-button"
      >
        <img
          src="/icons/icon1.png"
          alt="Capture Screenshot"
          className="icon-img"
        />
      </button>

      {error && <p className="error-text">{error}</p>}

      {screenshot && (
        <div className="screenshot-preview">
          <img src={screenshot} alt="Screenshot" className="screenshot-img" />
          <a
            href={screenshot}
            download="screenshot.png"
            className="download-link"
          >
            Download
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
