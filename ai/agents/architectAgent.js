const buildArchitectureContext = require("../skills/buildArchitectureContext");
const loadSkills = require("../skills/loadSkills");
const runPrompt = require("../pipelines/runPrompt");

async function architectAgent({
  requirements,
  actors,
  architecturePatterns,
  pbs,
  language = "ua",
}) {
  const skills = loadSkills();
  const architectureContext = buildArchitectureContext({
    requirements,
    actors,
    architecturePatterns,
    pbs,
  });

  const domainModel = await runPrompt("domain_model_generator.md", {
    ...architectureContext,
    backendArchitectureSkills: skills.backendArchitectureSkills,
    uiArchitectureSkills: skills.uiArchitectureSkills,
    language,
  });

  const architecture = await runPrompt("architecture_designer.md", {
    ...architectureContext,
    domainModel,
    backendArchitectureSkills: skills.backendArchitectureSkills,
    uiArchitectureSkills: skills.uiArchitectureSkills,
    language,
  });

  const database = await runPrompt("database_designer.md", {
    ...architectureContext,
    domainModel,
    architecture,
    backendArchitectureSkills: skills.backendArchitectureSkills,
    uiArchitectureSkills: skills.uiArchitectureSkills,
    language,
  });

  const api = await runPrompt("api_designer.md", {
    ...architectureContext,
    domainModel,
    architecture,
    database,
    backendArchitectureSkills: skills.backendArchitectureSkills,
    uiArchitectureSkills: skills.uiArchitectureSkills,
    language,
  });

  return {
    domainModel,
    architecture,
    database,
    api,
  };
}

module.exports = architectAgent;
