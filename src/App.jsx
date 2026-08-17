import { useState, useEffect, useRef } from "react";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function uploadPic(file) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Image upload failed");
  }

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return {};
}

async function predict(file, uploadedImageUrl = "") {
  const formData = new FormData();
  formData.append("image", file);

  if (uploadedImageUrl) {
    formData.append("image_url", uploadedImageUrl);
  }

  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Prediction request failed");
  }

  return response.json();
}

function App() {
  const [page, setPage] = useState("dashboard");
  const [image, setImage] = useState(null);
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [theme, setTheme] = useState(() => {
  return localStorage.getItem("theme") || "light";
});

useEffect(() => {
  document.body.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}, [theme]);

const toggleTheme = () => {
  setTheme((prev) => (prev === "light" ? "dark" : "light"));
};
// ============================
// CAMERA FUNCTIONS
// ============================

const openCamera = async () => {
  try {
    setError("");

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    });

    streamRef.current = stream;
    setCameraOpen(true);

    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    }, 100);

  } catch (err) {
    console.error("Camera error:", err);
    setError(
      "Unable to access your camera. Please allow camera permission in your browser."
    );
  }
};

const closeCamera = () => {
  if (streamRef.current) {
    streamRef.current.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  if (videoRef.current) {
    videoRef.current.srcObject = null;
  }

  setCameraOpen(false);
};

const capturePhoto = () => {
  const video = videoRef.current;

  if (!video) return;

  const canvas = document.createElement("canvas");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context = canvas.getContext("2d");

  context.drawImage(
    video,
    0,
    0,
    canvas.width,
    canvas.height
  );

  canvas.toBlob((blob) => {
    if (!blob) return;

    const file = new File(
      [blob],
      `camera-${Date.now()}.jpg`,
      {
        type: "image/jpeg",
      }
    );

    closeCamera();

    processImageFile(file);
  }, "image/jpeg", 0.95);
};

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setImage(previewUrl);
    setFileName(file.name);
    setSelectedFile(file);
    setPrediction(null);
    setError("");
    setPage("result");

    try {
      const uploadResult = await uploadPic(file);
      const imageUrl = uploadResult.imageUrl || uploadResult.url || uploadResult.fileUrl;

      if (imageUrl) {
        setUploadedImageUrl(imageUrl);
      }
    } catch (err) {
      setError("Image was selected locally, but the backend upload failed.");
    }
  };
  const handleDrop = async (e) => {
  e.preventDefault();
  e.stopPropagation();

  const file = e.dataTransfer.files?.[0];
  if (!file || !file.type.startsWith("image/")) return;

  await processImageFile(file);
};

const handleDragOver = (e) => {
  e.preventDefault();
  e.stopPropagation();
};

useEffect(() => {
  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  window.addEventListener("dragenter", preventDefaults);
  window.addEventListener("dragover", preventDefaults);
  window.addEventListener("dragleave", preventDefaults);
  window.addEventListener("drop", preventDefaults);

  return () => {
    window.removeEventListener("dragenter", preventDefaults);
    window.removeEventListener("dragover", preventDefaults);
    window.removeEventListener("dragleave", preventDefaults);
    window.removeEventListener("drop", preventDefaults);
  };
}, []);

  const processImageFile = async (file) => {
  if (!file || !file.type.startsWith("image/")) return;

  const previewUrl = URL.createObjectURL(file);

  setImage(previewUrl);
  setFileName(file.name || "dropped-image.png");
  setSelectedFile(file);
  setPrediction(null);
  setError("");
  setPage("result");

  try {
    const uploadResult = await uploadPic(file);
    const imageUrl =
      uploadResult.imageUrl ||
      uploadResult.url ||
      uploadResult.fileUrl;

    if (imageUrl) {
      setUploadedImageUrl(imageUrl);
    }
  } catch (err) {
    setError("Image was dropped locally, but the backend upload failed.");
  }
};

useEffect(() => {
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        processImageFile(file);
        break;
      }
    }
  };

  window.addEventListener("paste", handlePaste);
  return () => window.removeEventListener("paste", handlePaste);
}, []);
useEffect(() => {
  return () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
    }
  };
}, []);


  const handlePredict = async () => {
    if (!selectedFile) {
      setError("Please upload an image first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const uploadResult = await uploadPic(selectedFile);
      const finalImageUrl = uploadResult.imageUrl || uploadResult.url || uploadResult.fileUrl || uploadedImageUrl;
      const result = await predict(selectedFile, finalImageUrl);

      const age = result.age ?? result.predicted_age ?? result.prediction ?? 0;
      const minAge = result.min_age ?? result.minAge ?? Math.max(0, age - 3);
      const maxAge = result.max_age ?? result.maxAge ?? age + 3;
      const confidence = result.confidence ?? result.confidence_score ?? result.score ?? 0;

      setPrediction({
        age,
        minAge,
        maxAge,
        confidence,
      });
    } catch (err) {
      setError(err.message || "Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (selectedPage) => {
    setPage(selectedPage);
  };

  return (
    <div className="app">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-mark">
            AI
          </div>

          <div>
            <h2>AGE AI</h2>
            <span>Age Intelligence</span>
          </div>
        </div>

        <div className="sidebar-section">
          <p className="section-label">MENU</p>

          <button
            className={`nav-item ${
              page === "dashboard" ? "active" : ""
            }`}
            onClick={() => handleNavigation("dashboard")}
          >
            <span className="nav-icon">⌂</span>
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-item ${
              page === "result" ? "active" : ""
            }`}
            onClick={() => handleNavigation("result")}
          >
            <span className="nav-icon">◉</span>
            <span>Predict Age</span>
          </button>

          <button
            className={`nav-item ${
              page === "how" ? "active" : ""
            }`}
            onClick={() => handleNavigation("how")}
          >
            <span className="nav-icon">?</span>
            <span>How It Works</span>
          </button>
        </div>

        <div className="sidebar-bottom">
          <div className="ai-status">
            <div className="status-dot"></div>

            <div>
              <strong>AI System</strong>
              <span>Ready for prediction</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main-content">

        {/* TOPBAR */}
        <header className="topbar">

          <div>
            <span className="breadcrumb">
              AGE AI /{" "}
              {page === "dashboard"
                ? "Dashboard"
                : page === "result"
                ? "Prediction"
                : "How It Works"}
            </span>

            <h1>
              {page === "dashboard"
                ? "Age Prediction"
                : page === "result"
                ? "Prediction Result"
                : "How It Works"}
            </h1>
          </div>
          <button className="theme-toggle" onClick={toggleTheme}> 
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <div className="topbar-right">
            <div className="system-status">
              <span className="online-dot"></span>
              System Online
            </div>

            <button className="notification-btn">
              ♧
              <span></span>
            </button>
          </div>

        </header>

        {/* CONTENT */}
        {page === "dashboard" && (
  <Dashboard
  onImageUpload={handleImageUpload}
  onDrop={handleDrop}
  onDragOver={handleDragOver}
  cameraOpen={cameraOpen}
  videoRef={videoRef}
  onOpenCamera={openCamera}
  onCloseCamera={closeCamera}
  onCapturePhoto={capturePhoto}
/>
)}

        {page === "result" && (
          <PredictionResult
            image={image}
            fileName={fileName}
            prediction={prediction}
            loading={loading}
            error={error}
            onPredict={handlePredict}
            onPredictAgain={() => {
              setPrediction(null);
              setPage("dashboard");
            }}
          />
        )}

        {page === "how" && <HowItWorks />}

      </main>
    </div>
  );
}


/* ============================
   DASHBOARD
============================ */

function Dashboard({
  onImageUpload,
  onDrop,
  onDragOver,
  cameraOpen,
  videoRef,
  onOpenCamera,
  onCloseCamera,
  onCapturePhoto,
}) {
  return (
    <section className="page-container">

      <div className="hero-section">

        <div className="hero-content">

          <span className="eyebrow">
            AI-POWERED ANALYSIS
          </span>

          <h2>
            Discover the age
            <br />
            <span>your face reveals.</span>
          </h2>

          <p>
            Upload a clear facial image and let our AI
            estimate your age using advanced image
            analysis technology.
          </p>

        </div>

        {/* VISUAL-ONLY FACE SCANNER ANIMATION */}
        <FaceScanner />

      </div>


      {/* UPLOAD CARD */}

      <div className="glass-card upload-card">

        <div className="card-header">

          <div>
            <h3>Upload Your Image</h3>

            <p>
              Choose a clear, front-facing image for
              better prediction accuracy.
            </p>
          </div>

          <div className="card-badge">
            JPG · PNG
          </div>

        </div>


        {cameraOpen ? (
  <div className="camera-area">

    <div className="camera-status">
      <span className="camera-status-dot"></span>
      CAMERA ACTIVE
      <span className="camera-live">LIVE</span>
    </div>

    <div className="camera-preview">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
      />

      <div className="camera-overlay">
        <span className="camera-corner top-left"></span>
        <span className="camera-corner top-right"></span>
        <span className="camera-corner bottom-left"></span>
        <span className="camera-corner bottom-right"></span>

        <div className="camera-scan-line"></div>

        <div className="camera-label">
          <span></span>
          FACE ANALYSIS
        </div>
      </div>
    </div>

    <div className="camera-actions">

      <button
        type="button"
        className="camera-capture-button"
        onClick={onCapturePhoto}
      >
        <span>📸</span>
        Capture Photo
      </button>

      <button
        type="button"
        className="camera-close-button"
        onClick={onCloseCamera}
      >
        ✕ Close Camera
      </button>

    </div>

  </div>
) : (
  <>
    <label
      className="upload-area"
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragEnter={onDragOver}
    >
      <input
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        onChange={onImageUpload}
      />

      <div className="upload-circle">
        ↑
      </div>

      <h4>
        Drag & drop your image here
      </h4>

      <p>
        or click to browse from your device
      </p>

      <span className="browse-button">
        Choose Image
      </span>

      <small>
        Maximum file size: 5 MB
      </small>
    </label>

    <div className="camera-divider">
      <span></span>
      OR
      <span></span>
    </div>

    <button
      type="button"
      className="open-camera-button"
      onClick={onOpenCamera}
    >
      <span>📷</span>
      Use Your Camera
    </button>
  </>
)}

      </div>


      {/* HOW IT WORKS */}

      <div className="section-title">
        <div>
          <span className="eyebrow">
            SIMPLE PROCESS
          </span>

          <h3>
            How age prediction works
          </h3>
        </div>
      </div>


      <div className="process-grid">

        <ProcessCard
          number="01"
          icon="↑"
          title="Upload Image"
          description="Upload a clear facial image in JPG or PNG format."
        />

        <ProcessCard
          number="02"
          icon="AI"
          title="AI Analysis"
          description="The AI model analyzes facial features and visual patterns."
        />

        <ProcessCard
          number="03"
          icon="✓"
          title="Get Prediction"
          description="Receive an estimated age with a confidence score."
        />

      </div>

    </section>
  );
}


/* ============================
   FACE SCANNER — VISUAL ONLY
   No upload/predict logic is changed.
============================ */

function FaceScanner() {
  return (
    <div className="face-scanner" aria-hidden="true">
      <div className="scanner-corner scanner-corner-tl"></div>
      <div className="scanner-corner scanner-corner-tr"></div>
      <div className="scanner-corner scanner-corner-bl"></div>
      <div className="scanner-corner scanner-corner-br"></div>

      <div className="scanner-label">
        <span className="scanner-label-dot"></span>
        FACIAL ANALYSIS
      </div>

      <div className="scanner-face">
        <div className="scanner-eye scanner-eye-left">
          <span></span>
        </div>
        <div className="scanner-eye scanner-eye-right">
          <span></span>
        </div>
        <div className="scanner-nose"></div>
        <div className="scanner-mouth"></div>

        <i className="landmark landmark-1"></i>
        <i className="landmark landmark-2"></i>
        <i className="landmark landmark-3"></i>
        <i className="landmark landmark-4"></i>
        <i className="landmark landmark-5"></i>
        <i className="landmark landmark-6"></i>
        <i className="landmark landmark-7"></i>
      </div>

      <div className="scanner-line"></div>

      <div className="scanner-float scanner-float-face">
        <span className="float-dot"></span>
        FACE DETECTED
      </div>

      <div className="scanner-float scanner-float-features">
        <span>✦</span>
        FACIAL FEATURES
      </div>

      <div className="scanner-footer">
        <span><b></b> FACE DETECTED</span>
        <span><em>✦</em> READY TO ANALYZE</span>
      </div>
    </div>
  );
}


/* ============================
   PROCESS CARD
============================ */

function ProcessCard({
  number,
  icon,
  title,
  description,
}) {
  return (
    <div className="glass-card process-card">

      <div className="process-top">

        <span className="process-number">
          {number}
        </span>

        <div className="process-icon">
          {icon}
        </div>

      </div>

      <h4>{title}</h4>

      <p>{description}</p>

    </div>
  );
}


/* ============================
   RESULT
============================ */

function PredictionResult({
  image,
  fileName,
  prediction,
  loading,
  error,
  onPredict,
  onPredictAgain,
}) {
  const ageText = prediction ? prediction.age : "--";
  const minAge = prediction ? prediction.minAge : 0;
  const maxAge = prediction ? prediction.maxAge : 0;
  const confidence = prediction ? prediction.confidence : 0;
  const confidencePercent = `${Math.round(confidence)}%`;

  return (
    <section className="page-container">

      {/* Privacy Banner */}
      <div className="privacy-banner">
        <span className="privacy-icon">🔒</span>
        <p>
          We respect your privacy. Photos are processed instantly and never stored
          or shared.
        </p>
      </div>

      <div className="glass-card result-card">

        <div className="result-image-wrapper">
  {image ? (
    <div className="scan-preview">
      <img src={image} alt="Uploaded face" className="scan-image" />

      {/* Scanner overlay */}
      <div className="scan-overlay">
  <div className="scan-frame">
    <span className="scan-corner tl"></span>
    <span className="scan-corner tr"></span>
    <span className="scan-corner bl"></span>
    <span className="scan-corner br"></span>

    <div className="scan-line-overlay"></div>
    <div className="scan-grid"></div>

    <div className="scan-label-overlay">
      <span className="scan-dot"></span>
      FACIAL ANALYSIS
    </div>
  </div>
</div>
    </div>
  ) : (
    <div className="image-placeholder">
      <span>◉</span>
      <p>No image selected</p>
    </div>
  )}
</div>


        <div className="result-content">

          <span className="eyebrow">
            AI PREDICTION
          </span>

          <h2>
            Estimated Age
          </h2>

          <div className="age-value">
            {ageText}
            <span>years</span>
          </div>

          <div className="age-range">
            Estimated range:
            <strong>
              {prediction ? `${minAge} – ${maxAge} years` : "Waiting for prediction"}
            </strong>
          </div>


          <div className="confidence">

            <div className="confidence-header">
              <span>Confidence Score</span>
              <strong>{prediction ? confidencePercent : "0%"}</strong>
            </div>

            <div className="progress-track">
              <div
                className="progress-bar"
                style={{ width: prediction ? `${Math.min(confidence, 100)}%` : "0%" }}
              ></div>
            </div>

          </div>


          <div className="result-file">
            <span>Image</span>
            <strong>
              {fileName || "uploaded-image.jpg"}
            </strong>
          </div>

          {error && (
            <div className="error-box" style={{ color: "#ff6b6b", marginBottom: "12px" }}>
              {error}
            </div>
          )}

          <button
            className="primary-button"
            onClick={onPredict}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Get Prediction"}
            <span>→</span>
          </button>

          <button
            className="secondary-button"
            onClick={onPredictAgain}
            style={{ marginTop: "12px", width: "100%" }}
          >
            Predict Another Image
          </button>

        </div>

      </div>

    </section>
  );
}


/* ============================
   HOW IT WORKS
============================ */

function HowItWorks() {
  return (
    <section className="page-container">

      <div className="glass-card how-page">

        <span className="eyebrow">
          THE PROCESS
        </span>

        <h2>
          How does AGE AI work?
        </h2>

        <p className="how-description">
          AGE AI takes a facial image, identifies the face,
          studies important visual features, and then uses the
          trained AI model to estimate the person's age.
        </p>

        <div className="how-flow-note">
          <span className="how-flow-dot"></span>
          <p>
            For better results, use a clear, front-facing image with good lighting
            and minimum blur.
          </p>
        </div>

        <div className="how-steps how-steps-four">

          <div>
            <span>01</span>
            <div className="how-step-icon">↑</div>
            <h3>Upload Image</h3>
            <p>
              Choose a JPG or PNG facial image from your device.
            </p>
          </div>

          <div>
            <span>02</span>
            <div className="how-step-icon">◎</div>
            <h3>Face Detection</h3>
            <p>
              The system detects and focuses on the facial region in the image.
            </p>
          </div>

          <div>
            <span>03</span>
            <div className="how-step-icon">AI</div>
            <h3>Feature Analysis</h3>
            <p>
              The AI examines facial patterns and age-related visual features.
            </p>
          </div>

          <div>
            <span>04</span>
            <div className="how-step-icon">✓</div>
            <h3>Age Prediction</h3>
            <p>
              The model returns the estimated age, age range, and confidence score.
            </p>
          </div>

        </div>


      </div>

    </section>
  );
}

export default App;