require("dotenv").config({
  path: require("path").resolve(__dirname, "../../apps/backend/.env")
});

const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not defined. Check apps/backend/.env");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function runPrompt(promptFile, input) {
  const promptPath = path.join(__dirname, "../prompts", promptFile);
  const prompt = fs.readFileSync(promptPath, "utf8");

  const fullPrompt = `

You are a senior enterprise architect.

========================
TASK
========================

${prompt}

========================
INPUT
========================

${JSON.stringify(input, null, 2)}

`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.2,
    messages: [{ role: "user", content: fullPrompt }],
  });

  return completion.choices[0].message.content;
}

module.exports = runPrompt;
