import { useState } from "react";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("home");

  const goTo = (page) => {
    setActivePage(page);
  };

  return (
    <div className="app">

      {/* Background */}
      <div className="grid-bg"></div>
      <div className="orb orb-one"></div>
      <div className="orb orb-two"></div>


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="sidebar">

        {/* Logo */}
        <div
          className="logo"
          onClick={() => goTo("home")}
        >
          <div className="logo-mark">
            <span>✦</span>
          </div>

          <div className="logo-text">
            <h2>
              Age<span>Lens</span>
            </h2>

            <p>FACIAL INTELLIGENCE</p>
          </div>
        </div>


        {/* Navigation */}
        <nav className="sidebar-menu">

          <p className="menu-title">
            NAVIGATION
          </p>

          <button
            className={
              activePage === "home"
                ? "side-active"
                : ""
            }
            onClick={() => goTo("home")}
          >
            <span className="side-icon">⌂</span>
            <span>Home</span>
          </button>


          <button
            className={
              activePage === "analyze"
                ? "side-active"
                : ""
            }
            onClick={() => goTo("analyze")}
          >
            <span className="side-icon">◉</span>
            <span>Analyze</span>
          </button>


          <button
            className={
              activePage === "how"
                ? "side-active"
                : ""
            }
            onClick={() => goTo("how")}
          >
            <span className="side-icon">?</span>
            <span>How it works</span>
          </button>

        </nav>


        {/* Bottom status */}
        <div className="sidebar-bottom">

          <div className="ai-status">
            <span></span>

            <div>
              <strong>AI SYSTEM</strong>
              <small>Ready to analyze</small>
            </div>
          </div>

          <div className="version">
            AGELENS v1.0
          </div>

        </div>

      </aside>


      {/* =====================================================
          HOME PAGE
      ===================================================== */}

      {activePage === "home" && (

        <main className="home">

          <section className="hero">

            {/* LEFT SIDE */}

            <div className="hero-left">

              <div className="eyebrow">
                <span></span>
                AI-POWERED FACIAL ANALYSIS
              </div>


              <h1>
                How old do you
                <br />
                <em>really look?</em>
              </h1>


              <p>
                Discover your AI-estimated apparent age
                through intelligent facial analysis.
                Upload a clear face image and let
                AgeLens analyze your facial features.
              </p>


              <button
                className="primary-btn"
                onClick={() => goTo("analyze")}
              >
                Start Analysis
                <b>→</b>
              </button>


              {/* Stats */}

              <div className="mini-stats">

                <div>
                  <strong>AI</strong>
                  <span>VISION</span>
                </div>

                <div>
                  <strong>AGE</strong>
                  <span>ESTIMATION</span>
                </div>

                <div>
                  <strong>FAST</strong>
                  <span>ANALYSIS</span>
                </div>

              </div>

            </div>


            {/* =================================================
                RIGHT SIDE — FACIAL SCAN VISUAL
            ================================================= */}

            <div className="hero-right">

              <div className="face-visual">

                <div className="scan-frame">

                  {/* Corner decorations */}

                  <span className="corner top-left"></span>
                  <span className="corner top-right"></span>
                  <span className="corner bottom-left"></span>
                  <span className="corner bottom-right"></span>


                  {/* Top label */}

                  <div className="visual-label">

                    <span className="status-dot"></span>

                    FACIAL ANALYSIS

                  </div>


                  {/* Face */}

                  <div className="face-outline">

                    <div className="face-head">

                      {/* Eyes */}

                      <div className="eye eye-left">
                        <span></span>
                      </div>

                      <div className="eye eye-right">
                        <span></span>
                      </div>


                      {/* Nose */}

                      <div className="nose"></div>


                      {/* Mouth */}

                      <div className="mouth"></div>


                      {/* Facial landmark points */}

                      <span className="face-point point-1"></span>
                      <span className="face-point point-2"></span>
                      <span className="face-point point-3"></span>
                      <span className="face-point point-4"></span>
                      <span className="face-point point-5"></span>
                      <span className="face-point point-6"></span>

                    </div>


                    {/* Scanning line */}

                    <div className="face-scan-line"></div>

                  </div>


                  {/* Bottom status */}

                  <div className="visual-status">

                    <div>
                      <span className="green-dot"></span>
                      FACE DETECTED
                    </div>

                    <div>
                      <span className="star">✦</span>
                      READY TO ESTIMATE
                    </div>

                  </div>

                </div>


                {/* Floating cards */}

                <div className="floating-card face-card">

                  <span>01</span>
                  FACE DETECTED

                </div>


                <div className="floating-card feature-card">

                  <span>✦</span>
                  FACIAL FEATURES

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              FEATURE STRIP
          ================================================= */}

          <section className="feature-strip">

            <div>

              <div className="feature-icon">
                ◉
              </div>

              <div>
                <strong>Face Detection</strong>
                <small>
                  Identify facial regions
                </small>
              </div>

            </div>


            <div>

              <div className="feature-icon">
                ✦
              </div>

              <div>
                <strong>AI Analysis</strong>
                <small>
                  Analyze facial features
                </small>
              </div>

            </div>


            <div>

              <div className="feature-icon">
                ◌
              </div>

              <div>
                <strong>Age Estimation</strong>
                <small>
                  Get an estimated age
                </small>
              </div>

            </div>

          </section>

        </main>

      )}


      {/* =====================================================
          ANALYZE PAGE
      ===================================================== */}

      {activePage === "analyze" && (

        <AnalyzePage />

      )}


      {/* =====================================================
          HOW IT WORKS PAGE
      ===================================================== */}

      {activePage === "how" && (

        <HowItWorksPage />

      )}

    </div>
  );
}


/* =========================================================
   ANALYZE PAGE COMPONENT
========================================================= */

function AnalyzePage() {

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);


  const handleImage = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    setImage(file);

    setPreview(URL.createObjectURL(file));

    setResult(null);

  };


  const analyzeImage = () => {

    if (!image) {
      alert("Please upload an image first.");
      return;
    }


    setLoading(true);


    /*
      DEMO ONLY

      Later this part will be replaced
      with backend API call.
    */

    setTimeout(() => {

      setResult({
        age: 24,
        confidence: 91,
        range: "22 – 26"
      });

      setLoading(false);

    }, 2000);

  };


  return (

    <main className="analyze-page">

      <section className="section-heading">

        <div className="eyebrow">
          <span></span>
          AI FACIAL ANALYSIS
        </div>

        <h2>
          Analyze your <em>face.</em>
        </h2>

        <p>
          Upload a clear front-facing image to estimate
          apparent age.
        </p>

      </section>


      {!result ? (

        <div className="analyze-layout">

          {/* Upload */}

          <div>

            {!preview ? (

              <label className="upload-box">

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                />

                <div className="upload-icon">
                  ↑
                </div>

                <h3>
                  Upload your photo
                </h3>

                <p>
                  Drag & drop or select an image
                </p>

                <span className="browse">
                  Browse Image
                </span>

                <small>
                  JPG · PNG · WEBP
                </small>

              </label>

            ) : (

              <div className="image-preview">

                <img
                  src={preview}
                  alt="Uploaded face"
                />

                {loading && (

                  <div className="ai-scan">

                    <div></div>

                    <span>
                      ANALYZING FACE...
                    </span>

                  </div>

                )}

                <div className="image-label">
                  {image?.name}
                </div>

              </div>

            )}


            {preview && !loading && (

              <button
                className="analyze-btn"
                onClick={analyzeImage}
              >
                Analyze Image
                <span>→</span>
              </button>

            )}

          </div>


          {/* Information */}

          <div className="analysis-info">

            <div className="glass-panel">

              <span className="panel-number">
                01
              </span>

              <h3>
                Clear Image
              </h3>

              <p>
                Use a well-lit image with the face
                clearly visible.
              </p>

            </div>


            <div className="glass-panel">

              <span className="panel-number">
                02
              </span>

              <h3>
                Face Detection
              </h3>

              <p>
                The system identifies the visible
                facial region.
              </p>

            </div>


            <div className="glass-panel">

              <span className="panel-number">
                03
              </span>

              <h3>
                Age Estimation
              </h3>

              <p>
                AI estimates the apparent age from
                facial features.
              </p>

            </div>

          </div>

        </div>

      ) : (

        /* RESULT */

        <div className="result-section">

          <div className="result-image">

            <img
              src={preview}
              alt="Analyzed face"
            />

            <div className="face-tag">
              <span>●</span>
              FACE DETECTED
            </div>

            <div className="result-file">
              {image?.name}
            </div>

          </div>


          <div className="result-content">

            <span className="result-label">
              ESTIMATED APPARENT AGE
            </span>

            <h2>
              You look approximately
            </h2>


            <div className="age-result">

              <strong>
                {result.age}
              </strong>

              <span>
                years old
              </span>

            </div>


            <div className="range">

              Estimated range

              <strong>
                {result.range}
              </strong>

            </div>


            <div className="confidence-wrap">

              <div className="circle">

                <svg viewBox="0 0 100 100">

                  <circle
                    className="circle-bg"
                    cx="50"
                    cy="50"
                    r="42"
                  />

                  <circle
                    className="circle-progress"
                    cx="50"
                    cy="50"
                    r="42"
                    strokeDasharray="264"
                    strokeDashoffset={
                      264 -
                      (264 * result.confidence) / 100
                    }
                  />

                </svg>


                <div>

                  <strong>
                    {result.confidence}%
                  </strong>

                  <span>
                    CONFIDENCE
                  </span>

                </div>

              </div>


              <div>

                <h4>
                  Prediction confidence
                </h4>

                <p>
                  This value represents the model's
                  confidence in the estimated age.
                </p>

              </div>

            </div>


            <button
              className="secondary-btn"
              onClick={() => {
                setResult(null);
                setPreview(null);
                setImage(null);
              }}
            >
              Analyze another image
              <span>↗</span>
            </button>

          </div>

        </div>

      )}

    </main>

  );

}


/* =========================================================
   HOW IT WORKS
========================================================= */

function HowItWorksPage() {

  return (

    <main className="how-page">

      <section className="section-heading">

        <div className="eyebrow">
          <span></span>
          HOW IT WORKS
        </div>

        <h2>
          From photo to <em>prediction.</em>
        </h2>

        <p>
          AgeLens follows a simple AI-powered
          facial analysis workflow.
        </p>

      </section>


      <div className="process">

        <div className="process-card">

          <span>01</span>

          <div className="process-icon">
            ↑
          </div>

          <h3>
            Upload
          </h3>

          <p>
            Upload a clear front-facing image
            containing a visible face.
          </p>

        </div>


        <div className="process-line"></div>


        <div className="process-card">

          <span>02</span>

          <div className="process-icon">
            ◉
          </div>

          <h3>
            Detect & Analyze
          </h3>

          <p>
            The system detects the face and
            analyzes relevant facial features.
          </p>

        </div>


        <div className="process-line"></div>


        <div className="process-card">

          <span>03</span>

          <div className="process-icon">
            ✦
          </div>

          <h3>
            Estimate
          </h3>

          <p>
            The AI model provides an estimated
            apparent age and confidence score.
          </p>

        </div>

      </div>

    </main>

  );

}


export default App;