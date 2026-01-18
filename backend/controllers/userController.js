const User = require('../database/models/User');
const Referral = require('../database/models/Referral');
const Transaction = require('../database/models/Transaction');

// @desc    Get User Dashboard Data
// @route   GET /api/v1/user/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const referrals = await Referral.find({ referrer: req.user._id }).sort({ date: -1 });
    const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 });

    res.json({
      walletBalance: user.walletBalance,
      referralCount: user.referralCount,
      activeReferralCode: user.activeReferralCode,
      referralCodeExpiry: user.referralCodeExpiry ? user.referralCodeExpiry.getTime() : null,
      referrals,
      transactions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Generate Referral Code
// @route   POST /api/v1/user/generate-code
exports.generateReferralCode = async (req, res) => {
  try {
    const code = 'EX-' + Math.floor(1000 + Math.random() * 9000);
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    req.user.activeReferralCode = code;
    req.user.referralCodeExpiry = expiry;
    await req.user.save();

    res.json({ code, expiry: expiry.getTime() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Validate Referral Code (Public or Protected)
// @route   POST /api/v1/user/validate-code
exports.validateReferralCode = async (req, res) => {
  const { code } = req.body;
  try {
    const user = await User.findOne({ activeReferralCode: code });
    
    if (user && user.referralCodeExpiry > Date.now()) {
      res.json({ valid: true, discount: 150, message: 'Code Applied! 150 PKR Discount.' });
    } else {
      res.json({ valid: false, message: 'Invalid or Expired Code' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Record Payment (Simulation)
// @route   POST /api/v1/user/payment
exports.submitPayment = async (req, res) => {
    const { userId } = req.body;
    try {
        await Transaction.create({
            user: userId,
            type: 'Deposit',
            amount: 1500,
            status: 'Completed',
            details: 'Subscription Payment'
        });
        
        // Auto-approve user for demo flow if pending
        const user = await User.findById(userId);
        if(user && !user.isApproved) {
            user.isApproved = false; // Keep as pending for trainer flow simulation
            await user.save();
        }

        res.json({ success: true, message: "Payment recorded" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Check Approval Status
// @route   GET /api/v1/user/approval-status
exports.checkApproval = async (req, res) => {
    const user = await User.findById(req.query.userId);
    res.json({ approved: user ? user.isApproved : false });
};