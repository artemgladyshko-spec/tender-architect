const runPrompt = require("../pipelines/runPrompt");

async function sectionStructureAgent({ sectionKey, unifiedModel, language }) {
  return runPrompt("proposal/section-structure-generator.md", {
    sectionKey,
    model: JSON.stringify(unifiedModel),
    language,
  });
}

module.exports = sectionStructureAgent;