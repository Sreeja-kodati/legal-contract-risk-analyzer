const { extractText } = require('../services/pdfService');
const { generateEmbedding } = require('../services/embeddingService');
const { compareContractsLLM } = require('../services/analysisService');

async function compareContracts(req, res) {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: 'Two PDF files are required for comparison' });
    }

    const file1 = req.files[0];
    const file2 = req.files[1];

    console.log('[CompareController] Extracting text from:', file1.originalname, 'and', file2.originalname);
    const text1 = await extractText(file1.path);
    const text2 = await extractText(file2.path);

    // Run stubs for embedding generation to verify embedding flow
    try {
      await generateEmbedding(text1.substring(0, 500));
      await generateEmbedding(text2.substring(0, 500));
    } catch (e) {
      console.warn('[CompareController] Warning during stub embedding generation:', e.message);
    }

    console.log('[CompareController] Comparing contracts using LLM comparison service...');
    const comparison = await compareContractsLLM(text1, text2);

    res.status(200).json({
      paymentTerms: comparison.paymentTerms,
      penalties: comparison.penalties,
      liability: comparison.liability,
      confidentiality: comparison.confidentiality,
      termination: comparison.termination,
    });
  } catch (error) {
    console.error('Comparison error:', error);
    res.status(500).json({ error: error.message || 'Comparison failed' });
  }
}

module.exports = {
  compareContracts,
};
