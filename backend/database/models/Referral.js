const mongoose = require('mongoose');

const ReferralSchema = new mongoose.Schema({
  referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referredUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true }, // Name of referred user for display
  commission: { type: Number, default: 0 },
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Referral', ReferralSchema);