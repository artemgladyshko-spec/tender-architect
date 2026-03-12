import { useEffect, useMemo, useState } from "react";
import DownloadPanel from "../components/DownloadPanel";
import FileDropZone from "../components/FileDropZone";
import PipelineStatus from "../components/PipelineStatus";
import ProposalPipelineStatus from "../components/ProposalPipelineStatus";
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
    label: "Analysis Generation",
    status: "pending",
  },
];

const PROPOSAL_STEPS = [
  {
    id: "general_information",
    label: "General Information",
    status: "pending",
  },
  {
    id: "business_processes",
    label: "Business Processes",
    status: "pending",
  },
  {
    id: "system_requirements",
    label: "System Requirements",
    status: "pending",
  },
  {
    id: "architecture_solution",
    label: "Architecture Solution",
    status: "pending",
  },
  {
    id: "implementation_plan",
    label: "Implementation Plan",
    status: "pending",
  },
  {
    id: "acceptance_process",
    label: "Acceptance Procedure",
    status: "pending",
  },
  {
    id: "deployment_requirements",
    label: "Deployment Requirements",
    status: "pending",
  },
  {
    id: "documentation_requirements",
    label: "Documentation Requirements",
    status: "pending",
  },
];

const PROPOSAL_LANGUAGES = [
  { value: "ua", label: "Ukrainian" },
  { value: "en", label: "English" },
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

const createInitialProposalSteps = () =>
  PROPOSAL_STEPS.map((step) => ({
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

const mapProposalStatusToSteps = (steps = {}) =>
  PROPOSAL_STEPS.map((step) => ({
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
  const [proposalSteps, setProposalSteps] = useState(createInitialProposalSteps);
  const [proposalRunning, setProposalRunning] = useState(false);
  const [proposalStatus, setProposalStatus] = useState("idle");
  const [proposalErrorMessage, setProposalErrorMessage] = useState("");
  const [proposalResult, setProposalResult] = useState(null);
  const [proposalLanguage, setProposalLanguage] = useState("ua");
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
        const analysisCompleted = nextPipelineSteps.some(
          (step) =>
            step.id === "proposal_generation" && step.status === "completed",
        );

        if (hasFailedStep) {
          setAnalysisRunning(false);
          setAnalysisStatus("error");
        } else if (analysisCompleted) {
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

  useEffect(() => {
    if (!proposalRunning) {
      return undefined;
    }

    let cancelled = false;

    const pollProposalStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/proposal-pipeline-status`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Proposal pipeline status request failed");
        }

        const data = await parseJsonResponse(response);

        if (cancelled || !data) {
          return;
        }

        const nextProposalSteps = mapProposalStatusToSteps(data.steps);
        setProposalSteps(nextProposalSteps);

        const hasFailedStep = nextProposalSteps.some(
          (step) => step.status === "failed",
        );
        const allCompleted = nextProposalSteps.every(
          (step) => step.status === "completed",
        );

        if (hasFailedStep) {
          setProposalRunning(false);
          setProposalStatus("error");
        } else if (allCompleted) {
          setProposalRunning(false);
          setProposalStatus("completed");
        }
      } catch (error) {
        console.error(error);
      }
    };

    pollProposalStatus();
    const intervalId = window.setInterval(pollProposalStatus, 2000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [proposalRunning]);

  const resetProposalState = () => {
    setProposalSteps(createInitialProposalSteps());
    setProposalStatus("idle");
    setProposalErrorMessage("");
    setProposalResult(null);
  };

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
      resetProposalState();
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
    resetProposalState();
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
    resetProposalState();
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
    resetProposalState();
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

  const handleGenerateProposal = async () => {
    if (!result) {
      return;
    }

    setProposalRunning(true);
    setProposalStatus("running");
    setProposalErrorMessage("");
    setProposalResult(null);
    setProposalSteps(
      PROPOSAL_STEPS.map((step, index) => ({
        ...step,
        status: index === 0 ? "running" : "pending",
      })),
    );

    try {
      const response = await fetch(`${API_BASE_URL}/generate-proposal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename,
          language: proposalLanguage,
          analysisResults: result,
        }),
      });

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Technical proposal generation failed"),
        );
      }

      setProposalResult(data?.results || null);
      setProposalSteps(
        PROPOSAL_STEPS.map((step) => ({
          ...step,
          status: "completed",
        })),
      );
      setProposalRunning(false);
      setProposalStatus("completed");
    } catch (error) {
      console.error(error);
      setProposalRunning(false);
      setProposalStatus("error");
      setProposalErrorMessage(
        error.message || "Technical proposal generation failed",
      );
      setProposalSteps((currentSteps) =>
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
    error:
      analysisErrorMessage || "Analysis failed. Check the backend and try again.",
  };

  const proposalMessageMap = {
    idle: "Generate the technical proposal after analysis completes.",
    running: `The proposal pipeline is generating the final document in ${proposalLanguage.toUpperCase()}.`,
    completed: `Technical proposal generated successfully in ${proposalLanguage.toUpperCase()}.`,
    error:
      proposalErrorMessage ||
      "Technical proposal generation failed. Check the backend and try again.",
  };

  const statusTone =
    uploadStatus === "error" ||
    analysisStatus === "error" ||
    proposalStatus === "error"
      ? "error"
      : "neutral";

  const isProposalComplete = useMemo(
    () =>
      proposalSteps.every((step) => step.status === "completed") &&
      proposalStatus === "completed",
    [proposalSteps, proposalStatus],
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
            {aiMode === "mock" ? "Mock" : aiMode === "live" ? "Live" : "Unknown"}
          </div>
        </header>

        <div className="workspace-grid">
          <div className="workspace-column workspace-column-left">
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
                  <p>Upload the document, run analysis, then generate the proposal.</p>
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
                  disabled={
                    uploadStatus !== "uploaded" || analysisStatus === "running"
                  }
                >
                  {analysisStatus === "running" ? "Running..." : "Run Analysis"}
                </button>

                <button
                  className="secondary-button"
                  type="button"
                  onClick={handleGenerateProposal}
                  disabled={
                    analysisStatus !== "completed" ||
                    proposalStatus === "running" ||
                    !result
                  }
                >
                  {proposalStatus === "running"
                    ? "Generating Proposal..."
                    : "Generate Technical Proposal"}
                </button>
              </div>

              <div className="inline-control-row">
                <label className="inline-field" htmlFor="proposal-language">
                  Proposal Language
                </label>
                <select
                  id="proposal-language"
                  className="inline-select"
                  value={proposalLanguage}
                  onChange={(event) => setProposalLanguage(event.target.value)}
                  disabled={proposalStatus === "running"}
                >
                  {PROPOSAL_LANGUAGES.map((language) => (
                    <option key={language.value} value={language.value}>
                      {language.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={`status-banner ${statusTone}`}>
                <strong>Upload:</strong> {uploadMessageMap[uploadStatus]}
                <br />
                <strong>Analysis:</strong> {analysisMessageMap[analysisStatus]}
                <br />
                <strong>Proposal:</strong> {proposalMessageMap[proposalStatus]}
              </div>
            </section>

            <section className="panel">
              <ResultsViewer result={result} />
            </section>
          </div>

          <div className="workspace-column workspace-column-right">
            <section className="panel">
              <PipelineStatus pipelineSteps={pipelineSteps} />
            </section>

            <section className="panel">
              <ProposalPipelineStatus proposalSteps={proposalSteps} />
            </section>

            <section className="panel">
              <div className="subpanel">
                <div className="section-heading compact">
                  <div>
                    <h2>Proposal Output</h2>
                    <p>
                      Generate the final technical proposal after the analysis
                      artifacts are ready.
                    </p>
                  </div>
                </div>

                <div className="empty-state">
                  <strong>
                    {proposalResult
                      ? "Proposal sections generated."
                      : "Technical proposal not generated yet."}
                  </strong>
                  <p>
                    {proposalResult
                      ? `The proposal markdown and DOCX are ready for download in ${
                          proposalResult.language?.toUpperCase() ||
                          proposalLanguage.toUpperCase()
                        }.`
                      : "Run the proposal pipeline to prepare the final technical proposal."}
                  </p>
                </div>
              </div>
            </section>

            <DownloadPanel
              apiBaseUrl={API_BASE_URL}
              isAnalysisReady={analysisStatus === "completed" && Boolean(result)}
              isProposalReady={isProposalComplete}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
