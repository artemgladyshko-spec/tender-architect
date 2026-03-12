require("dotenv").config({
  path: require("path").resolve(__dirname, "../../apps/backend/.env")
});

const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const MOCK_AI_ENABLED = String(process.env.MOCK_AI || "").toLowerCase() === "true";
const FALLBACK_TO_MOCK_ON_429 =
  String(process.env.FALLBACK_TO_MOCK_ON_429 || "true").toLowerCase() !== "false";

const createMockResponse = (promptFile, input) => {
  switch (promptFile) {
    case "requirements_analyzer.md":
      return [
        "# Functional Requirements",
        "- Submit tender application",
        "- Review supplier proposal",
        "",
        "# Non-Functional Requirements",
        "- Support 10000 concurrent users",
        "- Maintain complete audit logging",
        "",
        "# External Integrations",
        "- Government registry lookup",
        "- SSO identity provider",
        "",
        "# Security Requirements",
        "- Role-based access control",
        "- Encryption at rest and in transit",
      ].join("\n");
    case "actor_detector.md":
      return "Actors: Procurement Officer, Evaluator, Supplier";
    case "architecture_pattern_detector.md":
      return "Patterns: CQRS, layered architecture, service orchestration";
    case "pbs_generator.md":
      return "PBS: Tender Portal, Evaluation Workflow, Reporting, Integration Layer";
    case "domain_model_generator.md":
      return "Domain Model: Tender, Submission, Evaluation, Contract, AuditEvent";
    case "architecture_designer.md":
      return "Architecture: React frontend, backend services, integration layer, read models, audit services";
    case "database_designer.md":
      return "Database: PostgreSQL operational store, read-model projections, audit storage";
    case "api_designer.md":
      return "API: REST endpoints for tenders, submissions, evaluations, reporting, integrations";
    case "traceability_mapper.md":
      return "Traceability: Requirements mapped to PBS, architecture, API, and database";
    case "architecture_reviewer.md":
      return "Review: Architecture is feasible and aligned with enterprise delivery practices";
    case "estimator.md":
      return [
        "## Team Structure",
        "",
        "- Solution Architect",
        "- Backend Developers",
        "- Frontend Developer",
        "- QA Engineer",
        "",
        "## Project Timeline",
        "",
        "- 6 months estimated duration",
        "",
        "## Summary",
        "",
        "- Indicative implementation cost requires commercial confirmation",
      ].join("\n");
    case "project_manager.md":
      return [
        "## Project Phases",
        "",
        "- Discovery and architecture",
        "- Iterative implementation",
        "- Testing and deployment",
        "",
        "## Risks",
        "",
        "- Integration dependency delays",
        "",
        "## Dependencies",
        "",
        "- Approved architecture baseline",
        "",
        "## Milestones",
        "",
        "- Architecture sign-off",
        "- MVP release",
      ].join("\n");
    case "proposal_writer.md":
      return "Technical proposal: enterprise tender solution delivery plan.";
    default:
      return `Mock output for ${promptFile}`;
  }
};

let openai = null;

if (!MOCK_AI_ENABLED) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not defined. Check apps/backend/.env or enable MOCK_AI=true");
  }

  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

async function runPrompt(promptFile, input) {
  if (MOCK_AI_ENABLED) {
    return createMockResponse(promptFile, input);
  }

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

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.2,
      messages: [{ role: "user", content: fullPrompt }],
    });

    return completion.choices[0].message.content;
  } catch (error) {
    if (error?.status === 429) {
      if (FALLBACK_TO_MOCK_ON_429) {
        console.warn(
          `OpenAI quota/rate-limit hit for ${promptFile}. Falling back to mock output.`,
        );
        return createMockResponse(promptFile, input);
      }

      throw new Error(
        "OpenAI quota exceeded. Update billing or enable MOCK_AI=true in apps/backend/.env.",
      );
    }

    throw error;
  }
}

module.exports = runPrompt;
