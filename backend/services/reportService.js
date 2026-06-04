const PDFDocument = require('pdfkit');

function formatList(items, formatter) {
  return items.map((item, index) => `${index + 1}. ${formatter(item)}`).join('\n\n');
}

function addSection(doc, title, content) {
  doc.fontSize(14).fillColor('#000').text(title, { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor('#333').text(content, { lineGap: 4 });
  doc.moveDown(1);
}

async function generateReportPdf(reportData) {
  const {
    contractName = 'Contract Analysis',
    summary = '',
    riskScore = 0,
    riskLevel = 'unknown',
    redFlags = [],
    missingClauses = [],
    recommendations = [],
  } = reportData;

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      doc.fontSize(20).fillColor('#111').text('Contract Risk Analysis Report', {
        align: 'center',
      });
      doc.moveDown(1);

      doc.fontSize(12).fillColor('#555').text(`Generated: ${new Date().toISOString()}`, {
        align: 'center',
      });
      doc.moveDown(2);

      addSection(doc, 'Contract Name', contractName);
      addSection(doc, 'Summary', summary);

      const riskContent = `Risk Score: ${riskScore}\nRisk Level: ${riskLevel.toUpperCase()}`;
      addSection(doc, 'Risk Overview', riskContent);

      if (Array.isArray(redFlags) && redFlags.length) {
        const redFlagText = formatList(redFlags, (item) => {
          const description = item.description || item.text || 'No description available';
          const severity = item.severity || item.riskLevel || 'unknown';
          const mitigation = item.mitigation || item.recommendation || 'No mitigation provided';
          return `ID: ${item.id || item.type || 'N/A'}\nSeverity: ${severity}\nDescription: ${description}\nMitigation: ${mitigation}`;
        });
        addSection(doc, 'Red Flags', redFlagText);
      } else {
        addSection(doc, 'Red Flags', 'No red flags identified.');
      }

      if (Array.isArray(missingClauses) && missingClauses.length) {
        const missingText = formatList(missingClauses, (item) => {
          return `Clause Type: ${item.type || 'Unknown'}\nReason: ${item.reason || 'Not provided'}\nRecommendation: ${item.recommendation || 'Not provided'}`;
        });
        addSection(doc, 'Missing Clauses', missingText);
      } else {
        addSection(doc, 'Missing Clauses', 'No missing clauses identified.');
      }

      if (Array.isArray(recommendations) && recommendations.length) {
        const recommendationText = formatList(recommendations, (item) => {
          return `ID: ${item.id || 'N/A'}\nArea: ${item.area || 'General'}\nAction: ${item.action || 'Not provided'}\nPriority: ${item.priority || 'medium'}`;
        });
        addSection(doc, 'Recommendations', recommendationText);
      } else {
        addSection(doc, 'Recommendations', 'No recommendations provided.');
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  generateReportPdf,
};