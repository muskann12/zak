const express = require('express');
const router = express.Router();
const marketController = require('../controllers/market.controller');

// Public routes (no auth required for market analysis demo)
router.post('/analyze', marketController.analyzeMarket);
router.get('/activity', marketController.getMarketActivity);
router.get('/stats', marketController.getPlatformStats);
router.post('/sourcing', marketController.findSourcing);

module.exports = router;
