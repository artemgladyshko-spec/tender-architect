const DEFAULT_MAX_CHUNK_SIZE = 1200;
const DEFAULT_OVERLAP = 200;

const estimateTokens = (text) => {
  if (!text) {
    return 0;
  }

  return Math.ceil(text.trim().split(/\s+/).length * 1.33);
};

const sliceByTokenWindow = (words, startWord, endWord) =>
  words.slice(startWord, endWord).join(" ").trim();

function chunkDocument(
  sections,
  options = {},
) {
  const maxChunkSize = options.maxChunkSize || DEFAULT_MAX_CHUNK_SIZE;
  const overlap = options.overlap || DEFAULT_OVERLAP;
  const targetWords = Math.max(1, Math.floor(maxChunkSize / 1.33));
  const overlapWords = Math.max(0, Math.floor(overlap / 1.33));

  const chunks = [];

  sections.forEach((section) => {
    const words = String(section.content || "")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean);

    if (!words.length) {
      return;
    }

    let start = 0;
    let chunkIndex = 1;

    while (start < words.length) {
      const end = Math.min(words.length, start + targetWords);
      const text = sliceByTokenWindow(words, start, end);

      chunks.push({
        section: section.title,
        page: section.page || 1,
        chunkIndex,
        text,
        estimatedTokens: estimateTokens(text),
      });

      if (end >= words.length) {
        break;
      }

      start = Math.max(0, end - overlapWords);
      chunkIndex += 1;
    }
  });

  return chunks;
}

module.exports = chunkDocument;
