const runPrompt = require("../pipelines/runPrompt");

async function systemThinkingAgent(input) {
  const {
    requirements,
    integrations,
    actors,
    constraints,
    contract,
  } = input;

  const result = await runPrompt("analysis/system-thinking.md", {
    requirements: JSON.stringify(requirements),
    integrations: JSON.stringify(integrations),
    actors: JSON.stringify(actors),
    constraints: JSON.stringify(constraints),
    contract: JSON.stringify(contract),
  });

  try {
    return JSON.parse(result);
  } catch (e) {
    throw new Error("systemThinkingAgent: invalid JSON");
  }
}

module.exports = systemThinkingAgent;
