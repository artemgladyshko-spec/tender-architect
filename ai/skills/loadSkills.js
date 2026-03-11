const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");

const loadMarkdownTree = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    return "";
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  let content = "";

  entries.forEach((entry) => {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      content += loadMarkdownTree(fullPath);
      return;
    }

    if (!entry.isFile() || !entry.name.endsWith(".md")) {
      return;
    }

    content += [
      `### Skill File: ${entry.name}`,
      "",
      fs.readFileSync(fullPath, "utf8"),
      "",
    ].join("\n");
  });

  return content.trim();
};

function loadSkills() {
  return {
    backendArchitectureSkills: loadMarkdownTree(
      path.join(rootDir, "prompts", "architect"),
    ),
    uiArchitectureSkills: loadMarkdownTree(
      path.join(rootDir, "prompts", "ui-architect"),
    ),
  };
}

module.exports = loadSkills;
