const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

async function extractText(pdfPath) {
  const resolvedPath = path.resolve(pdfPath);

  try {
    await fs.promises.access(resolvedPath, fs.constants.R_OK);

    const fileBuffer = await fs.promises.readFile(resolvedPath);
    const data = await pdf(fileBuffer);

    const rawText = typeof data.text === 'string' ? data.text : '';
    const normalized = rawText.replace(/\s+/g, ' ').trim();

    return normalized;
  } catch (error) {
    throw new Error(`Failed to extract PDF text: ${error.message}`);
  }
}

module.exports = {
  extractText,
};
