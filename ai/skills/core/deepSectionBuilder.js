const sectionContentAgent = require("../../agents/sectionContentAgent");

async function buildNode(node, context) {
  const content = await sectionContentAgent({
    node,
    ...context,
  });

  let result = `\n${node.id} ${node.title}\n\n${content}\n`;

  if (node.items && node.items.length) {
    for (const child of node.items) {
      result += await buildNode(child, context);
    }
  }

  return result;
}

async function deepSectionBuilder({
  structure,
  unifiedModel,
  patterns,
  language,
}) {
  let output = "";

  for (const node of structure.items) {
    output += await buildNode(node, {
      unifiedModel,
      patterns,
      language,
    });
  }

  return output;
}

module.exports = deepSectionBuilder;
