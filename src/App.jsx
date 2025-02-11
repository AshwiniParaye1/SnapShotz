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
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = response.screenshotUrl;
        img.onload = () => {
          applyOverlay(response.screenshotUrl);
        };
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
    img.crossOrigin = "Anonymous"; // Prevents CORS issues
    img.src = imageUrl;
    img.onload = () => {
      const padding = 20; // Padding around the screenshot
      const headerHeight = 40;
      // Set canvas dimensions correctly
      canvas.width = img.width + padding * 2;
      canvas.height = img.height + headerHeight + padding * 2;
      // Clear canvas before drawing
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Set background color based on theme
      ctx.fillStyle = isDarkMode ? "#2b2b2b" : "#f3f3f3";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Draw header with control dots
      ctx.fillStyle = isDarkMode ? "#444" : "#ddd";
      ctx.fillRect(padding, padding, img.width, headerHeight);
      // Draw control dots (Mac-style window controls)
      const dotY = padding + headerHeight / 2;
      const dotSpacing = 20;
      const colors = ["#ff5f57", "#ffbd2e", "#28c840"]; // Red, Yellow, Green
      colors.forEach((color, index) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(padding + dotSpacing * (index + 1), dotY, 6, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw the screenshot below the header with padding
      ctx.drawImage(img, padding, padding + headerHeight);

      // Update the screenshot preview with the new image
      setScreenshot(canvas.toDataURL("image/png"));
    };

    img.onerror = () => {
      console.error("Failed to load image for overlay.");
      setError("Failed to apply overlay. Try again.");
    };
  };

  return (
    <div className={`container ${isDarkMode ? "dark-mode" : "light-mode"}`}>
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
          {isDarkMode ? "🌙" : "☀️"}
        </button>
      </div>

      <h2 className="title">SnapShotz</h2>

      <div className="action-buttons">
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
      </div>

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
