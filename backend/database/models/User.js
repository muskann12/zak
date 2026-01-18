const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'trainer', 'admin'], default: 'user' },
  isApproved: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false }, // Admin Control
  
  // Profile Info
  instituteName: { type: String },
  instituteLocation: { type: String },

  // Wallet & Referral
  walletBalance: { type: Number, default: 0 },
  referralCount: { type: Number, default: 0 },
  subscriptionExpiry: { type: Date },
  
  // Referral System
  referralLink: { type: String },
  activeReferralCode: { type: String },
  referralCodeExpiry: { type: Date },
  usedReferralCode: { type: String }
}, { timestamps: true });

// Password hashing middleware
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to check password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);