const runPrompt = require("../pipelines/runPrompt");

async function pbsAgent(input) {
  const { requirements, system } = input;

  const result = await runPrompt("modeling/pbs-structured.md", {
    requirements: JSON.stringify(requirements),
    system: JSON.stringify(system),
  });

  try {
    return JSON.parse(result);
  } catch (e) {
    throw new Error("pbsAgent: invalid JSON");
  }
}

module.exports = pbsAgent;
