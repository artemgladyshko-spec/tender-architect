const analyzeChunks = require("../document/analyzeChunks");
const chunkDocument = require("../document/chunkDocument");
const mergeAnalysis = require("../document/mergeAnalysis");
const parseSections = require("../document/parseSections");
const runPrompt = require("../pipelines/runPrompt");

async function analyzerAgent(tenderDocumentText, language = "ua") {
  const sections = parseSections(tenderDocumentText || "");
  const chunks = chunkDocument(sections);
  const analysis = await analyzeChunks(chunks, { language });
  const requirements = mergeAnalysis(analysis, { language });

  const actors = await runPrompt("actor_detector.md", {
    requirements,
    language,
  });

  const architecturePatterns = await runPrompt(
    "architecture_pattern_detector.md",
    {
      requirements,
      language,
    },
  );

  return {
    requirements,
    actors,
    architecturePatterns,
    sections,
    chunks,
  };
}

module.exports = analyzerAgent;
