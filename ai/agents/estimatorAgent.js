const runPrompt = require("../pipelines/runPrompt");

const extractSection = (markdown, heading) => {
  const lines = String(markdown || "").split("\n");
  const normalizedHeading = heading.toLowerCase();
  let collecting = false;
  const buffer = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    const normalized = trimmed.toLowerCase();

    if (normalized.startsWith("## ")) {
      if (collecting) {
        collecting = false;
        return;
      }

      if (normalized === `## ${normalizedHeading}`) {
        collecting = true;
      }

      return;
    }

    if (collecting) {
      buffer.push(line);
    }
  });

  return buffer.join("\n").trim();
};

async function estimatorAgent({ pbs, architecture, api, database }) {
  const rawEstimation = await runPrompt("estimator.md", {
    pbs,
    architecture,
    api,
    database,
  });

  return {
    teamStructure:
      extractSection(rawEstimation, "Team Structure") || rawEstimation,
    timeline:
      extractSection(rawEstimation, "Project Timeline") ||
      extractSection(rawEstimation, "Project Phases") ||
      rawEstimation,
    cost:
      extractSection(rawEstimation, "Summary") ||
      extractSection(rawEstimation, "Effort Estimation") ||
      rawEstimation,
    raw: rawEstimation,
  };
}

module.exports = estimatorAgent;
