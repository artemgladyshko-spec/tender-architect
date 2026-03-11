function buildArchitectureContext(
  requirements,
  actors,
  architecturePatterns,
  pbs,
  skills,
) {
  return {
    requirements,
    actors,
    architecturePatterns,
    pbs,
    backendArchitectureSkills: skills.backendArchitectureSkills,
    uiArchitectureSkills: skills.uiArchitectureSkills,
    architectureSkills: {
      backendArchitectureSkills: skills.backendArchitectureSkills,
      uiArchitectureSkills: skills.uiArchitectureSkills,
    },
    architectureInstruction: [
      "Use the provided architecture skills to design the system architecture.",
      "Explicitly consider CQRS, event sourcing, DDD aggregates, service orchestration, service presentation layer, shared kernel, UI architecture, design system, and internationalization.",
      "The output must cover service boundaries, domain aggregates, CQRS read models, event sourcing rules, integration layer, database structure, API structure, and UI architecture.",
    ].join(" "),
  };
}

module.exports = buildArchitectureContext;
