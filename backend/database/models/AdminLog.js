const mongoose = require('mongoose');

const AdminLogSchema = new mongoose.Schema({
  adminId: { type: String, required: true }, // Telegram Chat ID
  action: { type: String, required: true },
  target: { type: String }, // User ID or "System"
  details: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdminLog', AdminLogSchema);