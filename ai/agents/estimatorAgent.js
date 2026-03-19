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

const pickSection = (markdown, headings) =>
  headings.map((heading) => extractSection(markdown, heading)).find(Boolean) || "";

async function estimatorAgent({
  pbs,
  architecture,
  api,
  database,
  language = "ua",
}) {
  const rawEstimation = await runPrompt("planning/estimator.md", {
    pbs,
    architecture,
    api,
    database,
    language,
  });

  return {
    teamStructure:
      pickSection(rawEstimation, ["Team Structure", "Структура команди"]) ||
      rawEstimation,
    timeline:
      pickSection(rawEstimation, [
        "Project Timeline",
        "Project Phases",
        "Графік проєкту",
        "Етапи проєкту",
      ]) ||
      rawEstimation,
    cost:
      pickSection(rawEstimation, [
        "Summary",
        "Effort Estimation",
        "Підсумок",
        "Оцінка трудовитрат",
      ]) ||
      rawEstimation,
    raw: rawEstimation,
  };
}

module.exports = estimatorAgent;
