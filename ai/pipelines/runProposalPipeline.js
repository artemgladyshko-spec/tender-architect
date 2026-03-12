const fs = require("fs");
const path = require("path");
const generateDocx = require("../../apps/backend/utils/docxGenerator");
const loadProposalSections = require("../dictionaries/loadProposalSections");
const buildArchitectureContext = require("../skills/buildArchitectureContext");
const runPrompt = require("./runPrompt");

const SECTION_KEYS = [
  "general_information",
  "business_processes",
  "system_requirements",
  "architecture_solution",
  "implementation_plan",
  "acceptance_process",
  "deployment_requirements",
  "documentation_requirements",
];

const rootDir = path.resolve(__dirname, "..", "..");
const proposalOutputDir = path.join(rootDir, "data", "outputs", "proposal");
const markdownProposalPath = path.join(proposalOutputDir, "technical_proposal.md");
const docxProposalPath = path.join(proposalOutputDir, "technical_proposal.docx");
const proposalPromptsDir = path.resolve(__dirname, "..", "prompts", "proposal");

const readPromptFile = (relativePath) =>
  fs.readFileSync(path.join(proposalPromptsDir, relativePath), "utf8");

const normalizeAnalysisResults = (analysisResults = {}) => ({
  ...analysisResults,
  architecturePatterns:
    analysisResults.architecturePatterns ||
    analysisResults.architecture_patterns ||
    analysisResults.patterns ||
    "",
  domainModel:
    analysisResults.domainModel ||
    analysisResults.domain_model ||
    analysisResults.domain ||
    "",
  projectPlan:
    analysisResults.projectPlan ||
    analysisResults.project_plan ||
    analysisResults.projectPlanDetails ||
    "",
});

const buildSectionDefinitions = (dictionary) =>
  SECTION_KEYS.map((key) => ({
    key,
    title: dictionary.sections[key],
    promptFile: `proposal/sections/${key}.md`,
  }));

const buildProposalMarkdown = ({ title, sections, definitions }) =>
  [
    `# ${title}`,
    "",
    ...definitions.flatMap((definition) => [
      `## ${definition.title}`,
      "",
      String(sections[definition.key] || "No content generated.").trim(),
      "",
    ]),
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim() + "\n";

const buildProposalReviewContext = ({
  sectionKey,
  sectionTitle,
  sectionDraft,
  architectureContext,
  analysisResults,
}) => ({
  reviewObjective:
    "Check consistency, missing architecture components, missing integrations, and security gaps. Return actionable corrections for this section draft.",
  sectionKey,
  sectionTitle,
  sectionDraft,
  architecture_context: architectureContext,
  analysis_results: analysisResults,
});

async function generateReviewedSection({
  definition,
  language,
  torText,
  normalizedAnalysisResults,
  architectureContext,
  proposalSystemArchitectPrompt,
}) {
  const sectionPrompt = readPromptFile(`sections/${definition.key}.md`);

  const initialDraft = await runPrompt(definition.promptFile, {
    language,
    torText,
    sectionTitle: definition.title,
    architecture_context: architectureContext,
    analysis_results: normalizedAnalysisResults,
    proposalSystemArchitectPrompt,
    sectionPrompt,
  });

  const reviewFeedback = await runPrompt("architecture_reviewer.md", {
    ...buildProposalReviewContext({
      sectionKey: definition.key,
      sectionTitle: definition.title,
      sectionDraft: initialDraft,
      architectureContext,
      analysisResults: normalizedAnalysisResults,
    }),
  });

  return runPrompt(definition.promptFile, {
    language,
    torText,
    sectionTitle: definition.title,
    architecture_context: architectureContext,
    analysis_results: normalizedAnalysisResults,
    proposalSystemArchitectPrompt,
    sectionPrompt,
    initialDraft,
    reviewFeedback,
    rewriteInstruction:
      "Revise the section draft to resolve all review findings while preserving technical completeness and formal documentation tone.",
  });
}

async function runProposalPipeline(
  { analysisResults, language = "ua", torText = "" },
  options = {},
) {
  const dictionary = loadProposalSections(language);
  const normalizedAnalysisResults = normalizeAnalysisResults(analysisResults);
  const definitions = buildSectionDefinitions(dictionary);
  const proposalSystemArchitectPrompt = readPromptFile(
    "proposal_system_architect.md",
  );

  const architectureContext = buildArchitectureContext(normalizedAnalysisResults);

  const sections = {};

  fs.mkdirSync(proposalOutputDir, { recursive: true });

  for (const definition of definitions) {
    if (typeof options.onStatusUpdate === "function") {
      options.onStatusUpdate({
        section: definition.key,
        status: "running",
        updatedAt: new Date().toISOString(),
      });
    }

    try {
      sections[definition.key] = await generateReviewedSection({
        definition,
        language,
        torText,
        normalizedAnalysisResults,
        architectureContext,
        proposalSystemArchitectPrompt,
      });

      if (typeof options.onStatusUpdate === "function") {
        options.onStatusUpdate({
          section: definition.key,
          status: "completed",
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      if (typeof options.onStatusUpdate === "function") {
        options.onStatusUpdate({
          section: definition.key,
          status: "failed",
          updatedAt: new Date().toISOString(),
        });
      }

      throw error;
    }
  }

  const proposal = buildProposalMarkdown({
    title: dictionary.documentTitle,
    sections,
    definitions,
  });

  fs.writeFileSync(markdownProposalPath, proposal, "utf8");
  await generateDocx(proposal, docxProposalPath);

  return {
    proposal,
    sections,
  };
}

runProposalPipeline.SECTION_KEYS = SECTION_KEYS;

module.exports = runProposalPipeline;
