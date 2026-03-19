const runPrompt = require("../pipelines/runPrompt");

async function analyzerAgent(input, context = {}) {
  const { tor } = input;

  const result = await runPrompt("analysis/tender-analysis-structured.md", {
    tor,
  });

  let parsed;

  try {
    parsed = JSON.parse(result);
  } catch (e) {
    throw new Error("AnalyzerAgent: failed to parse JSON output");
  }

  return {
    requirements: parsed.functional_requirements || [],
    nonFunctional: parsed.non_functional || [],
    integrations: parsed.integrations || [],
    actors: parsed.actors || [],
    constraints: parsed.constraints || [],
    raw: parsed,
  };
}

module.exports = analyzerAgent;
