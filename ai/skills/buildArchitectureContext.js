function safeArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

function unique(arr) {
  return [...new Set(arr.filter(Boolean))];
}

function buildArchitectureContext(input = {}) {
  const {
    requirements = {},
    system = {},
    pbs = {},
    dependencies = [],
    patterns = {},
    domainModel = {},
    architecture = {},
    api = {},
    database = {},
    validation = {},
  } = input;

  // =========================
  // SYSTEM
  // =========================
  const systemPurpose =
    system?.purpose ||
    requirements?.summary ||
    "System purpose derived from tender requirements.";

  const actors = unique([
    ...(system?.actors || []),
    ...(requirements?.actors || []),
  ]);

  // =========================
  // CORE STRUCTURE
  // =========================
  const modules = unique([
    ...(pbs?.modules || []),
    ...(pbs?.items || []),
  ]);

  const coreServices = unique([
    ...(architecture?.services || []),
    ...(system?.services || []),
  ]);

  const coreDomains = unique([
    ...(domainModel?.domains || []),
    ...(system?.domains || []),
  ]);

  // =========================
  // DATA
  // =========================
  const dataEntities = unique([
    ...(domainModel?.entities || []),
  ]);

  const databases = unique([
    ...(database?.databases || []),
  ]);

  // =========================
  // INTEGRATIONS
  // =========================
  const integrations = unique([
    ...(api?.integrations || []),
    ...(system?.integrations || []),
  ]);

  // =========================
  // INFRASTRUCTURE
  // =========================
  const infrastructure = {
    runtime:
      architecture?.runtime ||
      system?.runtime ||
      "Defined in architecture design",

    deploymentModel:
      system?.deployment ||
      "Defined in implementation plan",

    scalability:
      requirements?.scalability ||
      "Derived from non-functional requirements",

    highAvailability:
      system?.availability ||
      "High availability strategy to be defined",
  };

  // =========================
  // SECURITY (PATTERN-AWARE 🔥)
  // =========================
  const detectedPatterns =
    patterns?.detected_patterns || patterns || [];

  const hasRBAC = detectedPatterns.some((p) =>
    p.toLowerCase().includes("rbac")
  );

  const hasAudit = detectedPatterns.some((p) =>
    p.toLowerCase().includes("audit")
  );

  const security = {
    authentication:
      system?.security?.authentication || "Authentication required",

    authorization: hasRBAC
      ? "RBAC enforced (Role-Based Access Control)"
      : "Authorization model to be defined",

    encryption:
      system?.security?.encryption ||
      "Encryption required for data in transit and at rest",

    auditing: hasAudit
      ? "Audit logging required (immutable audit trail)"
      : "Audit requirements to be defined",
  };

  // =========================
  // RETURN CONTEXT
  // =========================
  return {
    systemPurpose,
    actors,

    coreDomains,
    coreServices,
    modules,

    integrations,

    dataEntities,
    databases,

    infrastructure,
    security,

    patterns: detectedPatterns,
    dependencies,

    validation, // pass-through for later stages
  };
}

module.exports = buildArchitectureContext;