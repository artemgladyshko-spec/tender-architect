const runPrompt = require("../pipelines/runPrompt");

async function dependencyMapper(input) {
  const { pbs } = input;

  const result = await runPrompt("analysis/dependency-mapping.md", {
    pbs: JSON.stringify(pbs),
  });

  try {
    return JSON.parse(result);
  } catch (e) {
    throw new Error("dependencyMapper: invalid JSON");
  }
}

module.exports = dependencyMapper;
