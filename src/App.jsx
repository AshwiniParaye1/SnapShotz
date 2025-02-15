/* eslint-disable no-unused-vars */
/* global chrome */

import { useState, useRef } from "react";

function App() {
  const [screenshot, setScreenshot] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [shareLink, setShareLink] = useState(""); // New State
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
      ctx.fillStyle = isDarkMode ? "#1e1e1e" : "#f3f3f3"; // Dark gray for dark mode
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw header with control dots
      ctx.fillStyle = isDarkMode ? "#3a3a3a" : "#ddd"; // Slightly lighter dark mode header
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

  const downloadScreenshot = async () => {
    playClickSound();

    if (!screenshot) return;

    try {
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: "get_page_info" }, resolve);
      });

      const pageTitle = response?.title || "Screenshot";
      const formattedTitle = pageTitle
        .replace(/[^a-zA-Z0-9]/g, "_")
        .substring(0, 20); // Remove special characters, limit length
      const date = new Date().toISOString().split("T")[0]; // Format YYYY-MM-DD
      const filename = `${formattedTitle}_${date}.png`;

      const link = document.createElement("a");
      link.href = screenshot;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError("Failed to fetch page info.", err);
    }
  };

  const copyToClipboard = async () => {
    playClickSound();

    if (!screenshot) return;

    try {
      const blob = await fetch(screenshot).then((res) => res.blob());
      const clipboardItem = new ClipboardItem({ "image/png": blob });
      await navigator.clipboard.write([clipboardItem]);
      alert("Screenshot copied to clipboard!");
    } catch (err) {
      setError("Failed to copy screenshot.");
    }
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

          <div className="copy-download-btn">
            <button onClick={copyToClipboard} className="copy-button">
              <img
                src="/icons/copy.png"
                alt="Capture Screenshot"
                className="copy-icon-img"
              />
            </button>

            <button onClick={downloadScreenshot} className="download-link">
              <img
                src="/icons/download.png"
                alt="Capture Screenshot"
                className="download-icon-img"
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
