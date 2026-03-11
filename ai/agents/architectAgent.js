const buildArchitectureContext = require("../skills/buildArchitectureContext");
const loadSkills = require("../skills/loadSkills");
const runPrompt = require("../pipelines/runPrompt");

async function architectAgent({
  requirements,
  actors,
  architecturePatterns,
  pbs,
}) {
  const skills = loadSkills();
  const architectureContext = buildArchitectureContext(
    requirements,
    actors,
    architecturePatterns,
    pbs,
    skills,
  );

  const domainModel = await runPrompt("domain_model_generator.md", {
    ...architectureContext,
  });

  const architecture = await runPrompt("architecture_designer.md", {
    ...architectureContext,
    domainModel,
  });

  const database = await runPrompt("database_designer.md", {
    ...architectureContext,
    domainModel,
    architecture,
  });

  const api = await runPrompt("api_designer.md", {
    ...architectureContext,
    domainModel,
    architecture,
    database,
  });

  return {
    domainModel,
    architecture,
    database,
    api,
  };
}

module.exports = architectAgent;
