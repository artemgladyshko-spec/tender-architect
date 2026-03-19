const fs = require("fs");
const path = require("path");

const skillsRoot = path.resolve(__dirname);

// =========================
// LOAD ALL SKILLS (STRUCTURED)
// =========================
function loadAllSkills(dir, basePath = "") {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  let skills = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      skills = skills.concat(loadAllSkills(fullPath, relativePath));
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;

    const content = fs.readFileSync(fullPath, "utf8");

    skills.push({
      name: entry.name.replace(".md", ""),
      path: relativePath.replace(/\\/g, "/"),
      content,
      type: detectSkillType(relativePath),
    });
  }

  return skills;
}

// =========================
// DETECT TYPE
// =========================
function detectSkillType(filePath) {
  const p = filePath.toLowerCase();

  if (p.includes("patterns")) return "pattern";
  if (p.includes("ui")) return "ui";
  if (p.includes("architecture")) return "architecture";
  if (p.includes("data")) return "data";
  if (p.includes("integration")) return "integration";

  return "general";
}

// =========================
// MAIN EXPORT
// =========================
function loadSkills() {
  const allSkills = loadAllSkills(skillsRoot);

  return {
    allSkills,

    // 🔥 filtered groups (optional)
    patternSkills: allSkills.filter((s) => s.type === "pattern"),
    architectureSkills: allSkills.filter((s) => s.type === "architecture"),
    uiSkills: allSkills.filter((s) => s.type === "ui"),
  };
}

module.exports = loadSkills;