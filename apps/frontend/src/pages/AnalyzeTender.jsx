import { useEffect, useMemo, useState } from "react";
import DownloadPanel from "../components/DownloadPanel";
import FileDropZone from "../components/FileDropZone";
import PipelineStatus from "../components/PipelineStatus";
import ResultsViewer from "../components/ResultsViewer";

const PIPELINE_STEPS = [
  { id: "requirements", label: "Requirements Analysis", status: "pending" },
  { id: "actors", label: "Actor Detection", status: "pending" },
  {
    id: "architecture_patterns",
    label: "Architecture Patterns",
    status: "pending",
  },
  { id: "pbs", label: "PBS Generation", status: "pending" },
  { id: "domain_model", label: "Domain Model", status: "pending" },
  {
    id: "architecture_design",
    label: "Architecture Design",
    status: "pending",
  },
  { id: "database_design", label: "Database Design", status: "pending" },
  { id: "api_design", label: "API Design", status: "pending" },
  { id: "traceability", label: "Traceability Mapping", status: "pending" },
  { id: "estimation", label: "Estimation", status: "pending" },
  { id: "project_plan", label: "Project Plan", status: "pending" },
  {
    id: "proposal_generation",
    label: "Proposal Generation",
    status: "pending",
  },
];

const FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const formatBytes = (value) => {
  if (!value) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(value) / Math.log(1024)),
    units.length - 1,
  );
  const size = value / 1024 ** exponent;

  return `${size.toFixed(size >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
};

const createInitialSteps = () =>
  PIPELINE_STEPS.map((step) => ({
    ...step,
    status: "pending",
  }));

const mapPipelineStatusToSteps = (steps = {}) =>
  PIPELINE_STEPS.map((step) => ({
    ...step,
    status: steps[step.id] || "pending",
  }));

export default function AnalyzeTender() {
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState("");
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [analysisStatus, setAnalysisStatus] = useState("idle");
  const [pipelineSteps, setPipelineSteps] = useState(createInitialSteps);
  const [analysisRunning, setAnalysisRunning] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!analysisRunning) {
      return undefined;
    }

    let cancelled = false;

    const pollPipelineStatus = async () => {
      try {
        const response = await fetch("/pipeline-status", {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Pipeline status request failed");
        }

        const data = await response.json();

        if (cancelled) {
          return;
        }

        const nextPipelineSteps = mapPipelineStatusToSteps(data.steps);
        setPipelineSteps(nextPipelineSteps);

        const hasFailedStep = nextPipelineSteps.some(
          (step) => step.status === "failed",
        );
        const proposalCompleted = nextPipelineSteps.some(
          (step) =>
            step.id === "proposal_generation" && step.status === "completed",
        );

        if (hasFailedStep) {
          setAnalysisRunning(false);
          setAnalysisStatus("error");
        } else if (proposalCompleted) {
          setAnalysisRunning(false);
          setAnalysisStatus("completed");
        }
      } catch (error) {
        console.error(error);
      }
    };

    pollPipelineStatus();

    const intervalId = window.setInterval(pollPipelineStatus, 2000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [analysisRunning]);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) {
      return;
    }

    if (!FILE_TYPES.includes(selectedFile.type)) {
      setFile(null);
      setFilename("");
      setUploadStatus("error");
      setAnalysisStatus("idle");
      setPipelineSteps(createInitialSteps());
      setResult(null);
      return;
    }

    setFile(selectedFile);
    setFilename("");
    setUploadStatus("selected");
    setAnalysisStatus("idle");
    setPipelineSteps(createInitialSteps());
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      return;
    }

    setUploadStatus("uploading");
    setAnalysisStatus("idle");
    setPipelineSteps(createInitialSteps());
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/upload-tor", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setFilename(data.filename);
      setUploadStatus("uploaded");
    } catch (error) {
      console.error(error);
      setUploadStatus("error");
    }
  };

  const handleRunAnalysis = async () => {
    if (!filename) {
      return;
    }

    setAnalysisRunning(true);
    setAnalysisStatus("running");
    setResult(null);
    setPipelineSteps(
      PIPELINE_STEPS.map((step, index) => ({
        ...step,
        status: index === 0 ? "running" : "pending",
      })),
    );

    try {
      const response = await fetch("/run-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data.result || data.results);
    } catch (error) {
      console.error(error);
      setAnalysisRunning(false);
      setAnalysisStatus("error");
      setPipelineSteps((currentSteps) =>
        currentSteps.map((step) =>
          step.status === "running" ? { ...step, status: "failed" } : step,
        ),
      );
    }
  };

  const selectedFile = file
    ? {
        name: file.name,
        size: formatBytes(file.size),
      }
    : null;

  const uploadMessageMap = {
    idle: "Select a PDF or DOCX file to start.",
    selected: "File selected. Upload it to prepare the pipeline.",
    uploading: "Uploading tender document...",
    uploaded: "Upload finished. Analysis can now be started.",
    error: "Only PDF and DOCX files are supported.",
  };

  const analysisMessageMap = {
    idle: "Run analysis after the upload completes.",
    running: "The AI pipeline is processing the tender documentation.",
    completed: "Analysis finished successfully.",
    error: "Analysis failed. Check the backend and try again.",
  };

  const statusTone =
    uploadStatus === "error" || analysisStatus === "error" ? "error" : "neutral";

  const isPipelineComplete = useMemo(
    () =>
      pipelineSteps.some(
        (step) =>
          step.id === "proposal_generation" && step.status === "completed",
      ),
    [pipelineSteps],
  );

  return (
    <main className="page-shell">
      <div className="page-backdrop" />

      <div className="app-container">
        <header className="hero-card">
          <h1>Tender Architect</h1>
          <p className="hero-subtitle">
            AI-powered analysis of tender documentation
          </p>
        </header>

        <section className="panel">
          <div className="section-heading">
            <div>
              <h2>Upload Area</h2>
              <p>Upload a PDF or DOCX TOR document.</p>
            </div>
          </div>

          <FileDropZone file={selectedFile} onFileSelect={handleFileSelect} />
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <h2>Action Buttons</h2>
              <p>Upload the document first, then run the pipeline.</p>
            </div>
          </div>

          <div className="action-row">
            <button
              className="primary-button"
              type="button"
              onClick={handleUpload}
              disabled={!file || uploadStatus === "uploading"}
            >
              {uploadStatus === "uploading" ? "Uploading..." : "Upload TOR"}
            </button>

            <button
              className="secondary-button"
              type="button"
              onClick={handleRunAnalysis}
              disabled={uploadStatus !== "uploaded" || analysisStatus === "running"}
            >
              {analysisStatus === "running" ? "Running..." : "Run Analysis"}
            </button>
          </div>

          <div className={`status-banner ${statusTone}`}>
            <strong>Upload:</strong> {uploadMessageMap[uploadStatus]}
            <br />
            <strong>Analysis:</strong> {analysisMessageMap[analysisStatus]}
          </div>
        </section>

        <section className="panel panel-grid">
          <PipelineStatus pipelineSteps={pipelineSteps} />
          <ResultsViewer result={result} />
        </section>

        <DownloadPanel isReady={isPipelineComplete} />
      </div>
    </main>
  );
}
