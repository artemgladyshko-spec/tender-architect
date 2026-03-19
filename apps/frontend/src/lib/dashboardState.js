import { PIPELINE_BLOCKS, PROPOSAL_SECTIONS } from "./dashboardConfig";

const STATUS_VALUES = new Set(["pending", "running", "completed", "failed"]);

const STEP_ALIASES = {
  requirements_analysis: ["requirements_analysis", "requirements"],
  actor_detection: ["actor_detection", "actors"],
  contract_analysis: ["contract_analysis"],
  system_thinking: ["system_thinking"],
  pattern_detection: ["pattern_detection", "architecture_patterns"],
  pbs_generation: ["pbs_generation", "pbs"],
  dependency_mapping: ["dependency_mapping", "dependencies"],
  domain_model: ["domain_model"],
  architecture_design: ["architecture_design", "architecture"],
  database_design: ["database_design", "database"],
  api_design: ["api_design", "api"],
  validation: ["validation"],
  section_structure_generation: ["section_structure_generation", "proposal_structure"],
  deep_content_generation: ["deep_content_generation", "proposal_content"],
  consistency_check: ["consistency_check", "consistency"],
  final_document_build: ["final_document_build", "proposal_generation"],
};

const AGENT_TO_STEP_IDS = {
  analyzerAgent: ["requirements_analysis", "actor_detection"],
  contractAnalysisAgent: ["contract_analysis"],
  systemThinkingAgent: ["system_thinking"],
  architecturePatternAgent: ["pattern_detection"],
  pbsAgent: ["pbs_generation"],
  pbsGenerator: ["pbs_generation"],
  dependencyMapper: ["dependency_mapping"],
  architectAgent: ["domain_model", "architecture_design", "database_design", "api_design"],
  validationAgent: ["validation"],
  proposalAgent: [
    "section_structure_generation",
    "deep_content_generation",
    "consistency_check",
    "final_document_build",
  ],
};

export const normalizeStatus = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  return STATUS_VALUES.has(normalized) ? normalized : "pending";
};

export const createInitialPipelineBlocks = () =>
  PIPELINE_BLOCKS.map((block) => ({
    ...block,
    steps: block.steps.map((step) => ({ ...step, status: "pending" })),
  }));

export const createInitialProposalSections = () =>
  PROPOSAL_SECTIONS.map((section) => ({
    ...section,
    status: "pending",
    children: [
      { id: `${section.id}_structure`, label: "Structure", status: "pending" },
      { id: `${section.id}_content`, label: "Content", status: "pending" },
      { id: `${section.id}_review`, label: "Review", status: "pending" },
    ],
  }));

const setStepStatus = (blocks, stepId, status) =>
  blocks.map((block) => ({
    ...block,
    steps: block.steps.map((step) =>
      step.id === stepId ? { ...step, status: normalizeStatus(status) } : step,
    ),
  }));

export const mapEntriesToPipelineBlocks = (entries = []) => {
  let nextBlocks = createInitialPipelineBlocks();

  entries.forEach((entry) => {
    const normalized = normalizeStatus(entry.status);

    if (entry.step === "pipeline" && normalized === "failed") {
      const runningStepId = nextBlocks.flatMap((block) => block.steps).find(
        (step) => step.status === "running",
      )?.id;
      if (runningStepId) {
        nextBlocks = setStepStatus(nextBlocks, runningStepId, "failed");
      }
      return;
    }

    if (AGENT_TO_STEP_IDS[entry.step]) {
      AGENT_TO_STEP_IDS[entry.step].forEach((stepId) => {
        nextBlocks = setStepStatus(nextBlocks, stepId, normalized);
      });
      return;
    }

    Object.entries(STEP_ALIASES).forEach(([stepId, aliases]) => {
      if (aliases.includes(entry.step)) {
        nextBlocks = setStepStatus(nextBlocks, stepId, normalized);
      }
    });
  });

  return nextBlocks;
};

export const mapPipelineStatusPayload = (stepsPayload = {}) => {
  const entries = Array.isArray(stepsPayload)
    ? stepsPayload
    : Object.entries(stepsPayload || {}).map(([step, status]) => ({ step, status }));

  return mapEntriesToPipelineBlocks(entries);
};

export const mapProposalStatusToSections = (stepsPayload = {}) =>
  createInitialProposalSections().map((section) => {
    const status = normalizeStatus(stepsPayload?.[section.id]);
    const children =
      status === "running"
        ? ["completed", "running", "pending"]
        : status === "completed"
          ? ["completed", "completed", "completed"]
          : status === "failed"
            ? ["completed", "completed", "failed"]
            : ["pending", "pending", "pending"];

    return {
      ...section,
      status,
      children: section.children.map((child, index) => ({
        ...child,
        status: children[index],
      })),
    };
  });
