const fs = require("fs");
const path = require("path");
const runPrompt = require("../pipelines/runPrompt");

const promptExists = (filename) =>
  fs.existsSync(path.join(__dirname, "..", "prompts", filename));

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

const buildFallbackProjectPlan = ({ architecture, pbs, estimation }) =>
  [
    "# Project Plan",
    "",
    "## Project Phases",
    "",
    "- Initiation and planning",
    "- Architecture and platform setup",
    "- Incremental implementation",
    "- Testing and stabilization",
    "- Deployment and handover",
    "",
    "## Risks",
    "",
    "- Integration dependencies may affect schedule.",
    "- Scope refinement may change timeline assumptions.",
    "",
    "## Dependencies",
    "",
    "- Finalized architecture baseline",
    "- PBS approval",
    "- Confirmed estimation inputs",
    "",
    "## Milestones",
    "",
    "- Architecture sign-off",
    "- MVP delivery",
    "- System integration complete",
    "- Production release",
    "",
    "## Context",
    "",
    `Architecture summary: ${String(architecture).slice(0, 300)}`,
    `PBS summary: ${String(pbs).slice(0, 300)}`,
    `Estimation summary: ${String(estimation).slice(0, 300)}`,
  ].join("\n");

async function projectManagerAgent({
  architecture,
  pbs,
  estimation,
  language = "ua",
}) {
  const rawProjectPlan = promptExists("project_manager.md")
    ? await runPrompt("project_manager.md", {
        architecture,
        pbs,
        estimation,
        language,
      })
    : buildFallbackProjectPlan({ architecture, pbs, estimation });

  return {
    projectPhases:
      pickSection(rawProjectPlan, ["Project Phases", "Етапи проєкту"]) ||
      rawProjectPlan,
    risks: pickSection(rawProjectPlan, ["Risks", "Ризики"]) || rawProjectPlan,
    dependencies:
      pickSection(rawProjectPlan, ["Dependencies", "Залежності"]) ||
      rawProjectPlan,
    milestones:
      pickSection(rawProjectPlan, ["Milestones", "Контрольні точки"]) ||
      rawProjectPlan,
    raw: rawProjectPlan,
  };
}

module.exports = projectManagerAgent;
