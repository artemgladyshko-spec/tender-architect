const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const cors = require("cors");

require("dotenv").config();

const parseDocument = require("./utils/parseDocument");
const runTenderPipeline = require("../../ai/pipelines/runTenderPipeline");
const generateDocx = require("./utils/docxGenerator");

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const rootDir = path.resolve(__dirname, "..", "..");
const uploadDir = path.join(rootDir, "data", "inputs", "tor");
const proposalDir = path.join(rootDir, "data", "outputs", "proposal");
const markdownProposalPath = path.join(proposalDir, "technical_proposal.md");
const docxProposalPath = path.join(proposalDir, "technical_proposal.docx");
const MAX_UPLOADS_TO_KEEP = 3;

const ALLOWED_EXTENSIONS = new Set([".pdf", ".docx"]);
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(proposalDir, { recursive: true });

class HttpError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

function log(level, message, meta) {
  const timestamp = new Date().toISOString();

  if (meta === undefined) {
    console[level](`[${timestamp}] ${message}`);
    return;
  }

  console[level](`[${timestamp}] ${message}`, meta);
}

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function jsonError(statusCode, message, details) {
  return {
    error: {
      message,
      ...(details ? { details } : {}),
    },
    ok: false,
  };
}

function deleteFileIfExists(filePath, reason) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  fs.unlinkSync(filePath);
  log("info", "Deleted file", {
    filePath,
    reason,
  });
  return true;
}

function cleanupDirectoryExcept(directoryPath, keepFilenames, reason) {
  const keepSet = new Set(keepFilenames);
  const deletedFiles = [];

  for (const entry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
    if (!entry.isFile()) {
      continue;
    }

    if (keepSet.has(entry.name)) {
      continue;
    }

    const entryPath = path.join(directoryPath, entry.name);
    fs.unlinkSync(entryPath);
    deletedFiles.push(entry.name);
  }

  if (deletedFiles.length > 0) {
    log("info", "Cleaned directory", {
      directoryPath,
      deletedFiles,
      reason,
    });
  }

  return deletedFiles;
}

function cleanupOldestFiles(directoryPath, filesToKeep, reason) {
  const files = fs
    .readdirSync(directoryPath, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const entryPath = path.join(directoryPath, entry.name);
      const stats = fs.statSync(entryPath);

      return {
        name: entry.name,
        path: entryPath,
        createdAt: stats.birthtimeMs || stats.mtimeMs,
      };
    })
    .sort((left, right) => right.createdAt - left.createdAt);

  const deletedFiles = [];

  for (const file of files.slice(filesToKeep)) {
    fs.unlinkSync(file.path);
    deletedFiles.push(file.name);
  }

  if (deletedFiles.length > 0) {
    log("info", "Pruned old files", {
      directoryPath,
      deletedFiles,
      filesToKeep,
      reason,
    });
  }

  return deletedFiles;
}

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.use((req, res, next) => {
  res.type("application/json");
  next();
});

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : "";
    cb(null, `${Date.now()}-${crypto.randomUUID()}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024,
    files: 1,
  },
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const mimeType = (file.mimetype || "").toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      cb(new HttpError(400, "Unsupported file extension", { ext }));
      return;
    }

    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      cb(new HttpError(400, "Unsupported file type", { mimeType }));
      return;
    }

    cb(null, true);
  },
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "tender-architect-backend",
    timestamp: new Date().toISOString(),
  });
});

app.post("/upload-tor", (req, res, next) => {
  upload.single("file")(req, res, (error) => {
    if (error) {
      next(error);
      return;
    }

    if (!req.file) {
      next(new HttpError(400, "No file uploaded"));
      return;
    }

    log("info", "Uploaded ToR file", {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    cleanupOldestFiles(
      uploadDir,
      MAX_UPLOADS_TO_KEEP,
      "retain the latest uploaded ToR files"
    );

    res.json({
      ok: true,
      filename: req.file.filename,
    });
  });
});

app.post("/run-analysis", asyncHandler(async (req, res) => {
  const { filename } = req.body || {};

  if (!filename || typeof filename !== "string") {
    throw new HttpError(400, "filename is required");
  }

  const resolvedPath = path.resolve(uploadDir, filename);

  if (!resolvedPath.startsWith(uploadDir)) {
    throw new HttpError(400, "Invalid filename");
  }

  if (!fs.existsSync(resolvedPath)) {
    throw new HttpError(404, "Uploaded file not found", { filename });
  }

  log("info", "Starting analysis pipeline", { filename });
  console.time(`pipeline:${filename}`);

  try {
    const torText = await parseDocument(resolvedPath);

    log("info", "Document parsed successfully", {
      filename,
      characters: torText.length,
    });

    const results = await runTenderPipeline(
      { tor: torText },
      {
        onStatusUpdate(entry) {
          log("info", "Pipeline step update", entry);
        },
      }
    );

    const proposalMarkdown =
      typeof results.proposal === "string" && results.proposal.trim()
        ? results.proposal
        : JSON.stringify(results, null, 2);

    deleteFileIfExists(markdownProposalPath, "replace previous markdown proposal");
    deleteFileIfExists(docxProposalPath, "replace previous docx proposal");
    fs.writeFileSync(markdownProposalPath, proposalMarkdown, "utf8");
    await generateDocx(proposalMarkdown, docxProposalPath);

    log("info", "Pipeline completed successfully", {
      filename,
      markdownProposalPath,
      docxProposalPath,
    });

    res.json({
      ok: true,
      results,
    });
  } catch (error) {
    log("error", "Pipeline execution failed", {
      filename,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  } finally {
    console.timeEnd(`pipeline:${filename}`);
  }
}));

app.get("/download-proposal", asyncHandler(async (req, res) => {
  if (!fs.existsSync(docxProposalPath)) {
    throw new HttpError(404, "Proposal not generated yet");
  }

  log("info", "Downloading proposal", { docxProposalPath });

  res.download(docxProposalPath, "technical_proposal.docx", (error) => {
    if (error && !res.headersSent) {
      res.status(500).json(jsonError(500, "Failed to download proposal"));
    }
  });
}));

app.use((req, res) => {
  res.status(404).json(jsonError(404, "Route not found", {
    method: req.method,
    path: req.originalUrl,
  }));
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof multer.MulterError) {
    const statusCode = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    log("warn", "Multer error", { code: error.code, message: error.message });
    res.status(statusCode).json(jsonError(statusCode, error.message, {
      code: error.code,
    }));
    return;
  }

  const statusCode = error.statusCode || 500;

  log(statusCode >= 500 ? "error" : "warn", "Request failed", {
    method: req.method,
    path: req.originalUrl,
    message: error.message,
    details: error.details,
    stack: statusCode >= 500 ? error.stack : undefined,
  });

  res.status(statusCode).json(
    jsonError(
      statusCode,
      error.message || "Internal server error",
      error.details
    )
  );
});

app.listen(PORT, () => {
  log("info", `Tender Architect API running on port ${PORT}`);
});
