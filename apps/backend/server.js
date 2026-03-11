const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

require("dotenv").config();

const parseDocument = require("./utils/parseDocument");
const runTenderPipeline = require("../../ai/pipelines/runTenderPipeline");
const generateDocx = require("./utils/docxGenerator");

const app = express();

const rootDir = path.resolve(__dirname, "..", "..");

const uploadDir = path.join(rootDir, "data", "inputs", "tor");
const proposalDir = path.join(rootDir, "data", "outputs", "proposal");

fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(proposalDir, { recursive: true });

app.use(express.json());
app.use(cors());

/*
MULTER STORAGE CONFIG
Preserve original extension so parser can detect file type
*/

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + ext;
    cb(null, filename);
  }
});

const upload = multer({ storage });


/*
UPLOAD TOR
*/

app.post("/upload-tor", upload.single("file"), (req, res) => {

  if (!req.file) {
    return res.status(400).json({
      error: "No file uploaded"
    });
  }

  res.json({
    message: "File uploaded successfully",
    filename: req.file.filename
  });

});


/*
RUN FULL ANALYSIS PIPELINE
*/

app.post("/run-analysis", async (req, res) => {

  try {

    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({
        error: "Filename not provided"
      });
    }

    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: "Uploaded file not found"
      });
    }

    console.log("Reading file:", filePath);

    /*
    PARSE DOCUMENT
    */

    const torText = await parseDocument(filePath);

    console.log("Document parsed successfully");

    /*
    RUN AI PIPELINE
    */

    console.time("Pipeline");

    const results = await runTenderPipeline({
      tor: torText
    });

    console.timeEnd("Pipeline");

    console.log("Pipeline completed");

    /*
    SAVE MARKDOWN RESULT
    */

    const proposalMarkdown =
      results.proposal || JSON.stringify(results, null, 2);

    const mdPath = path.join(
      proposalDir,
      "technical_proposal.md"
    );

    fs.writeFileSync(mdPath, proposalMarkdown);

    /*
    GENERATE DOCX
    */

    const docxPath = path.join(
      proposalDir,
      "technical_proposal.docx"
    );

    await generateDocx(
      proposalMarkdown,
      docxPath
    );

    /*
    RESPONSE
    */

    res.json({
      message: "Pipeline completed",
      results
    });

  } catch (error) {

    console.error("PIPELINE ERROR:", error);

    res.status(500).json({
      error: "Pipeline failed",
      details: error.message
    });

  }

});


/*
DOWNLOAD FINAL PROPOSAL
*/

app.get("/download-proposal", (req, res) => {

  const filePath = path.join(
    proposalDir,
    "technical_proposal.docx"
  );

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      error: "Proposal not generated yet"
    });
  }

  res.download(filePath);

});


/*
SERVER START
*/

const PORT = 3001;

app.listen(PORT, () => {

  console.log(`Tender Architect API running on port ${PORT}`);

});