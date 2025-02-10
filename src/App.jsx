/* global chrome */

import { useState, useRef } from "react";

function App() {
  const [screenshot, setScreenshot] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const canvasRef = useRef(null);

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
        setTimeout(() => applyOverlay(response.screenshotUrl), 100);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const applyOverlay = (imageUrl) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      // Set canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height + 40; // Extra space for header

      // Draw background
      ctx.fillStyle = isDarkMode ? "#2b2b2b" : "#f3f3f3";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw header
      ctx.fillStyle = "#333";
      ctx.fillRect(0, 0, canvas.width, 40);

      // Draw control dots
      ctx.fillStyle = "#ff5f57"; // Red
      ctx.beginPath();
      ctx.arc(20, 20, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffbd2e"; // Yellow
      ctx.beginPath();
      ctx.arc(40, 20, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#28c840"; // Green
      ctx.beginPath();
      ctx.arc(60, 20, 6, 0, Math.PI * 2);
      ctx.fill();

      // Draw the screenshot below the header
      ctx.drawImage(img, 0, 40);

      // Update the screenshot preview
      setScreenshot(canvas.toDataURL("image/png"));
    };
  };

  return (
    <div className={`container ${isDarkMode ? "dark-mode" : "light-mode"}`}>
      {/* Header with Browser Control Dots */}
      <div className="header">
        <div className="control-dots">
          <span className="dot red"></span>
          <span className="dot yellow"></span>
          <span className="dot green"></span>
        </div>
        <button
          className="theme-toggle"
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>
      </div>

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
          <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
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
