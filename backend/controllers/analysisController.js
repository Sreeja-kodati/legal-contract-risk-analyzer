const { retrieveContext } = require('../services/ragService');
const { analyzeContract } = require('../services/analysisService');
const { saveAnalysis } = require('../database/database');

async function askQuestion(req, res) {
  try {
    const { question, contractName } = req.body;
    if (typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const context = await retrieveContext(question);
    const analysis = await analyzeContract(context, question);

    const historyEntry = {
      filename: contractName || `Contract Analysis - ${question.substring(0, 60)}`,
      riskScore: analysis.riskScore,
      riskLevel: analysis.riskLevel,
      summary: analysis.summary,
      redFlags: JSON.stringify(analysis.redFlags || []),
      recommendations: JSON.stringify(analysis.recommendations || []),
    };

    try {
      await saveAnalysis(historyEntry);
    } catch (saveError) {
      console.warn('Unable to save analysis history:', saveError);
    }

    res.status(200).json({
      question,
      context,
      analysis,
    });
  } catch (error) {
    console.error('Analysis endpoint error:', error);
    res.status(500).json({ error: error.message || 'Analysis failed' });
  }
}

module.exports = {
  askQuestion,
};
