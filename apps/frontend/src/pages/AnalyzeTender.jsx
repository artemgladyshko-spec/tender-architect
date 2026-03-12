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

const FILE_EXTENSIONS = new Set([".pdf", ".docx"]);
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

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

const getFileExtension = (name = "") => {
  const dotIndex = name.lastIndexOf(".");

  if (dotIndex === -1) {
    return "";
  }

  return name.slice(dotIndex).toLowerCase();
};

const isSupportedFile = (selectedFile) => {
  if (!selectedFile) {
    return false;
  }

  const extension = getFileExtension(selectedFile.name);
  const mimeType = (selectedFile.type || "").toLowerCase();

  return FILE_EXTENSIONS.has(extension) || FILE_TYPES.includes(mimeType);
};

const mapPipelineStatusToSteps = (steps = {}) =>
  PIPELINE_STEPS.map((step) => ({
    ...step,
    status: steps[step.id] || "pending",
  }));

const mapResultPipelineStatusToSteps = (pipelineStatus = []) => {
  const mappedSteps = createInitialSteps();

  pipelineStatus.forEach((entry) => {
    switch (entry.step) {
      case "analyzerAgent":
        mappedSteps[0].status = entry.status;
        mappedSteps[1].status = entry.status;
        mappedSteps[2].status = entry.status;
        break;
      case "pbsGenerator":
        mappedSteps[3].status = entry.status;
        break;
      case "architectAgent":
        mappedSteps[4].status = entry.status;
        mappedSteps[5].status = entry.status;
        mappedSteps[6].status = entry.status;
        mappedSteps[7].status = entry.status;
        break;
      case "traceabilityMapper":
        mappedSteps[8].status = entry.status;
        break;
      case "estimatorAgent":
        mappedSteps[9].status = entry.status;
        break;
      case "projectManagerAgent":
        mappedSteps[10].status = entry.status;
        break;
      case "proposalAgent":
        mappedSteps[11].status = entry.status;
        break;
      case "pipeline":
        if (entry.status === "failed") {
          const runningStep = mappedSteps.find((step) => step.status === "running");

          if (runningStep) {
            runningStep.status = "failed";
          }
        }
        break;
      default:
        break;
    }
  });

  return mappedSteps;
};

export default function AnalyzeTender() {
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState("");
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [analysisStatus, setAnalysisStatus] = useState("idle");
  const [pipelineSteps, setPipelineSteps] = useState(createInitialSteps);
  const [analysisRunning, setAnalysisRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [uploadErrorMessage, setUploadErrorMessage] = useState("");
  const [analysisErrorMessage, setAnalysisErrorMessage] = useState("");
  const [backendStatus, setBackendStatus] = useState("checking");
  const [backendStatusMessage, setBackendStatusMessage] = useState("");
  const [aiMode, setAiMode] = useState("unknown");

  const getErrorMessage = (payload, fallbackMessage) => {
    if (!payload) {
      return fallbackMessage;
    }

    if (typeof payload.error === "string") {
      return payload.error;
    }

    if (typeof payload.error?.message === "string") {
      return payload.error.message;
    }

    if (typeof payload.message === "string") {
      return payload.message;
    }

    return fallbackMessage;
  };

  const parseJsonResponse = async (response) => {
    const rawText = await response.text();

    if (!rawText) {
      return null;
    }

    try {
      return JSON.parse(rawText);
    } catch (error) {
      console.error("Failed to parse JSON response", error);
      throw new Error("Server returned an invalid response.");
    }
  };

  const getBackendFallbackMessage = (statusPayload) => {
    if (statusPayload?.status === "offline") {
      return (
        statusPayload.details ||
        statusPayload.message ||
        `Offline at ${API_BASE_URL}`
      );
    }

    return `Offline at ${API_BASE_URL}`;
  };

  useEffect(() => {
    let cancelled = false;

    const checkBackendHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/health`, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Backend health check failed");
        }

        const data = await parseJsonResponse(response);

        if (!cancelled) {
          setBackendStatus("online");
          setBackendStatusMessage(`Connected to ${API_BASE_URL}`);
          setAiMode(data?.aiMode || "live");
        }
      } catch (error) {
        console.error(error);

        try {
          const statusResponse = await fetch("/backend-status.json", {
            method: "GET",
            cache: "no-store",
          });
          const statusPayload = await parseJsonResponse(statusResponse);

          if (!cancelled) {
            setBackendStatus("offline");
            setBackendStatusMessage(getBackendFallbackMessage(statusPayload));
            setAiMode("unknown");
          }
        } catch (statusError) {
          console.error(statusError);

          if (!cancelled) {
            setBackendStatus("offline");
            setBackendStatusMessage(`Offline at ${API_BASE_URL}`);
            setAiMode("unknown");
          }
        }
      }
    };

    checkBackendHealth();
    const intervalId = window.setInterval(checkBackendHealth, 2000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!analysisRunning) {
      return undefined;
    }

    let cancelled = false;

    const pollPipelineStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/pipeline-status`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Pipeline status request failed");
        }

        const data = await parseJsonResponse(response);

        if (cancelled || !data) {
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

    if (!isSupportedFile(selectedFile)) {
      setFile(null);
      setFilename("");
      setUploadStatus("error");
      setUploadErrorMessage("Only PDF and DOCX files are supported.");
      setAnalysisStatus("idle");
      setAnalysisErrorMessage("");
      setPipelineSteps(createInitialSteps());
      setResult(null);
      return;
    }

    setFile(selectedFile);
    setFilename("");
    setUploadStatus("selected");
    setUploadErrorMessage("");
    setAnalysisStatus("idle");
    setAnalysisErrorMessage("");
    setPipelineSteps(createInitialSteps());
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      return;
    }

    setUploadStatus("uploading");
    setUploadErrorMessage("");
    setAnalysisStatus("idle");
    setAnalysisErrorMessage("");
    setPipelineSteps(createInitialSteps());
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload-tor`, {
        method: "POST",
        body: formData,
      });

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Upload failed"));
      }

      setFilename(data?.filename || "");
      setUploadStatus("uploaded");
    } catch (error) {
      console.error(error);
      setUploadStatus("error");
      setUploadErrorMessage(error.message || "Upload failed");
    }
  };

  const handleRunAnalysis = async () => {
    if (!filename) {
      return;
    }

    setAnalysisRunning(true);
    setAnalysisStatus("running");
    setAnalysisErrorMessage("");
    setResult(null);
    setPipelineSteps(
      PIPELINE_STEPS.map((step, index) => ({
        ...step,
        status: index === 0 ? "running" : "pending",
      })),
    );

    try {
      const response = await fetch(`${API_BASE_URL}/run-analysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename }),
      });

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Analysis failed"));
      }

      const nextResult = data.result || data.results;
      setResult(nextResult);

      if (Array.isArray(nextResult?.pipelineStatus)) {
        setPipelineSteps(mapResultPipelineStatusToSteps(nextResult.pipelineStatus));
      }

      setAnalysisRunning(false);
      setAnalysisStatus("completed");
    } catch (error) {
      console.error(error);
      setAnalysisRunning(false);
      setAnalysisStatus("error");
      setAnalysisErrorMessage(error.message || "Analysis failed");
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
        type: file.type || "unknown",
        extension: getFileExtension(file.name) || "unknown",
      }
    : null;

  const uploadMessageMap = {
    idle: "Select a PDF or DOCX file to start.",
    selected: "File selected. Upload it to prepare the pipeline.",
    uploading: "Uploading tender document...",
    uploaded: "Upload finished. Analysis can now be started.",
    error: uploadErrorMessage || "Upload failed.",
  };

  const analysisMessageMap = {
    idle: "Run analysis after the upload completes.",
    running: "The AI pipeline is processing the tender documentation.",
    completed: "Analysis finished successfully.",
    error: analysisErrorMessage || "Analysis failed. Check the backend and try again.",
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
          <div className={`health-banner ${backendStatus}`}>
            <strong>Backend:</strong>{" "}
            {backendStatus === "online"
              ? backendStatusMessage
              : backendStatus === "offline"
                ? backendStatusMessage || `Offline at ${API_BASE_URL}`
                : `Checking ${API_BASE_URL}`}
          </div>
          <div className={`mode-banner ${aiMode}`}>
            <strong>AI Mode:</strong>{" "}
            {aiMode === "mock"
              ? "Mock"
              : aiMode === "live"
                ? "Live"
                : "Unknown"}
          </div>
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

        <DownloadPanel
          apiBaseUrl={API_BASE_URL}
          isReady={isPipelineComplete}
        />
      </div>
    </main>
  );
}
