const runPrompt = require("../pipelines/runPrompt");

async function consistencyAgent({ sections, unifiedModel, language }) {
  return runPrompt("analysis/consistency-checker.md", {
    sections: JSON.stringify(sections),
    model: JSON.stringify(unifiedModel),
    language,
  });
}

module.exports = consistencyAgent;