/* eslint-disable no-undef */
//app.jsx

/* global chrome */
import { useState, useEffect, useRef } from "react";

function App() {
  const [screenshot, setScreenshot] = useState(null);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Listen for messages from background.js
    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === "recording_stopped" && message.videoUrl) {
        setRecordedVideo(message.videoUrl);
      }
    });
  }, []);

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

  const startScreenRecording = () => {
    playClickSound();
    chrome.runtime.sendMessage(
      { action: "request_screen_recording" },
      (response) => {
        if (response.error) {
          console.error("Error:", response.error);
        }
      }
    );
  };

  const stopScreenRecording = () => {
    chrome.runtime.sendMessage({ action: "stop_recording" }, (response) => {
      if (response?.error) {
        setError(response.error);
      }
      setIsRecording(false);
    });
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

        {!isRecording ? (
          <button onClick={startScreenRecording} className="icon-button">
            <img
              src="/icons/video.png"
              alt="Start Recording"
              className="icon-img"
            />
          </button>
        ) : (
          <button
            onClick={stopScreenRecording}
            className="icon-button stop-recording"
          >
            <img
              src="/icons/video.png"
              alt="Stop Recording"
              className="icon-img"
            />
          </button>
        )}
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
            Download Screenshot
          </a>
        </div>
      )}

      {recordedVideo && (
        <div className="video-preview">
          <video src={recordedVideo} controls className="recorded-video" />
          <a
            href={recordedVideo}
            download="screen-recording.webm"
            className="download-link"
          >
            Download Recording
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
