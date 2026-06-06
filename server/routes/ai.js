const express = require('express');
const router = express.Router();
const { analyzeJournal, chat, getDailySummary } = require('../controllers/aiController');

router.post('/analyze-journal', analyzeJournal);
router.post('/chat', chat);
router.post('/daily-summary', getDailySummary);

module.exports = router;