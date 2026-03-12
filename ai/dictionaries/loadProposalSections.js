const fs = require("fs");
const path = require("path");

const DICTIONARY_DIR = path.resolve(__dirname);
const SUPPORTED_LANGUAGES = new Set(["ua", "en"]);

function loadProposalSections(language = "ua") {
  const normalizedLanguage = SUPPORTED_LANGUAGES.has(language) ? language : "ua";
  const filePath = path.join(
    DICTIONARY_DIR,
    normalizedLanguage,
    "proposal_sections.json",
  );

  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

module.exports = loadProposalSections;
