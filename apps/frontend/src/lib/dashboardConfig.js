export const PIPELINE_BLOCKS = [
  {
    id: "analysis",
    title: "Analysis",
    description:
      "Inputs are decomposed into requirements, actors, contracts, and patterns.",
    steps: [
      { id: "requirements_analysis", label: "Requirements Analysis" },
      { id: "actor_detection", label: "Actor Detection" },
      { id: "contract_analysis", label: "Contract Analysis" },
      { id: "system_thinking", label: "System Thinking" },
      { id: "pattern_detection", label: "Pattern Detection" },
    ],
  },
  {
    id: "system_design",
    title: "System Design",
    description:
      "Structured architecture artifacts are generated and validated.",
    steps: [
      { id: "pbs_generation", label: "PBS Generation" },
      { id: "dependency_mapping", label: "Dependency Mapping" },
      { id: "domain_model", label: "Domain Model" },
      { id: "architecture_design", label: "Architecture Design" },
      { id: "database_design", label: "Database Design" },
      { id: "api_design", label: "API Design" },
      { id: "validation", label: "Validation" },
    ],
  },
  {
    id: "document_engine",
    title: "Document Engine",
    description:
      "Proposal sections are built, checked, and rendered into final outputs.",
    steps: [
      { id: "section_structure_generation", label: "Section Structure Generation" },
      { id: "deep_content_generation", label: "Deep Content Generation" },
      { id: "consistency_check", label: "Consistency Check" },
      { id: "final_document_build", label: "Final Document Build" },
    ],
  },
];

export const PROPOSAL_SECTIONS = [
  { id: "general_information", label: "General Information" },
  { id: "business_processes", label: "Business Processes" },
  { id: "system_requirements", label: "System Requirements" },
  { id: "architecture_solution", label: "Architecture Solution" },
  { id: "implementation_plan", label: "Implementation Plan" },
  { id: "acceptance_process", label: "Acceptance Procedure" },
  { id: "deployment_requirements", label: "Deployment Requirements" },
  {
    id: "documentation_requirements",
    label: "Documentation Requirements",
  },
];

export const PROPOSAL_LANGUAGES = [
  { value: "ua", label: "Ukrainian" },
  { value: "en", label: "English" },
];

export const FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const FILE_EXTENSIONS = new Set([".pdf", ".docx"]);
