const { getHistory, getAnalysisById } = require('../database/database');

async function getHistoryHandler(req, res) {
  try {
    const history = await getHistory();
    res.status(200).json(history || []);
  } catch (error) {
    console.error('History retrieval error:', error);
    res.status(500).json({ error: error.message || 'Unable to retrieve history' });
  }
}

async function getAnalysisByIdHandler(req, res) {
  try {
    const { id } = req.params;
    if (!id || isNaN(parseInt(id, 10))) {
      return res.status(400).json({ error: 'Valid ID is required' });
    }

    const analysis = await getAnalysisById(parseInt(id, 10));
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.status(200).json(analysis);
  } catch (error) {
    console.error('Analysis retrieval error:', error);
    res.status(500).json({ error: error.message || 'Unable to retrieve analysis' });
  }
}

module.exports = {
  getHistory: getHistoryHandler,
  getAnalysisById: getAnalysisByIdHandler,
};
