const runPrompt = require("../pipelines/runPrompt");

async function contractAnalysisAgent(input) {
  const { attachments = [] } = input;

  if (!attachments.length) {
    return {
      engagement_model: "unknown",
      phases: [],
      milestones: [],
      constraints: [],
      risks: [],
    };
  }

  const result = await runPrompt("analysis/contract-analysis.md", {
    attachments: JSON.stringify(attachments),
  });

  try {
    return JSON.parse(result);
  } catch (e) {
    throw new Error("contractAnalysisAgent: invalid JSON");
  }
}

module.exports = contractAnalysisAgent;
