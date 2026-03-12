const runPrompt = require("../pipelines/runPrompt");

const DEFAULT_RETRIES = 3;

const createAnalysisBucket = () => ({
  requirements: [],
  nfr: [],
  integrations: [],
  constraints: [],
  raw: [],
});

const normalizeLine = (line) =>
  line
    .replace(/^[-*]\s*/, "")
    .replace(/^\d+\.\s*/, "")
    .trim();

const extractBucket = (text, headings) => {
  const lines = String(text || "").split("\n");
  const items = [];
  let active = false;

  lines.forEach((line) => {
    const trimmed = line.trim();
    const normalized = trimmed.toLowerCase().replace(/[:#]/g, "");

    if (headings.some((heading) => normalized.includes(heading))) {
      active = true;
      return;
    }

    if (active && /^#{1,6}\s/.test(trimmed)) {
      active = false;
      return;
    }

    if (active && trimmed) {
      const item = normalizeLine(trimmed);

      if (item) {
        items.push(item);
      }
    }
  });

  return items;
};

const parseChunkAnalysis = (responseText) => {
  const requirements = extractBucket(responseText, [
    "functional requirements",
    "functional requirement",
    "system capabilities",
    "функціональні вимоги",
    "функціональна вимога",
    "можливості системи",
  ]);
  const nfr = extractBucket(responseText, [
    "non-functional requirements",
    "non functional requirements",
    "quality attributes",
    "нефункціональні вимоги",
    "не функціональні вимоги",
    "атрибути якості",
  ]);
  const integrations = extractBucket(responseText, [
    "external integrations",
    "integrations",
    "integration requirements",
    "зовнішні інтеграції",
    "інтеграції",
    "вимоги до інтеграції",
  ]);
  const constraints = extractBucket(responseText, [
    "security requirements",
    "constraints",
    "compliance requirements",
    "architecture constraints",
    "вимоги безпеки",
    "обмеження",
    "вимоги відповідності",
    "архітектурні обмеження",
  ]);

  return {
    requirements,
    nfr,
    integrations,
    constraints,
    raw: responseText,
  };
};

const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

async function analyzeChunks(chunks, options = {}) {
  const retries = options.retries || DEFAULT_RETRIES;
  const analysis = createAnalysisBucket();

  for (let index = 0; index < chunks.length; index += 1) {
    const chunk = chunks[index];

    console.log(`Processing chunk ${index + 1}/${chunks.length}`);

    let attempt = 0;
    let completed = false;
    let lastError = null;

    while (!completed && attempt < retries) {
      attempt += 1;

      try {
        const responseText = await runPrompt("requirements_analyzer.md", {
          chunk,
          language: options.language || "ua",
          chunkMetadata: {
            section: chunk.section,
            page: chunk.page,
            chunkIndex: chunk.chunkIndex,
          },
          instruction:
            "Analyze only this chunk. Extract functional requirements, non-functional requirements, integrations, and constraints. Preserve detail and avoid duplication when possible.",
        });

        const parsed = parseChunkAnalysis(responseText);

        analysis.requirements.push(
          ...parsed.requirements.map((item) => ({
            section: chunk.section,
            page: chunk.page,
            chunkIndex: chunk.chunkIndex,
            text: item,
          })),
        );
        analysis.nfr.push(
          ...parsed.nfr.map((item) => ({
            section: chunk.section,
            page: chunk.page,
            chunkIndex: chunk.chunkIndex,
            text: item,
          })),
        );
        analysis.integrations.push(
          ...parsed.integrations.map((item) => ({
            section: chunk.section,
            page: chunk.page,
            chunkIndex: chunk.chunkIndex,
            text: item,
          })),
        );
        analysis.constraints.push(
          ...parsed.constraints.map((item) => ({
            section: chunk.section,
            page: chunk.page,
            chunkIndex: chunk.chunkIndex,
            text: item,
          })),
        );
        analysis.raw.push({
          section: chunk.section,
          page: chunk.page,
          chunkIndex: chunk.chunkIndex,
          response: responseText,
        });

        completed = true;
      } catch (error) {
        lastError = error;
        console.error(
          `Chunk ${index + 1} attempt ${attempt}/${retries} failed:`,
          error.message,
        );

        if (attempt < retries) {
          await sleep(1000 * attempt);
        }
      }
    }

    if (!completed) {
      throw lastError || new Error(`Failed to analyze chunk ${index + 1}`);
    }
  }

  return analysis;
}

module.exports = analyzeChunks;
