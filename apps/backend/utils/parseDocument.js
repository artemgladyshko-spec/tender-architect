const fs = require("fs/promises");
const path = require("path");
const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");

const SUPPORTED_EXTENSIONS = new Set([".pdf", ".docx"]);

async function parsePdf(filePath) {
  const buffer = await fs.readFile(filePath);
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return (result.text || "").trim();
  } finally {
    await parser.destroy();
  }
}

async function parseDocx(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return (result.value || "").trim();
}

async function parseDocument(filePath) {
  if (!filePath || typeof filePath !== "string") {
    throw new Error("filePath is required");
  }

  const ext = path.extname(filePath).toLowerCase();

  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    throw new Error(`Unsupported file format: ${ext || "unknown"}`);
  }

  let text = "";

  if (ext === ".pdf") {
    text = await parsePdf(filePath);
  }

  if (ext === ".docx") {
    text = await parseDocx(filePath);
  }

  if (!text || !text.trim()) {
    throw new Error(`No extractable text found in ${path.basename(filePath)}`);
  }

  return text.trim();
}

module.exports = parseDocument;
