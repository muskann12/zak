const User = require('../database/models/User');
const Referral = require('../database/models/Referral');
const Transaction = require('../database/models/Transaction');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendApprovalRequest } = require('../telegram/bot'); // Import Bot Helper

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register new user
// @route   POST /api/v1/auth/register
exports.registerUser = async (req, res) => {
  const { name, email, password, role, referralCode, instituteName, instituteLocation } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ error: 'User already exists' });

    // Handle Referral Logic
    let referrer = null;
    if (referralCode && role === 'user') {
      referrer = await User.findOne({ activeReferralCode: referralCode });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      isApproved: role === 'user', // Users auto-approve, trainers pending
      instituteName: role === 'trainer' ? instituteName : undefined,
      instituteLocation: role === 'trainer' ? instituteLocation : undefined,
      usedReferralCode: referrer ? referralCode : null,
      referralLink: `http://exzakvibe.com/ref/${crypto.randomBytes(4).toString('hex')}`,
      subscriptionExpiry: new Date(Date.now() + 30*24*60*60*1000) // 30 days trial
    });

    if (user) {
      // Trigger Admin Notification
      sendApprovalRequest(user);

      // If referred, credit referrer
      if (referrer) {
        // Atomic update for commission
        referrer.walletBalance += 300;
        referrer.referralCount += 1;
        await referrer.save();

        await Referral.create({
          referrer: referrer._id,
          referredUser: user._id,
          name: user.name,
          commission: 300,
          status: 'Completed'
        });

        await Transaction.create({
          user: referrer._id,
          type: 'Commission',
          amount: 300,
          status: 'Completed',
          details: `Referral Commission: ${user.name}`
        });
      }

      res.status(201).json({
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved,
          walletBalance: user.walletBalance,
          referralCount: user.referralCount,
          subscriptionExpiry: user.subscriptionExpiry,
          referralLink: user.referralLink,
          activeReferralCode: user.activeReferralCode,
          referralCodeExpiry: user.referralCodeExpiry ? user.referralCodeExpiry.getTime() : null,
          instituteName: user.instituteName,
          instituteLocation: user.instituteLocation
        },
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};