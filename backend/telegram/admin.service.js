const User = require('../database/models/User');
const Transaction = require('../database/models/Transaction');
const Referral = require('../database/models/Referral');

exports.getSystemStats = async () => {
    const [userCount, trainerCount, blockedCount, totalReferrals, revenueData] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'trainer' }),
        User.countDocuments({ isBlocked: true }),
        Referral.countDocuments(),
        Transaction.aggregate([
            { $match: { type: 'Deposit', status: 'Completed' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ])
    ]);

    return {
        users: userCount,
        trainers: trainerCount,
        blocked: blockedCount,
        referrals: totalReferrals,
        revenue: revenueData[0] ? revenueData[0].total : 0
    };
};

exports.getUsers = async (page = 1, limit = 5) => {
    const skip = (page - 1) * limit;
    const users = await User.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await User.countDocuments();
    return { users, total, totalPages: Math.ceil(total / limit) };
};

exports.getUserById = async (id) => {
    return await User.findById(id);
};

exports.searchUser = async (query) => {
    return await User.findOne({
        $or: [
            { email: { $regex: query, $options: 'i' } },
            { name: { $regex: query, $options: 'i' } }
        ]
    });
};

exports.toggleBlockStatus = async (userId, shouldBlock) => {
    return await User.findByIdAndUpdate(userId, { isBlocked: shouldBlock }, { new: true });
};

exports.setUserApproval = async (userId, isApproved) => {
    return await User.findByIdAndUpdate(userId, { isApproved }, { new: true });
};

exports.broadcastMessage = async (message) => {
    // In a real system, this would queue emails or push notifications.
    // Here we simulate the broadcast to all users.
    const userCount = await User.countDocuments();
    return { count: userCount, status: 'Queued' };
};