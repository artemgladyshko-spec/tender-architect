const HEADING_PATTERNS = [
  { key: "introduction", title: "Introduction", regex: /^(?:\d+(?:\.\d+)*)\s+introduction$/i },
  { key: "system_overview", title: "System Overview", regex: /^(?:\d+(?:\.\d+)*)\s+system overview$/i },
  { key: "functional_requirements", title: "Functional Requirements", regex: /^(?:\d+(?:\.\d+)*)\s+functional requirements$/i },
  { key: "non_functional_requirements", title: "Non Functional Requirements", regex: /^(?:\d+(?:\.\d+)*)\s+non[\s-]*functional requirements$/i },
  { key: "integration_requirements", title: "Integration Requirements", regex: /^(?:\d+(?:\.\d+)*)\s+integration requirements$/i },
  { key: "security_requirements", title: "Security Requirements", regex: /^(?:\d+(?:\.\d+)*)\s+security requirements$/i },
  { key: "architecture_constraints", title: "Architecture Constraints", regex: /^(?:\d+(?:\.\d+)*)\s+architecture constraints$/i },
  { key: "deliverables", title: "Deliverables", regex: /^(?:\d+(?:\.\d+)*)\s+deliverables$/i },
  { key: "deadlines", title: "Deadlines", regex: /^(?:\d+(?:\.\d+)*)\s+deadlines$/i },
  { key: "annexes", title: "Annexes", regex: /^(?:\d+(?:\.\d+)*)\s+annexes$/i },
];

const normalizeText = (text) =>
  text
    .replace(/\r/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const getPageFromOffset = (pageOffsets, offset) => {
  let page = 1;

  for (const pageMeta of pageOffsets) {
    if (offset >= pageMeta.start) {
      page = pageMeta.page;
      continue;
    }

    break;
  }

  return page;
};

const buildPageOffsets = (text) => {
  const pages = text.split(/\f+/);
  const offsets = [];
  let cursor = 0;

  pages.forEach((pageText, index) => {
    offsets.push({
      page: index + 1,
      start: cursor,
    });

    cursor += pageText.length + 1;
  });

  return offsets;
};

const fallbackParagraphSections = (text, pageOffsets) => {
  const paragraphs = normalizeText(text)
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const sections = [];
  let buffer = [];
  let cursor = 0;
  let page = 1;

  paragraphs.forEach((paragraph, index) => {
    const paragraphIndex = text.indexOf(paragraph, cursor);

    if (paragraphIndex >= 0) {
      cursor = paragraphIndex + paragraph.length;
      page = getPageFromOffset(pageOffsets, paragraphIndex);
    }

    buffer.push(paragraph);

    if (buffer.join("\n\n").length >= 3500 || index === paragraphs.length - 1) {
      sections.push({
        title: `Document Segment ${sections.length + 1}`,
        content: buffer.join("\n\n"),
        page,
      });
      buffer = [];
    }
  });

  return sections.length
    ? sections
    : [
        {
          title: "Document",
          content: normalizeText(text),
          page: 1,
        },
      ];
};

function parseSections(documentText) {
  const rawText = typeof documentText === "string" ? documentText : "";
  const text = normalizeText(rawText);

  if (!text) {
    return [];
  }

  const pageOffsets = buildPageOffsets(rawText);
  const lines = text.split("\n");
  const detectedSections = [];
  let currentSection = null;
  let consumedHeadingCount = 0;
  let textCursor = 0;

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      if (currentSection) {
        currentSection.lines.push("");
      }
      return;
    }

    const headingMatch = HEADING_PATTERNS.find((pattern) =>
      pattern.regex.test(trimmedLine),
    );

    const lineIndex = rawText.indexOf(trimmedLine, textCursor);

    if (lineIndex >= 0) {
      textCursor = lineIndex + trimmedLine.length;
    }

    if (headingMatch) {
      consumedHeadingCount += 1;

      if (currentSection && currentSection.lines.join(" ").trim()) {
        detectedSections.push({
          title: currentSection.title,
          content: currentSection.lines.join("\n").trim(),
          page: currentSection.page,
        });
      }

      currentSection = {
        title: headingMatch.title,
        page: getPageFromOffset(pageOffsets, Math.max(lineIndex, 0)),
        lines: [],
      };
      return;
    }

    if (!currentSection) {
      currentSection = {
        title: "General",
        page: getPageFromOffset(pageOffsets, Math.max(lineIndex, 0)),
        lines: [],
      };
    }

    currentSection.lines.push(trimmedLine);
  });

  if (currentSection && currentSection.lines.join(" ").trim()) {
    detectedSections.push({
      title: currentSection.title,
      content: currentSection.lines.join("\n").trim(),
      page: currentSection.page,
    });
  }

  if (consumedHeadingCount === 0 || detectedSections.length <= 1) {
    return fallbackParagraphSections(rawText, pageOffsets);
  }

  return detectedSections;
}

module.exports = parseSections;
