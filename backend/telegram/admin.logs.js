const AdminLog = require('../database/models/AdminLog');

/**
 * Logs an administrative action to the database.
 * @param {string} adminId - Telegram Chat ID of the admin.
 * @param {string} action - Action type (e.g., "BLOCK_USER").
 * @param {string} target - Target ID or description.
 * @param {string} details - Additional context.
 */
exports.logAction = async (adminId, action, target, details = '') => {
    try {
        await AdminLog.create({
            adminId: adminId.toString(),
            action,
            target,
            details
        });
        console.log(`[AdminLog] ${action} by ${adminId}`);
    } catch (error) {
        console.error("Failed to save admin log:", error);
    }
};

/**
 * Retrieves recent admin logs.
 * @param {number} page - Pagination page.
 * @param {number} limit - Items per page.
 */
exports.getLogs = async (page = 1, limit = 5) => {
    const skip = (page - 1) * limit;
    const logs = await AdminLog.find().sort({ timestamp: -1 }).skip(skip).limit(limit);
    const total = await AdminLog.countDocuments();
    return { logs, total, totalPages: Math.ceil(total / limit) };
};