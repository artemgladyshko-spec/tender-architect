const runPrompt = require("../pipelines/runPrompt");

async function architecturePatternAgent({
  requirements,
  system,
  language = "ua",
}) {
  const result = await runPrompt(
    "analysis/architecture-meta-detector.md",
    {
      requirements: JSON.stringify(requirements),
      system: JSON.stringify(system),
      language,
    }
  );

  try {
    return JSON.parse(result);
  } catch {
    return {
      detected_patterns: [],
    };
  }
}

module.exports = architecturePatternAgent;
