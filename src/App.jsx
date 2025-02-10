/* eslint-disable no-unused-vars */
/* global chrome */
import { useState, useRef } from "react";

function App() {
  const [screenshot, setScreenshot] = useState(null);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

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

  const startScreenRecording = async () => {
    playClickSound();
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      mediaRecorderRef.current = new MediaRecorder(stream);
      recordedChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: "video/webm"
        });
        const videoUrl = URL.createObjectURL(blob);
        setRecordedVideo(videoUrl);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      setError("Failed to start screen recording: " + err.message);
    }
  };

  const stopScreenRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const applyOverlay = (imageUrl) => {
    // ... (previous overlay code remains the same)
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
            download="screen-recording.mp4"
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
