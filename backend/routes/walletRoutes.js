const express = require('express');
const { withdrawFunds } = require('../controllers/walletController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/withdraw', protect, withdrawFunds);

module.exports = router;