const runPrompt = require("../pipelines/runPrompt");

async function sectionContentAgent({
  node,
  unifiedModel,
  patterns,
  language,
}) {
  return runPrompt("proposal/section-content-generator.md", {
    node,
    model: JSON.stringify(unifiedModel),
    patterns: JSON.stringify(patterns),
    language,
  });
}

module.exports = sectionContentAgent;