const runPrompt = require("../pipelines/runPrompt");

async function proposalAgent(input) {
  return runPrompt("proposal_writer.md", input);
}

module.exports = proposalAgent;
