function buildUnifiedModel({
  analysis,
  contract,
  system,
  pbs,
  dependencies,
  domainModel,
  architecture,
  database,
  api,
  validation,
}) {
  return {
    meta: {
      generatedAt: new Date().toISOString(),
      version: "1.0",
    },

    requirements: {
      functional: analysis.requirements || "",
      nonFunctional: analysis.nonFunctional || "",
      constraints: analysis.constraints || "",
      integrations: analysis.integrations || "",
      actors: analysis.actors || "",
    },

    contract,

    system,

    structure: {
      pbs,
      dependencies,
    },

    architecture: {
      domainModel,
      architecture,
      database,
      api,
    },

    validation,
  };
}

module.exports = buildUnifiedModel;