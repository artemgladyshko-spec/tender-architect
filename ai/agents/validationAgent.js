const runPrompt = require("../pipelines/runPrompt");

async function validationAgent({
  system,
  pbs,
  dependencies,
  domainModel,
  architecture,
  api,
  language = "ua",
}) {
  const result = await runPrompt("validation/system-validation.md", {
    system: JSON.stringify(system),
    pbs: JSON.stringify(pbs),
    dependencies: JSON.stringify(dependencies),
    domainModel: JSON.stringify(domainModel),
    architecture: JSON.stringify(architecture),
    api: JSON.stringify(api),
    language,
  });

  try {
    return JSON.parse(result);
  } catch (e) {
    throw new Error("validationAgent: invalid JSON");
  }
}

module.exports = validationAgent;