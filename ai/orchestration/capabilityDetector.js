function capabilityDetector({ system, pbs, dependencies }) {
  const capabilities = new Set();

  // =========================
  // SYSTEM TYPE SIGNALS
  // =========================
  switch (system?.system_type) {
    case "web_app":
      capabilities.add("ui");
      capabilities.add("api");
      capabilities.add("backend");
      break;

    case "data_platform":
      capabilities.add("data");
      capabilities.add("backend");
      break;

    case "integration":
      capabilities.add("integration");
      capabilities.add("api");
      break;

    case "hybrid":
      capabilities.add("ui");
      capabilities.add("api");
      capabilities.add("data");
      capabilities.add("integration");
      break;

    default:
      capabilities.add("backend");
  }

  // =========================
  // PBS SIGNALS
  // =========================
  if (pbs?.components?.length) {
    for (const component of pbs.components) {
      if (component.type === "ui") {
        capabilities.add("ui");
      }

      if (component.type === "service") {
        capabilities.add("backend");
      }

      if (component.type === "database") {
        capabilities.add("data");
      }

      if (component.type === "integration") {
        capabilities.add("integration");
      }
    }
  }

  // =========================
  // DEPENDENCY SIGNALS
  // =========================
  const depCount = dependencies?.dependencies?.length || 0;

  if (depCount > 3) {
    capabilities.add("integration");
  }

  if (depCount > 7) {
    capabilities.add("scalability");
  }

  // =========================
  // COMPLEXITY SIGNAL
  // =========================
  if (system?.complexity === "high") {
    capabilities.add("scalability");
    capabilities.add("resilience");
  }

  return [...capabilities];
}

module.exports = capabilityDetector;