const express = require('express');
const { getDashboard, generateReferralCode, validateReferralCode, submitPayment, checkApproval } = require('../controllers/userController');
const { protect, trainerOnly } = require('../middleware/authMiddleware');
const router = express.Router();

// Strictly secured routes for Trainers only
router.get('/dashboard', protect, trainerOnly, getDashboard);
router.post('/generate-code', protect, trainerOnly, generateReferralCode);

// Public/Shared routes (still require authentication for context)
router.post('/validate-code', validateReferralCode);
router.post('/payment', submitPayment);
router.get('/approval-status', checkApproval);

module.exports = router;