const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const sendResponse = require('../utils/sendResponse');
const prisma = require('../config/db');
const telegramService = require('../services/telegram.service');

// Withdraw Funds
router.post('/withdraw', verifyToken, async (req, res) => {
  try {
    const { amount, accountNumber, paymentMethod } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!amount || !accountNumber || !paymentMethod) {
      return sendResponse(res, 400, false, 'Amount, account number, and payment method are required');
    }

    // Validate payment method
    const validMethods = ['jazzcash', 'easypaisa'];
    if (!validMethods.includes(paymentMethod.toLowerCase())) {
      return sendResponse(res, 400, false, 'Invalid payment method. Choose JazzCash or Easypaisa');
    }

    // Validate amount
    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return sendResponse(res, 400, false, 'Invalid withdrawal amount');
    }

    // Minimum withdrawal (e.g., 500 PKR)
    if (withdrawAmount < 500) {
      return sendResponse(res, 400, false, 'Minimum withdrawal amount is 500 PKR');
    }

    // Validate account number format (11 digits for Pakistani mobile wallets)
    const cleanAccountNumber = accountNumber.replace(/\D/g, '');
    if (cleanAccountNumber.length !== 11) {
      return sendResponse(res, 400, false, 'Account number must be 11 digits (e.g., 03001234567)');
    }

    // Check balance
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }
    if (user.walletBalance < withdrawAmount) {
      return sendResponse(res, 400, false, `Insufficient funds. Your balance is ${user.walletBalance} PKR`);
    }

    // Deduct Funds
    await prisma.user.update({
      where: { id: userId },
      data: { walletBalance: { decrement: withdrawAmount } }
    });

    // Create Transaction Record
    try {
      await prisma.transaction.create({
        data: {
          userId,
          amount: withdrawAmount,
          type: 'WITHDRAWAL',
          status: 'PENDING',
          metadata: JSON.stringify({
            paymentMethod: paymentMethod.toLowerCase(),
            accountNumber: cleanAccountNumber,
            requestedAt: new Date().toISOString()
          })
        }
      });
    } catch (e) {
      console.error("Failed to log transaction:", e);
    }

    // Notify Admin via Telegram with full details
    await telegramService.sendWithdrawalAlert(user, withdrawAmount, cleanAccountNumber, paymentMethod);

    console.log(`[WALLET] Withdrawal: ${withdrawAmount} PKR via ${paymentMethod} to ${cleanAccountNumber} for user ${userId}`);

    return sendResponse(res, 200, true, 'Withdrawal request submitted successfully. Admin has been notified.', {
      success: true,
      amount: withdrawAmount,
      paymentMethod,
      accountNumber: cleanAccountNumber,
      newBalance: user.walletBalance - withdrawAmount,
      status: 'PENDING'
    });
  } catch (error) {
    console.error('[WALLET] Withdrawal error:', error);
    return sendResponse(res, 500, false, 'Failed to process withdrawal: ' + error.message);
  }
});

// Get Wallet Balance
router.get('/balance', verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { walletBalance: true }
    });
    return sendResponse(res, 200, true, 'Balance fetched', { balance: user?.walletBalance || 0 });
  } catch (error) {
    return sendResponse(res, 500, false, 'Failed to fetch balance');
  }
});

// Get Transaction History
router.get('/transactions', verifyToken, async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    return sendResponse(res, 200, true, 'Transactions fetched', { transactions });
  } catch (error) {
    return sendResponse(res, 500, false, 'Failed to fetch transactions');
  }
});

module.exports = router;
