require("dotenv").config({
  path: require("path").resolve(__dirname, "../../apps/backend/.env"),
});

const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const skillsDir = path.join(__dirname, "../skills");

const MOCK_AI_ENABLED =
  String(process.env.MOCK_AI || "").toLowerCase() === "true";

const FALLBACK_TO_MOCK_ON_429 =
  String(process.env.FALLBACK_TO_MOCK_ON_429 || "true").toLowerCase() !==
  "false";

// =========================
// HELPERS
// =========================
const normalizePromptFile = (promptFile) =>
  String(promptFile || "").replace(/\\/g, "/");

function safeParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractJSON(text) {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : text;
}

// =========================
// MOCK
// =========================
const createMockResponse = (promptFile) => {
  return `Mock response for ${promptFile}`;
};

// =========================
// OPENAI INIT
// =========================
let openai = null;

if (!MOCK_AI_ENABLED) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is not defined. Check apps/backend/.env or enable MOCK_AI=true"
    );
  }

  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// =========================
// MAIN FUNCTION
// =========================
async function runPrompt(promptFile, input = {}, options = {}) {
  if (MOCK_AI_ENABLED) {
    return createMockResponse(promptFile);
  }

  const promptPath = path.join(
    skillsDir,
    normalizePromptFile(promptFile)
  );

  if (!fs.existsSync(promptPath)) {
    throw new Error(`Prompt not found: ${promptFile}`);
  }

  const prompt = fs.readFileSync(promptPath, "utf8");

  // =========================
  // LANGUAGE CONTROL
  // =========================
  const languageInstruction = input?.language
    ? `Respond ONLY in ${
        input.language === "ua" ? "Ukrainian" : "English"
      }.`
    : "";

  // =========================
  // SYSTEM RULES (🔥 VERY IMPORTANT)
  // =========================
  const systemInstruction = `
You are a senior enterprise solution architect.

CRITICAL RULES:

- You are generating a formal technical specification (NOT marketing text)
- Follow structure strictly if defined
- Do NOT skip sections
- Do NOT invent entities not present in input
- Use provided system model as source of truth
- Be consistent across sections
- Avoid generic phrases

If data is missing:
- Explicitly state limitation

If structure is defined:
- Follow numbering strictly (1, 1.1, 1.1.1)

`;

  // =========================
  // SKILLS INJECTION (🔥 CORE FEATURE)
  // =========================
  const skillsInjection = input?.selectedSkills
    ? `
========================
RELEVANT ARCHITECTURE KNOWLEDGE
========================
${input.selectedSkills}
`
    : "";

  // =========================
  // FINAL PROMPT
  // =========================
  const fullPrompt = `
${systemInstruction}

${languageInstruction}

========================
TASK
========================

${prompt}

${skillsInjection}

========================
INPUT MODEL
========================

${JSON.stringify(input, null, 2)}
`;

  let lastError = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        temperature: 0.2, // трохи креативності для тексту
        messages: [{ role: "user", content: fullPrompt }],
      });

      let output = completion.choices[0].message.content;

      // =========================
      // JSON MODE (STRICT)
      // =========================
      if (prompt.includes("STRICT JSON")) {
        const extracted = extractJSON(output);
        const parsed = safeParseJSON(extracted);

        if (parsed) {
          return JSON.stringify(parsed, null, 2);
        }

        // 🔥 AUTO FIX JSON
        const fixCompletion = await openai.chat.completions.create({
          model: "gpt-4o",
          temperature: 0,
          messages: [
            {
              role: "user",
              content: `
Fix this into VALID JSON ONLY. No explanations.

${output}
              `,
            },
          ],
        });

        const fixed = fixCompletion.choices[0].message.content;
        const fixedParsed = safeParseJSON(extractJSON(fixed));

        if (fixedParsed) {
          return JSON.stringify(fixedParsed, null, 2);
        }

        throw new Error("Failed to produce valid JSON");
      }

      // =========================
      // TEXT SANITY CHECK (🔥 ANTI-WATERFALL)
      // =========================
      if (
        output.length < 150 ||
        output.includes("This section describes") ||
        output.includes("In conclusion")
      ) {
        console.warn(
          `Weak output detected for ${promptFile}, retrying...`
        );
        continue;
      }

      return output;
    } catch (error) {
      lastError = error;

      if (error?.status === 429 && FALLBACK_TO_MOCK_ON_429) {
        console.warn(
          `Rate limit for ${promptFile}. Using mock fallback.`
        );
        return createMockResponse(promptFile);
      }
    }
  }

  throw lastError;
}

module.exports = runPrompt;