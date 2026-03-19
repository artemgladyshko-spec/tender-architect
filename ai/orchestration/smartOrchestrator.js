const loadSkills = require("../skills/loadSkills");

// =========================
// HELPERS
// =========================
function normalize(text) {
  return String(text || "").toLowerCase();
}

function includesAny(text, keywords) {
  return keywords.some((k) => text.includes(k));
}

// =========================
// CAPABILITY DETECTION
// =========================
function detectCapabilities({ system, pbs, dependencies }) {
  const text = normalize(
    JSON.stringify({ system, pbs, dependencies })
  );

  return {
    hasRBAC: includesAny(text, ["role", "permission", "access"]),
    hasAudit: includesAny(text, ["audit", "log", "trace"]),
    hasMultitenancy: includesAny(text, ["tenant", "organization"]),
    hasNotifications: includesAny(text, ["notification", "alert"]),
    hasIntegration: includesAny(text, ["integration", "api", "external"]),
  };
}

// =========================
// SKILL SCORING ENGINE 🔥
// =========================
function scoreSkill(skill, context) {
  let score = 0;

  const text = normalize(skill.content);
  const { capabilities, patterns } = context;

  // =========================
  // PATTERN MATCH (HIGH WEIGHT)
  // =========================
  if (Array.isArray(patterns)) {
    for (const p of patterns) {
      if (text.includes(normalize(p))) {
        score += 5;
      }
    }
  }

  // =========================
  // CAPABILITIES MATCH
  // =========================
  if (capabilities.hasRBAC && text.includes("rbac")) score += 4;
  if (capabilities.hasAudit && text.includes("audit")) score += 4;
  if (capabilities.hasMultitenancy && text.includes("tenant")) score += 4;
  if (capabilities.hasNotifications && text.includes("notification")) score += 3;
  if (capabilities.hasIntegration && text.includes("integration")) score += 3;

  // =========================
  // TYPE BOOST
  // =========================
  if (skill.type === "pattern") score += 2;

  return score;
}

// =========================
// MAIN ORCHESTRATOR
// =========================
function smartOrchestrator({ system = {}, pbs = {}, dependencies = [] }) {
  const { allSkills } = loadSkills();

  const capabilities = detectCapabilities({
    system,
    pbs,
    dependencies,
  });

  const detectedPatterns =
    system?.patterns?.detected_patterns ||
    system?.patterns ||
    [];

  const context = {
    capabilities,
    patterns: detectedPatterns,
  };

  // =========================
  // SCORE ALL SKILLS
  // =========================
  const scored = allSkills.map((skill) => ({
    ...skill,
    score: scoreSkill(skill, context),
  }));

  // =========================
  // FILTER + SORT
  // =========================
  const selected = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 15); // 🔥 limit

  return {
    capabilities,
    skills: selected,
  };
}

module.exports = smartOrchestrator;