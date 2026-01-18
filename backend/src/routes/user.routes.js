const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const sendResponse = require('../utils/sendResponse');
const prisma = require('../config/db');

// Submit Payment
router.post('/payment', async (req, res) => {
  try {
    const { userId, senderName } = req.body;

    if (!userId) {
      return sendResponse(res, 400, false, 'userId is required');
    }

    // Process payment (simulated)
    // console.log(`Payment submitted for user: ${userId}, sender: ${senderName}`);
    
    // Fetch user details for notification
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (user) {
         const telegramService = require('../services/telegram.service');
         await telegramService.sendPaymentNotification(user, senderName);
    }

    return sendResponse(res, 200, true, 'Payment submitted successfully', { userId });
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
});

// Get User Dashboard
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const user = req.user;
    
    // Fetch real referrals count
    const referralCount = await prisma.referral.count({
      where: { referrerId: user.id }
    });

    // Fetch recent referrals with details
    const recentReferrals = await prisma.referral.findMany({
      where: { referrerId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Manual join to get names since standard relations aren't set up in schema yet
    const referralsWithDetails = await Promise.all(recentReferrals.map(async (ref) => {
        const referredUser = await prisma.user.findUnique({ where: { id: ref.referredId } });
        return {
            id: ref.id,
            name: referredUser ? referredUser.name : 'Unknown User',
            commission: 300, // Fixed commission for now
            status: 'Completed',
            date: ref.createdAt
        };
    }));

    // If no referrals, maybe return current empty state or some placeholders if strictly requested? 
    // Stick to real data: empty list if none.

    return sendResponse(res, 200, true, 'Dashboard retrieved', {
      walletBalance: user.walletBalance,
      referralCount: referralCount,
      activeReferralCode: user.referralCode,
      referralCodeExpiry: user.referralCodeExpiry ? new Date(user.referralCodeExpiry).getTime() : null,
      referrals: referralsWithDetails
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return sendResponse(res, 400, false, error.message);
  }
});

// Generate Referral Code
router.post('/generate-code', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Store code in user
    await prisma.user.update({
      where: { id: userId },
      data: { 
          referralCode: code,
          referralCodeExpiry: expiryDate
      }
    });

    return sendResponse(res, 200, true, 'Referral code generated', {
      code,
      expiry: expiryDate.getTime()
    });
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
});

// Validate Referral Code
router.post('/validate-code', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return sendResponse(res, 400, false, 'Code is required');
    }

    // Check if code exists
    const user = await prisma.user.findFirst({
      where: { referralCode: code }
    });

    if (user) {
      return sendResponse(res, 200, true, 'Code is valid', {
        valid: true,
        message: '15% discount applied!'
      });
    } else {
      return sendResponse(res, 200, true, 'Code is invalid', {
        valid: false,
        message: 'Invalid or expired referral code'
      });
    }
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
});

// Get Approval Status
router.get('/approval-status', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return sendResponse(res, 400, false, 'userId is required');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    let status = 'pending';
    if (user.isApproved) {
        status = 'approved';
    } else if (user.isBlocked) {
        status = 'rejected';
    }

    return sendResponse(res, 200, true, 'Approval status retrieved', {
      approved: user.isApproved,
      status: status
    });
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
});

module.exports = router;
