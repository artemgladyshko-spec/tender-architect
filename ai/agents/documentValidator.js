function documentValidator(sections) {
  const issues = [];

  Object.entries(sections).forEach(([key, content]) => {
    if (!content || content.length < 200) {
      issues.push({
        section: key,
        issue: "Section too short or empty",
      });
    }

    if (content.includes("Lorem") || content.includes("TBD")) {
      issues.push({
        section: key,
        issue: "Contains placeholder text",
      });
    }
  });

  return {
    valid: issues.length === 0,
    issues,
  };
}

module.exports = documentValidator;