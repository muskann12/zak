const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const prisma = require('../config/db');
const sendResponse = require('../utils/sendResponse');

// Get Notifications
router.get('/', verifyToken, async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        
        // Count unread
        const unreadCount = await prisma.notification.count({
            where: { userId: req.user.id, isRead: false }
        });

        sendResponse(res, 200, true, 'Notifications fetched', { notifications, unreadCount });
    } catch (e) {
        sendResponse(res, 500, false, e.message);
    }
});

// Mark Read
router.post('/read', verifyToken, async (req, res) => {
    try {
        await prisma.notification.updateMany({
            where: { userId: req.user.id, isRead: false },
            data: { isRead: true }
        });
        sendResponse(res, 200, true, 'Notifications marked read');
    } catch (e) {
        sendResponse(res, 500, false, e.message);
    }
});

module.exports = router;