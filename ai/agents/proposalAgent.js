const runPrompt = require("../pipelines/runPrompt");
const buildUnifiedModel = require("../core/buildUnifiedModel");

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

const toKebabCase = (value) => String(value || "").replace(/_/g, "-");

async function proposalAgent(input) {
  const unifiedModel = input?.unifiedModel || buildUnifiedModel(input);

  const sections = {};

  for (const section of SECTION_KEYS) {
    sections[section] = await runPrompt(
      `proposal/sections/${toKebabCase(section)}.md`,
      {
        model: JSON.stringify(unifiedModel),
        section,
        language: input.language || "ua",
      }
    );
  }

  return {
    unifiedModel,
    sections,
  };
}

module.exports = proposalAgent;
