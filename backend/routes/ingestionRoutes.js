const express = require('express');
const { ingestContract } = require('../controllers/ingestionController');

const router = express.Router();

router.post('/ingest', ingestContract);

module.exports = router;
