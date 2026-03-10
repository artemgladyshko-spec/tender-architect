const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const OpenAI = require("openai");

const app = express();
app.use(express.json());
app.use(cors());

const upload = multer({ dest: "a-inputs/tor/" });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


// -----------------------------
// Upload ToR
// -----------------------------

app.post("/upload-tor", upload.single("file"), (req, res) => {
  res.json({
    message: "File uploaded successfully",
    filename: req.file.filename
  });
});


// -----------------------------
// Run Analysis Pipeline
// -----------------------------

app.post("/run-analysis", async (req, res) => {

  try {

    const torFile = req.body.filename;

    const torPath = path.join("a-inputs/tor/", torFile);
    const torText = fs.readFileSync(torPath, "utf8");

    // -----------------------------
    // STEP 1 — REQUIREMENTS
    // -----------------------------

    const requirementsPrompt = fs.readFileSync(
      "a-process/prompts/requirements_analyzer.md",
      "utf8"
    );

    const requirementsResult = await runAI(requirementsPrompt, torText);

    fs.writeFileSync(
      "a-process/analysis/requirements.md",
      requirementsResult
    );


    // -----------------------------
    // STEP 2 — ACTORS
    // -----------------------------

    const actorsPrompt = fs.readFileSync(
      "a-process/prompts/actor_detector.md",
      "utf8"
    );

    const actorsResult = await runAI(actorsPrompt, requirementsResult);

    fs.writeFileSync(
      "a-process/actors/actors.md",
      actorsResult
    );


    // -----------------------------
    // STEP 3 — ARCH PATTERNS
    // -----------------------------

    const patternPrompt = fs.readFileSync(
      "a-process/prompts/architecture_pattern_detector.md",
      "utf8"
    );

    const patternResult = await runAI(patternPrompt, requirementsResult);

    fs.writeFileSync(
      "a-process/analysis/architecture_patterns.md",
      patternResult
    );


    // -----------------------------
    // STEP 4 — PBS
    // -----------------------------

    const pbsPrompt = fs.readFileSync(
      "a-process/prompts/pbs_generator.md",
      "utf8"
    );

    const pbsInput = requirementsResult + "\n\n" + actorsResult;

    const pbsResult = await runAI(pbsPrompt, pbsInput);

    fs.writeFileSync(
      "a-process/pbs/pbs.md",
      pbsResult
    );


    res.json({
      message: "Analysis pipeline finished successfully"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Pipeline failed"
    });

  }

});


// -----------------------------
// AI CALL FUNCTION
// -----------------------------

async function runAI(prompt, input) {

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: prompt
      },
      {
        role: "user",
        content: input
      }
    ]
  });

  return response.choices[0].message.content;

}


// -----------------------------

app.listen(3001, () => {
  console.log("Tender Architect server running on port 3001");
});