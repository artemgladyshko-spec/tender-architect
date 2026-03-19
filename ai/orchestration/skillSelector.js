const { loadAllSkills } = require("./autoSkillRegistry");

function detectCapabilities({ system, pbs, dependencies }) {
  const caps = new Set();

  // =========================
  // SYSTEM TYPE
  // =========================
  if (system?.system_type === "web_app") {
    caps.add("ui");
    caps.add("api");
  }

  if (system?.system_type === "data_platform") {
    caps.add("data");
  }

  if (system?.system_type === "integration") {
    caps.add("integration");
  }

  // =========================
  // PBS SIGNALS
  // =========================
  if (pbs?.components?.some((c) => c.type === "ui")) {
    caps.add("ui");
  }

  if (pbs?.components?.some((c) => c.type === "database")) {
    caps.add("data");
  }

  if (pbs?.components?.some((c) => c.type === "service")) {
    caps.add("backend");
  }

  // =========================
  // DEPENDENCIES
  // =========================
  if (dependencies?.dependencies?.length > 5) {
    caps.add("integration");
  }

  return [...caps];
}

function mapCategoryToCapabilities(category) {
  const map = {
    analysis: ["analysis"],
    modeling: ["backend", "data"],
    architecture: ["backend"],
    data: ["data"],
    integration: ["integration"],
    ui: ["ui"],
    planning: ["planning"],
    core: ["core"],
    proposal: ["core"],
  };

  return map[category] || [];
}

function smartOrchestrator({ system, pbs, dependencies }) {
  const allSkills = loadAllSkills();

  const capabilities = detectCapabilities({ system, pbs, dependencies });

  const selected = [];

  for (const skill of allSkills) {
    const caps = mapCategoryToCapabilities(skill.category);

    const match = caps.some((c) => capabilities.includes(c));

    if (match) {
      selected.push(skill);
    }
  }

  return {
    capabilities,
    skills: selected,
  };
}

module.exports = smartOrchestrator;
