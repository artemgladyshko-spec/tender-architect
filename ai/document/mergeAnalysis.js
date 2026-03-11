const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..", "..");
const analysisDir = path.join(rootDir, "data", "outputs", "analysis");

const normalizeForDedup = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const dedupeEntries = (entries) => {
  const seen = new Set();

  return entries.filter((entry) => {
    const key = normalizeForDedup(entry.text);

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const renderSection = (title, entries) => {
  const body = entries.length
    ? entries
        .map(
          (entry) =>
            `- ${entry.text} (section: ${entry.section}, page: ${entry.page}, chunk: ${entry.chunkIndex})`,
        )
        .join("\n")
    : "- None identified";

  return `## ${title}\n\n${body}`;
};

function mergeAnalysis(analysis) {
  fs.mkdirSync(analysisDir, { recursive: true });

  const merged = {
    functionalRequirements: dedupeEntries(analysis.requirements || []),
    nonFunctionalRequirements: dedupeEntries(analysis.nfr || []),
    integrations: dedupeEntries(analysis.integrations || []),
    securityRequirements: dedupeEntries(
      (analysis.constraints || []).filter((entry) =>
        /security|auth|encryption|audit|compliance|access/i.test(entry.text),
      ),
    ),
    constraints: dedupeEntries(analysis.constraints || []),
  };

  const markdown = [
    "# Requirements Analysis",
    "",
    renderSection("Functional Requirements", merged.functionalRequirements),
    "",
    renderSection(
      "Non Functional Requirements",
      merged.nonFunctionalRequirements,
    ),
    "",
    renderSection("Integrations", merged.integrations),
    "",
    renderSection("Security Requirements", merged.securityRequirements),
    "",
    renderSection("Constraints", merged.constraints),
    "",
  ].join("\n");

  fs.writeFileSync(
    path.join(analysisDir, "requirements.md"),
    markdown,
    "utf8",
  );

  return markdown;
}

module.exports = mergeAnalysis;
