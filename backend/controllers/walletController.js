const User = require('../database/models/User');
const Transaction = require('../database/models/Transaction');

// @desc    Withdraw Funds
// @route   POST /api/v1/wallet/withdraw
exports.withdrawFunds = async (req, res) => {
  const { amount, account } = req.body;
  const user = req.user;

  if (user.walletBalance < amount) {
    return res.status(400).json({ error: 'Insufficient funds' });
  }

  try {
    // Atomic deduction
    user.walletBalance -= Number(amount);
    await user.save();

    await Transaction.create({
      user: user._id,
      type: 'Withdrawal',
      amount: Number(amount),
      status: 'Completed', // Simulating instant success
      details: `Withdrawal to ${account}`
    });

    res.json({ success: true, newBalance: user.walletBalance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};