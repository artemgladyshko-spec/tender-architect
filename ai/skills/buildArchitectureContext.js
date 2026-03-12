const normalizeText = (value) => String(value || "").trim();

const splitLines = (value) =>
  normalizeText(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const extractBulletItems = (value) =>
  splitLines(value)
    .filter((line) => /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "").trim());

const extractInlineList = (value) =>
  normalizeText(value)
    .split(/[:,]/)
    .slice(1)
    .join(":")
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);

const uniqueItems = (items) => [...new Set(items.filter(Boolean))];

const collectItems = (...sources) =>
  uniqueItems(
    sources.flatMap((source) => [
      ...extractBulletItems(source),
      ...extractInlineList(source),
    ]),
  );

const takeFirstSentence = (value, fallback = "") => {
  const text = normalizeText(value);

  if (!text) {
    return fallback;
  }

  const match = text.match(/(.+?[.!?])(\s|$)/);
  return match ? match[1].trim() : text.slice(0, 240).trim();
};

function buildArchitectureContext(analysisResults = {}) {
  const requirements = analysisResults.requirements || "";
  const actors = analysisResults.actors || "";
  const architecturePatterns =
    analysisResults.architecturePatterns ||
    analysisResults.architecture_patterns ||
    analysisResults.patterns ||
    "";
  const pbs = analysisResults.pbs || "";
  const domainModel =
    analysisResults.domainModel ||
    analysisResults.domain_model ||
    analysisResults.domain ||
    "";
  const architecture = analysisResults.architecture || "";
  const database = analysisResults.database || "";
  const api = analysisResults.api || "";
  const traceability = analysisResults.traceability || "";
  const estimation = analysisResults.estimation || "";
  const projectPlan =
    analysisResults.projectPlan ||
    analysisResults.project_plan ||
    analysisResults.projectPlanDetails ||
    "";

  return {
    systemPurpose: takeFirstSentence(
      requirements,
      "System purpose to be refined from analysis results.",
    ),
    stakeholders: collectItems(actors, requirements),
    actors: collectItems(actors),
    architectureStyle: takeFirstSentence(
      architecturePatterns || architecture,
      "Layered enterprise architecture.",
    ),
    coreServices: collectItems(architecture, pbs, api),
    modules: collectItems(pbs, architecture),
    integrations: collectItems(api, traceability, requirements),
    dataEntities: collectItems(domainModel),
    databases: collectItems(database),
    infrastructure: {
      runtime: takeFirstSentence(
        architecture,
        "Application runtime to be refined from architecture outputs.",
      ),
      deploymentModel: takeFirstSentence(
        projectPlan || architecture,
        "Deployment model to be defined during technical design.",
      ),
      scalability: takeFirstSentence(
        requirements,
        "Scalability requirements to be confirmed from non-functional requirements.",
      ),
      highAvailability: takeFirstSentence(
        architecture || requirements,
        "High-availability approach to be defined from infrastructure constraints.",
      ),
    },
    security: {
      authentication: takeFirstSentence(
        requirements,
        "Authentication requirements to be derived from the security analysis.",
      ),
      authorization: takeFirstSentence(
        actors || requirements,
        "Authorization model to be aligned with stakeholder roles.",
      ),
      encryption: takeFirstSentence(
        requirements,
        "Encryption requirements to be derived from the security and compliance sections.",
      ),
      auditing: takeFirstSentence(
        traceability || requirements,
        "Auditing requirements to be aligned with traceability and compliance outputs.",
      ),
    },
    projectPhases: collectItems(projectPlan, estimation),
    deliverables: collectItems(pbs, projectPlan),
  };
}

module.exports = buildArchitectureContext;
