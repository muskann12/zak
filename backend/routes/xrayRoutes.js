const express = require('express');
const { analyzeProducts, getDemoData, calculateProfit } = require('../controllers/xrayController');
const router = express.Router();

router.post('/analyze', analyzeProducts);
router.get('/demo-data', getDemoData);
router.post('/profit-calculator', calculateProfit);

module.exports = router;