const runPrompt = require("../pipelines/runPrompt");

async function consistencyFixerAgent({
  sections,
  issues,
  unifiedModel,
  language,
}) {
  return runPrompt("analysis/consistency-fixer.md", {
    sections: JSON.stringify(sections),
    issues: JSON.stringify(issues),
    model: JSON.stringify(unifiedModel),
    language,
  });
}

module.exports = consistencyFixerAgent;