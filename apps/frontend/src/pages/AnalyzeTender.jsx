import { useEffect, useMemo, useState } from "react";
import DownloadPanel from "../components/DownloadPanel";
import FileDropZone from "../components/FileDropZone";
import PipelineBlock from "../components/pipeline/PipelineBlock";
import StepDetailsPanel from "../components/results/StepDetailsPanel";
import {
  FILE_EXTENSIONS,
  FILE_TYPES,
  PROPOSAL_LANGUAGES,
} from "../lib/dashboardConfig";
import {
  createInitialPipelineBlocks,
  createInitialProposalSections,
  mapEntriesToPipelineBlocks,
  mapPipelineStatusPayload,
  mapProposalStatusToSections,
} from "../lib/dashboardState";
import {
  extractProposalMarkdown,
  formatBytes,
  getBackendFallbackMessage,
  getErrorMessage,
  getFileExtension,
  normalizeAiMode,
  parseJsonResponse,
} from "../lib/dashboardUtils";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

const NAV_ITEMS = [
  { id: "analysis", label: "Analysis" },
  { id: "system_design", label: "System Design" },
  { id: "document_engine", label: "Document Engine" },
  { id: "results", label: "Results" },
];

const isSupportedFile = (selectedFile) => {
  if (!selectedFile) {
    return false;
  }
  const extension = getFileExtension(selectedFile.name);
  const mimeType = (selectedFile.type || "").toLowerCase();
  return FILE_EXTENSIONS.has(extension) || FILE_TYPES.includes(mimeType);
};

const buildDocumentEngineSteps = (
  proposalSections,
  proposalStatus,
  proposalResult,
) => {
  const completedSections = proposalSections.filter(
    (section) => section.status === "completed",
  ).length;
  const hasStarted = proposalSections.some(
    (section) => section.status !== "pending",
  );
  const hasRunning = proposalSections.some(
    (section) => section.status === "running",
  );
  const hasFailed = proposalSections.some(
    (section) => section.status === "failed",
  );
  const allCompleted =
    proposalSections.length > 0 &&
    proposalSections.every((section) => section.status === "completed");

  return [
    {
      id: "section_structure_generation",
      label: "Section Structure Generation",
      status: hasStarted ? "completed" : "pending",
    },
    {
      id: "deep_content_generation",
      label: "Deep Content Generation",
      status: hasFailed
        ? "failed"
        : hasRunning
          ? "running"
          : completedSections > 0
            ? "completed"
            : "pending",
    },
    {
      id: "consistency_check",
      label: "Consistency Check",
      status:
        proposalStatus === "failed"
          ? "failed"
          : allCompleted
            ? "completed"
            : proposalStatus === "running" && completedSections > 0
              ? "running"
              : "pending",
    },
    {
      id: "final_document_build",
      label: "Final Document Build",
      status:
        proposalStatus === "failed"
          ? "failed"
          : proposalResult?.proposal || proposalStatus === "completed"
            ? "completed"
            : proposalStatus === "running" && allCompleted
              ? "running"
              : "pending",
    },
  ];
};

const toArray = (value) => (Array.isArray(value) ? value : value ? [value] : []);

const joinPreview = (items, fallback) => {
  const normalized = toArray(items)
    .flatMap((item) => toArray(item))
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }
      if (item && typeof item === "object") {
        return item.title || item.name || item.id || JSON.stringify(item);
      }
      return String(item || "");
    })
    .filter(Boolean);

  return normalized.length > 0 ? normalized.join("\n") : fallback;
};

const objectPreview = (value, fallback) => {
  if (!value) {
    return fallback;
  }
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return joinPreview(value, fallback);
  }
  return joinPreview(Object.values(value), fallback);
};

const RESULTS_STEP = {
  id: "results_overview",
  label: "Results Overview",
  status: "completed",
};

function AnalyzeTender() {
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState("");
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [analysisStatus, setAnalysisStatus] = useState("idle");
  const [pipelineBlocks, setPipelineBlocks] = useState(createInitialPipelineBlocks);
  const [analysisRunning, setAnalysisRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [proposalSections, setProposalSections] = useState(
    createInitialProposalSections,
  );
  const [proposalRunning, setProposalRunning] = useState(false);
  const [proposalStatus, setProposalStatus] = useState("idle");
  const [proposalErrorMessage, setProposalErrorMessage] = useState("");
  const [proposalResult, setProposalResult] = useState(null);
  const [proposalLanguage, setProposalLanguage] = useState("ua");
  const [uploadErrorMessage, setUploadErrorMessage] = useState("");
  const [analysisErrorMessage, setAnalysisErrorMessage] = useState("");
  const [backendStatus, setBackendStatus] = useState("checking");
  const [backendStatusMessage, setBackendStatusMessage] = useState("");
  const [aiMode, setAiMode] = useState({ id: "fallback", label: "Fallback" });
  const [activeNav, setActiveNav] = useState("analysis");
  const [expandedBlockId, setExpandedBlockId] = useState("analysis");
  const [selectedStepId, setSelectedStepId] = useState("requirements_analysis");
  const [detailsTab, setDetailsTab] = useState("view");

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
          setAiMode(normalizeAiMode(data?.aiMode));
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
            setBackendStatusMessage(
              getBackendFallbackMessage(statusPayload, API_BASE_URL),
            );
            setAiMode(normalizeAiMode(statusPayload?.aiMode));
          }
        } catch (statusError) {
          console.error(statusError);
          if (!cancelled) {
            setBackendStatus("offline");
            setBackendStatusMessage(`Offline at ${API_BASE_URL}`);
            setAiMode(normalizeAiMode("fallback"));
          }
        }
      }
    };

    checkBackendHealth();
    const intervalId = window.setInterval(checkBackendHealth, 4000);
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
        const response = await fetch(`${API_BASE_URL}/pipeline-status`);
        if (!response.ok) {
          throw new Error("Pipeline status request failed");
        }
        const data = await parseJsonResponse(response);
        if (cancelled || !data) {
          return;
        }
        const nextBlocks = mapPipelineStatusPayload(data.steps);
        setPipelineBlocks(nextBlocks);
        const trackedSteps = nextBlocks
          .filter((block) => block.id !== "document_engine")
          .flatMap((block) => block.steps);
        if (trackedSteps.some((step) => step.status === "failed")) {
          setAnalysisRunning(false);
          setAnalysisStatus("failed");
        } else if (
          trackedSteps.length &&
          trackedSteps.every((step) => step.status === "completed")
        ) {
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
        const response = await fetch(`${API_BASE_URL}/proposal-pipeline-status`);
        if (!response.ok) {
          throw new Error("Proposal pipeline status request failed");
        }
        const data = await parseJsonResponse(response);
        if (cancelled || !data) {
          return;
        }
        const nextSections = mapProposalStatusToSections(data.steps);
        setProposalSections(nextSections);
        if (nextSections.some((section) => section.status === "failed")) {
          setProposalRunning(false);
          setProposalStatus("failed");
        } else if (
          nextSections.length &&
          nextSections.every((section) => section.status === "completed")
        ) {
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
    setProposalSections(createInitialProposalSections());
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
      setUploadStatus("failed");
      setUploadErrorMessage("Only PDF and DOCX files are supported.");
      setAnalysisStatus("idle");
      setAnalysisErrorMessage("");
      setPipelineBlocks(createInitialPipelineBlocks());
      resetProposalState();
      setResult(null);
      return;
    }
    setFile(selectedFile);
    setFilename("");
    setUploadStatus("completed");
    setUploadErrorMessage("");
    setAnalysisStatus("idle");
    setAnalysisErrorMessage("");
    setPipelineBlocks(createInitialPipelineBlocks());
    resetProposalState();
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      return;
    }
    setUploadStatus("running");
    setUploadErrorMessage("");
    setAnalysisStatus("idle");
    setAnalysisErrorMessage("");
    setPipelineBlocks(createInitialPipelineBlocks());
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
      setUploadStatus("completed");
    } catch (error) {
      console.error(error);
      setUploadStatus("failed");
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
    setPipelineBlocks(createInitialPipelineBlocks());
    setActiveNav("analysis");
    setExpandedBlockId("analysis");
    setSelectedStepId("requirements_analysis");

    try {
      const response = await fetch(`${API_BASE_URL}/run-analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, language: proposalLanguage }),
      });
      const data = await parseJsonResponse(response);
      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Analysis failed"));
      }
      const nextResult = data.result || data.results;
      setResult(nextResult);
      if (Array.isArray(nextResult?.pipelineStatus)) {
        setPipelineBlocks(mapEntriesToPipelineBlocks(nextResult.pipelineStatus));
      }
      setAnalysisRunning(false);
      setAnalysisStatus("completed");
    } catch (error) {
      console.error(error);
      setAnalysisRunning(false);
      setAnalysisStatus("failed");
      setAnalysisErrorMessage(error.message || "Analysis failed");
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
    setProposalSections(createInitialProposalSections());
    setActiveNav("document_engine");
    setExpandedBlockId("document_engine");
    setSelectedStepId("section_structure_generation");

    try {
      const response = await fetch(`${API_BASE_URL}/generate-proposal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      setProposalResult(data?.results || data || null);
      setProposalSections(
        createInitialProposalSections().map((section) => ({
          ...section,
          status: "completed",
          children: section.children.map((child) => ({
            ...child,
            status: "completed",
          })),
        })),
      );
      setProposalRunning(false);
      setProposalStatus("completed");
    } catch (error) {
      console.error(error);
      setProposalRunning(false);
      setProposalStatus("failed");
      setProposalErrorMessage(
        error.message || "Technical proposal generation failed",
      );
    }
  };

  const mergedPipelineBlocks = useMemo(
    () =>
      pipelineBlocks.map((block) =>
        block.id === "document_engine"
          ? {
              ...block,
              steps: buildDocumentEngineSteps(
                proposalSections,
                proposalStatus,
                proposalResult,
              ),
            }
          : block,
      ),
    [pipelineBlocks, proposalSections, proposalStatus, proposalResult],
  );

  const selectedFile = file
    ? {
        name: file.name,
        size: formatBytes(file.size),
        type: file.type || "unknown",
        extension: getFileExtension(file.name) || "unknown",
      }
    : null;

  const uploadMessage =
    uploadStatus === "failed"
      ? uploadErrorMessage || "Upload failed."
      : uploadStatus === "running"
        ? "Uploading tender document..."
        : filename
          ? "Upload finished."
          : "Select a PDF or DOCX TOR file.";

  const analysisMessage =
    analysisStatus === "failed"
      ? analysisErrorMessage || "Analysis failed."
      : analysisStatus === "running"
        ? "Analysis and design are running."
        : analysisStatus === "completed"
          ? "Analysis completed."
          : "Analysis is idle.";

  const proposalMessage =
    proposalStatus === "failed"
      ? proposalErrorMessage || "Proposal generation failed."
      : proposalStatus === "running"
        ? "Document engine is running."
        : proposalStatus === "completed"
          ? "Proposal generated."
          : "Proposal generation is idle.";

  const totalTrackedSteps = useMemo(
    () =>
      mergedPipelineBlocks.flatMap((block) => block.steps).length +
      proposalSections.flatMap((section) => section.children).length,
    [mergedPipelineBlocks, proposalSections],
  );

  const completedTrackedSteps = useMemo(
    () =>
      mergedPipelineBlocks
        .flatMap((block) => block.steps)
        .filter((step) => step.status === "completed").length +
      proposalSections
        .flatMap((section) => section.children)
        .filter((step) => step.status === "completed").length,
    [mergedPipelineBlocks, proposalSections],
  );

  const progressPercent = totalTrackedSteps
    ? Math.round((completedTrackedSteps / totalTrackedSteps) * 100)
    : 0;

  const proposalMarkdown = extractProposalMarkdown(proposalResult);

  const resultsSummary = useMemo(
    () => ({
      analysis: {
        requirements: result?.requirements,
        actors: result?.actors,
        patterns: result?.patterns,
      },
      architecture: {
        system: result?.system,
        pbs: result?.pbs,
        dependencies: result?.dependencies,
        domainModel: result?.domainModel,
        api: result?.api,
      },
      proposal: proposalMarkdown,
      consistency:
        result?.validation?.issues ||
        proposalResult?.consistency?.issues ||
        proposalResult?.issues ||
        [],
    }),
    [proposalMarkdown, proposalResult, result],
  );

  const detailMap = useMemo(
    () => ({
      requirements_analysis: {
        title: "Requirements Analysis",
        description: "Functional extraction and analysis output.",
        sections: [
          { title: "Requirements", value: result?.requirements },
          { title: "Non-Functional", value: result?.nonFunctional },
        ],
        json: {
          requirements: result?.requirements,
          nonFunctional: result?.nonFunctional,
        },
        preview: joinPreview(
          [result?.requirements, result?.nonFunctional],
          "No requirements extracted yet.",
        ),
      },
      actor_detection: {
        title: "Actor Detection",
        description: "Detected actors and stakeholder roles.",
        sections: [{ title: "Actors", value: result?.actors }],
        json: result?.actors,
        preview: joinPreview(result?.actors, "No actors detected yet."),
      },
      contract_analysis: {
        title: "Contract Analysis",
        description: "Extracted contract constraints and milestones.",
        sections: [{ title: "Contract", value: result?.contract }],
        json: result?.contract,
        preview: objectPreview(
          result?.contract,
          "No contract analysis output yet.",
        ),
      },
      system_thinking: {
        title: "System Thinking",
        description: "System model derived from analysis inputs.",
        sections: [{ title: "System", value: result?.system }],
        json: result?.system,
        preview: joinPreview(
          [
            result?.system?.purpose,
            result?.system?.domains,
            result?.system?.services,
          ],
          "No system model built yet.",
        ),
      },
      pattern_detection: {
        title: "Pattern Detection",
        description: "Architecture patterns detected from requirements.",
        sections: [{ title: "Patterns", value: result?.patterns }],
        json: result?.patterns,
        preview: joinPreview(
          result?.patterns?.detected_patterns || result?.patterns,
          "No architecture patterns detected yet.",
        ),
      },
      pbs_generation: {
        title: "PBS Generation",
        description: "Product breakdown structure for the solution scope.",
        sections: [{ title: "PBS", value: result?.pbs }],
        json: result?.pbs,
        preview: joinPreview(
          result?.pbs?.modules || result?.pbs?.components || result?.pbs?.items,
          "No PBS generated yet.",
        ),
      },
      dependency_mapping: {
        title: "Dependency Mapping",
        description: "Cross-module and execution dependencies.",
        sections: [{ title: "Dependencies", value: result?.dependencies }],
        json: result?.dependencies,
        preview: joinPreview(
          result?.dependencies?.dependencies || result?.dependencies,
          "No dependencies mapped yet.",
        ),
      },
      domain_model: {
        title: "Domain Model",
        description: "Core entities and domain model outputs.",
        sections: [{ title: "Domain Model", value: result?.domainModel }],
        json: result?.domainModel,
        preview: joinPreview(
          result?.domainModel?.entities || result?.domainModel?.domains,
          "No domain model generated yet.",
        ),
      },
      architecture_design: {
        title: "Architecture Design",
        description: "Target architecture view and orchestration outputs.",
        sections: [
          { title: "Architecture", value: result?.architecture },
          { title: "System", value: result?.system },
        ],
        json: result?.architecture,
        preview: joinPreview(
          result?.architecture?.services || result?.architecture?.components,
          "No architecture design generated yet.",
        ),
      },
      database_design: {
        title: "Database Design",
        description: "Persistence and storage strategy.",
        sections: [{ title: "Database", value: result?.database }],
        json: result?.database,
        preview: joinPreview(
          result?.database?.databases || result?.database?.entities,
          "No database design generated yet.",
        ),
      },
      api_design: {
        title: "API Design",
        description: "Integration and API surface definition.",
        sections: [{ title: "API", value: result?.api }],
        json: result?.api,
        preview: joinPreview(
          result?.api?.integrations || result?.api?.endpoints,
          "No API design generated yet.",
        ),
      },
      validation: {
        title: "Validation",
        description: "Consistency and validation findings for the design.",
        sections: [{ title: "Validation", value: result?.validation }],
        json: result?.validation,
        preview: joinPreview(
          result?.validation?.issues || result?.validation?.findings,
          "No validation findings yet.",
        ),
      },
      section_structure_generation: {
        title: "Section Structure Generation",
        description: "Proposal section tree and structure progress.",
        sections: [{ title: "Proposal Sections", value: proposalSections }],
        json: proposalSections,
        preview: joinPreview(
          proposalSections.map((section) => `${section.label}: ${section.status}`),
          "No section structure yet.",
        ),
      },
      deep_content_generation: {
        title: "Deep Content Generation",
        description: "Generated proposal sections and markdown content.",
        sections: [{ title: "Sections", value: proposalResult?.sections }],
        json: proposalResult?.sections,
        preview: joinPreview(
          Object.entries(proposalResult?.sections || {}).map(
            ([key, value]) => `${key}: ${String(value || "").slice(0, 120)}`,
          ),
          "No proposal content generated yet.",
        ),
      },
      consistency_check: {
        title: "Consistency Check",
        description: "Proposal and architecture consistency findings.",
        sections: [
          {
            title: "Consistency Issues",
            value:
              result?.validation?.issues ||
              proposalResult?.consistency?.issues ||
              proposalResult?.issues,
          },
        ],
        json:
          result?.validation?.issues ||
          proposalResult?.consistency?.issues ||
          proposalResult?.issues,
        preview: joinPreview(
          result?.validation?.issues ||
            proposalResult?.consistency?.issues ||
            proposalResult?.issues,
          "No consistency issues reported.",
        ),
      },
      final_document_build: {
        title: "Final Document Build",
        description: "Rendered markdown and final document outputs.",
        sections: [{ title: "Proposal Markdown", value: proposalMarkdown }],
        json: proposalResult,
        preview: proposalMarkdown || "No final markdown generated yet.",
      },
      results_overview: {
        title: "Results",
        description: "Aggregated analysis, architecture, proposal, and consistency outputs.",
        sections: [
          { title: "Analysis", value: resultsSummary.analysis },
          { title: "Architecture", value: resultsSummary.architecture },
          { title: "Proposal", value: resultsSummary.proposal },
          { title: "Consistency", value: resultsSummary.consistency },
        ],
        json: resultsSummary,
        preview:
          proposalMarkdown ||
          joinPreview(
            [
              resultsSummary.analysis.requirements,
              resultsSummary.architecture.system,
              resultsSummary.consistency,
            ],
            "No results available yet.",
          ),
      },
    }),
    [proposalMarkdown, proposalResult, proposalSections, result, resultsSummary],
  );

  const selectedDetail =
    detailMap[selectedStepId] || detailMap.results_overview;

  const handleSelectStep = (blockId, step) => {
    setExpandedBlockId(blockId);
    setSelectedStepId(step.id);
    setActiveNav(blockId);
    setDetailsTab("view");
  };

  const handleSelectNav = (navId) => {
    setActiveNav(navId);
    setDetailsTab("view");

    if (navId === "results") {
      setSelectedStepId(RESULTS_STEP.id);
      return;
    }

    const targetBlock = mergedPipelineBlocks.find((block) => block.id === navId);
    if (!targetBlock) {
      return;
    }

    setExpandedBlockId(navId);
    setSelectedStepId(targetBlock.steps[0]?.id || RESULTS_STEP.id);
  };

  return (
    <main className="page-shell dashboard-page">
      <div className="page-backdrop" />
      <div className="dashboard-shell">
        <aside className="dashboard-sidebar">
          <div className="sidebar-brand">
            <h1>Tender Architect</h1>
            <p>Interactive control dashboard for the AI workflow.</p>
          </div>

          <div className="sidebar-meta">
          <div className={`health-banner ${backendStatus}`}>
            <strong>Backend:</strong> {backendStatus === "online"
              ? backendStatusMessage || "Online"
              : backendStatusMessage || "Offline"}
          </div>
            <div className={`mode-banner ${aiMode.id}`}>
              <strong>AI:</strong> {aiMode.label}
            </div>
          </div>

          <div className="sidebar-progress">
            <div className="progress-copy">
              <strong>Progress</strong>
              <span>{progressPercent}%</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <section className="sidebar-panel">
            <div className="section-heading compact">
              <div>
                <h2>Upload</h2>
                <p>{filename || "Select a TOR document."}</p>
              </div>
            </div>
            <FileDropZone file={selectedFile} onFileSelect={handleFileSelect} />
            <div className="sidebar-actions">
              <button
                className="primary-button"
                type="button"
                onClick={handleUpload}
                disabled={!file || uploadStatus === "running"}
              >
                {uploadStatus === "running" ? "Uploading..." : "Upload"}
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={handleRunAnalysis}
                disabled={
                  !filename ||
                  analysisStatus === "running" ||
                  uploadStatus === "running"
                }
              >
                Run Analysis
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
                Generate Proposal
              </button>
            </div>
            <div className="inline-control-row sidebar-language">
              <label className="inline-field" htmlFor="proposal-language">
                Language
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
            <div className="status-banner compact">
              <strong>Upload:</strong> {uploadMessage}
              <br />
              <strong>Analysis:</strong> {analysisMessage}
              <br />
              <strong>Proposal:</strong> {proposalMessage}
            </div>
          </section>

          <nav className="sidebar-nav">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`sidebar-nav-item ${activeNav === item.id ? "active" : ""}`}
                onClick={() => handleSelectNav(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="dashboard-center">
          <div className="center-header">
            <h2>Workflow</h2>
            <p>
              One phase expanded at a time. Select a step to inspect its payload
              on the right.
            </p>
          </div>
          <div className="pipeline-blocks">
            {mergedPipelineBlocks.map((block) => (
              <PipelineBlock
                key={block.id}
                blockId={block.id}
                description={block.description}
                expanded={expandedBlockId === block.id}
                onSelectStep={handleSelectStep}
                onToggle={() =>
                  setExpandedBlockId((current) =>
                    current === block.id ? "" : block.id,
                  )
                }
                selectedStepId={selectedStepId}
                steps={block.steps}
                title={block.title}
              />
            ))}
          </div>
        </section>

        <aside className="dashboard-right">
          <StepDetailsPanel
            activeTab={detailsTab}
            detail={selectedDetail}
            onTabChange={setDetailsTab}
          />
          <DownloadPanel
            apiBaseUrl={API_BASE_URL}
            isAnalysisReady={analysisStatus === "completed" && Boolean(result)}
            isMarkdownReady={Boolean(proposalMarkdown)}
            isProposalReady={proposalStatus === "completed" && Boolean(proposalResult)}
            onViewMarkdown={() => {
              setSelectedStepId("final_document_build");
              setActiveNav("results");
              setDetailsTab("preview");
            }}
          />
        </aside>
      </div>
    </main>
  );
}

export default AnalyzeTender;
