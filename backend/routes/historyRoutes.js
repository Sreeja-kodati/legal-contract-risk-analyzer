const express = require('express');
const { getHistory, getAnalysisById } = require('../controllers/historyController');

const router = express.Router();

router.get('/history', getHistory);
router.get('/history/:id', getAnalysisById);

module.exports = router;
