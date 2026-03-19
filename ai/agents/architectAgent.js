const buildArchitectureContext = require("../orchestration/buildArchitectureContext");
const smartOrchestrator = require("../orchestration/smartOrchestrator");
const runPrompt = require("../pipelines/runPrompt");

async function architectAgent({
  requirements,
  system,
  pbs,
  dependencies,
  patterns = {}, // NEW
  language = "ua",
}) {
  // =========================
  // 1. ORCHESTRATION (🧠 decision layer)
  // =========================
  const orchestration = smartOrchestrator({
    system: {
      ...system,
      patterns,
    },
    pbs,
    dependencies,
  });

  const selectedSkillsText = orchestration.skills
    .map((s) => s.content)
    .join("\n\n");

  // =========================
  // 2. CONTEXT BUILDING
  // =========================
  const architectureContext = buildArchitectureContext({
    requirements,
    system,
    pbs,
    dependencies,
    patterns, // NEW
  });

  const basePayload = {
    ...architectureContext,

    system: JSON.stringify(system),
    pbs: JSON.stringify(pbs),
    dependencies: JSON.stringify(dependencies),
    patterns: JSON.stringify(patterns), // NEW

    selectedSkills: selectedSkillsText,
    language,
  };

  // =========================
  // 3. DOMAIN MODEL
  // =========================
  const domainModel = await runPrompt(
    "modeling/domain-model-generator.md",
    basePayload
  );

  // =========================
  // 4. ARCHITECTURE
  // =========================
  const architecture = await runPrompt(
    "architecture/execution/architecture-designer.md",
    {
      ...basePayload,
      domainModel,
    }
  );

  // =========================
  // 5. DATABASE
  // =========================
  const database = await runPrompt(
    "data/database-designer.md",
    {
      ...basePayload,
      domainModel,
      architecture,
    }
  );

  // =========================
  // 6. API
  // =========================
  const api = await runPrompt(
    "integration/api-designer.md",
    {
      ...basePayload,
      domainModel,
      architecture,
      database,
    }
  );

  // =========================
  // RETURN
  // =========================
  return {
    domainModel,
    architecture,
    database,
    api,

    // IMPORTANT: explainability
    orchestration: {
      capabilities: orchestration.capabilities,
      selectedSkills: orchestration.skills.map((s) => s.name),
    },

    // IMPORTANT: patterns visibility
    patterns,
  };
}

module.exports = architectAgent;
