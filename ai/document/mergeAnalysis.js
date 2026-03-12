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

const LOCALIZED_STRINGS = {
  en: {
    documentTitle: "Requirements Analysis",
    functionalRequirements: "Functional Requirements",
    nonFunctionalRequirements: "Non Functional Requirements",
    integrations: "Integrations",
    securityRequirements: "Security Requirements",
    constraints: "Constraints",
    noneIdentified: "None identified",
    section: "section",
    page: "page",
    chunk: "chunk",
  },
  ua: {
    documentTitle: "Аналіз вимог",
    functionalRequirements: "Функціональні вимоги",
    nonFunctionalRequirements: "Нефункціональні вимоги",
    integrations: "Інтеграції",
    securityRequirements: "Вимоги безпеки",
    constraints: "Обмеження",
    noneIdentified: "Не виявлено",
    section: "розділ",
    page: "сторінка",
    chunk: "фрагмент",
  },
};

const renderSection = (title, entries, labels) => {
  const body = entries.length
    ? entries
        .map(
          (entry) =>
            `- ${entry.text} (${labels.section}: ${entry.section}, ${labels.page}: ${entry.page}, ${labels.chunk}: ${entry.chunkIndex})`,
        )
        .join("\n")
    : `- ${labels.noneIdentified}`;

  return `## ${title}\n\n${body}`;
};

function mergeAnalysis(analysis, options = {}) {
  fs.mkdirSync(analysisDir, { recursive: true });
  const language = options.language === "en" ? "en" : "ua";
  const labels = LOCALIZED_STRINGS[language];

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
    `# ${labels.documentTitle}`,
    "",
    renderSection(
      labels.functionalRequirements,
      merged.functionalRequirements,
      labels,
    ),
    "",
    renderSection(
      labels.nonFunctionalRequirements,
      merged.nonFunctionalRequirements,
      labels,
    ),
    "",
    renderSection(labels.integrations, merged.integrations, labels),
    "",
    renderSection(
      labels.securityRequirements,
      merged.securityRequirements,
      labels,
    ),
    "",
    renderSection(labels.constraints, merged.constraints, labels),
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
