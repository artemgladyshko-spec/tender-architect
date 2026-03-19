const fs = require("fs");
const path = require("path");

const generateDocx = require("../../apps/backend/utils/docxGenerator");
const loadProposalSections = require("../dictionaries/loadProposalSections");

// 🔥 ENGINE
const sectionStructureAgent = require("../agents/sectionStructureAgent");
const deepSectionBuilder = require("../core/deepSectionBuilder");

// 🔥 CONSISTENCY
const consistencyAgent = require("../agents/consistencyAgent");

// =========================
// CONFIG
// =========================
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
const markdownProposalPath = path.join(
  proposalOutputDir,
  "technical_proposal.md"
);
const docxProposalPath = path.join(
  proposalOutputDir,
  "technical_proposal.docx"
);

// =========================
// HELPERS
// =========================
const buildSectionDefinitions = (dictionary) =>
  SECTION_KEYS.map((key) => ({
    key,
    title: dictionary.sections[key],
  }));

function safeParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// fallback якщо LLM не дав структуру
function createFallbackStructure(title) {
  return {
    title,
    items: [
      {
        id: "1",
        title,
      },
    ],
  };
}

// =========================
// MARKDOWN BUILDER
// =========================
const buildProposalMarkdown = ({ title, sections, definitions }) =>
  [
    `# ${title}`,
    "",
    ...definitions.flatMap((definition) => [
      `## ${definition.title}`,
      "",
      String(sections[definition.key] || "Недостатньо даних.").trim(),
      "",
    ]),
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim() + "\n";

// =========================
// 🔥 DEEP SECTION GENERATION
// =========================
async function generateSection({
  definition,
  unifiedModel,
  patterns,
  language,
}) {
  // =========================
  // 1. STRUCTURE
  // =========================
  const structureRaw = await sectionStructureAgent({
    sectionKey: definition.key,
    unifiedModel,
    language,
  });

  let structure = safeParseJSON(structureRaw);

  if (!structure || !structure.items) {
    console.warn(
      `⚠️ Fallback structure used for ${definition.key}`
    );
    structure = createFallbackStructure(definition.title);
  }

  // =========================
  // 2. CONTENT
  // =========================
  return deepSectionBuilder({
    structure,
    unifiedModel,
    patterns,
    language,
  });
}

// =========================
// MAIN PIPELINE
// =========================
async function runProposalPipeline(
  { unifiedModel, language = "ua", patterns = {} },
  options = {}
) {
  if (!unifiedModel) {
    throw new Error("unifiedModel is required for proposal generation");
  }

  const dictionary = loadProposalSections(language);
  const definitions = buildSectionDefinitions(dictionary);

  let sections = {};

  fs.mkdirSync(proposalOutputDir, { recursive: true });

  // =========================
  // GENERATE ALL SECTIONS
  // =========================
  for (const definition of definitions) {
    if (typeof options.onStatusUpdate === "function") {
      options.onStatusUpdate({
        section: definition.key,
        status: "running",
        updatedAt: new Date().toISOString(),
      });
    }

    try {
      sections[definition.key] = await generateSection({
        definition,
        unifiedModel,
        patterns,
        language,
      });

      if (typeof options.onStatusUpdate === "function") {
        options.onStatusUpdate({
          section: definition.key,
          status: "completed",
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error(`Section failed: ${definition.key}`, error);

      sections[definition.key] =
        "Помилка генерації розділу. Недостатньо даних.";

      if (typeof options.onStatusUpdate === "function") {
        options.onStatusUpdate({
          section: definition.key,
          status: "failed",
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }

  // =========================
  // 🔥 CONSISTENCY CHECK
  // =========================
  try {
    const consistencyRaw = await consistencyAgent({
      sections,
      unifiedModel,
      language,
    });

    const consistency = safeParseJSON(consistencyRaw);

    if (consistency?.issues?.length) {
      console.warn("⚠️ Consistency issues detected:");
      console.warn(consistency.issues);
    }
  } catch (err) {
    console.warn("Consistency check failed (non-critical)");
  }

  // =========================
  // FINAL DOCUMENT
  // =========================
  const proposal = buildProposalMarkdown({
    title: dictionary.documentTitle,
    sections,
    definitions,
  });

  fs.writeFileSync(markdownProposalPath, proposal, "utf8");

  try {
    await generateDocx(proposal, docxProposalPath);
  } catch (err) {
    console.warn("DOCX generation failed (non-critical)");
  }

  return {
    proposal,
    sections,
  };
}

runProposalPipeline.SECTION_KEYS = SECTION_KEYS;

module.exports = runProposalPipeline;