const fs = require("fs");
const { Document, Packer, Paragraph } = require("docx");

async function generateDocx(text, outputPath) {

  const paragraphs =
    text.split("\n").map(
      line => new Paragraph(line)
    );

  const doc = new Document({
    sections: [
      {
        children: paragraphs
      }
    ]
  });

  const buffer =
    await Packer.toBuffer(doc);

  fs.writeFileSync(outputPath, buffer);
}

module.exports = generateDocx;