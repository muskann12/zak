const adminService = require('./admin.service');
const logService = require('./admin.logs');

// In-memory store for broadcast drafts: { chatId: "Message Content" }
const drafts = new Map();

// --- Helpers ---
const fmtMoney = (n) => Number(n).toLocaleString() + ' PKR';
const getNavButtons = (current, total, prefix) => {
    const btns = [];
    if (current > 1) btns.push({ text: "⬅️ Prev", callback_data: `${prefix}:${current - 1}` });
    if (current < total) btns.push({ text: "Next ➡️", callback_data: `${prefix}:${current + 1}` });
    return btns;
};

// 📊 Stats
exports.handleStats = async (bot, chatId) => {
    try {
        const stats = await adminService.getSystemStats();
        const text = `
📊 *System Statistics*

👥 *Users:* ${stats.users}
🎓 *Trainers:* ${stats.trainers}
🚫 *Blocked:* ${stats.blocked}
🔗 *Referrals:* ${stats.referrals}
💰 *Revenue:* ${fmtMoney(stats.revenue)}
        `;
        bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
    } catch (e) {
        bot.sendMessage(chatId, "❌ Failed to fetch stats.");
    }
};

// 👥 Users List
exports.handleUsersList = async (bot, chatId, page = 1, msgId = null) => {
    try {
        const { users, totalPages } = await adminService.getUsers(page);
        
        let text = `👥 *User Management* (Page ${page}/${totalPages || 1})\n\n`;
        users.forEach(u => {
            const icon = u.isBlocked ? "🔴" : (u.isApproved ? "🟢" : "🟡");
            text += `${icon} *${u.name}*\n└ \`/view ${u._id}\`\n`;
        });

        const buttons = [getNavButtons(page, totalPages, 'users')];
        const opts = { parse_mode: 'Markdown', reply_markup: { inline_keyboard: buttons } };

        if (msgId) await bot.editMessageText(text, { chat_id: chatId, message_id: msgId, ...opts });
        else await bot.sendMessage(chatId, text, opts);
    } catch (e) {
        console.error(e);
        bot.sendMessage(chatId, "❌ Error fetching users.");
    }
};

// 👤 User Details
exports.handleUserView = async (bot, chatId, userId, msgId = null) => {
    try {
        const user = await adminService.getUserById(userId);
        if (!user) return bot.sendMessage(chatId, "❌ User not found.");

        const status = user.isBlocked ? "🔴 BLOCKED" : (user.isApproved ? "🟢 Active" : "🟡 Pending");
        const text = `
👤 *User Profile*

*ID:* \`${user._id}\`
*Name:* ${user.name}
*Email:* ${user.email}
*Role:* ${user.role}
*Status:* ${status}
*Balance:* ${fmtMoney(user.walletBalance)}
*Referrals:* ${user.referralCount}
*Joined:* ${user.createdAt.toLocaleDateString()}
        `;

        const buttons = [];
        if (!user.isApproved) {
            buttons.push({ text: "✅ Approve", callback_data: `approve_user:${user._id}` });
            buttons.push({ text: "❌ Reject", callback_data: `reject_user:${user._id}` });
        }
        
        const row2 = [];
        if (user.isBlocked) {
            row2.push({ text: "✅ Unblock", callback_data: `unblock_ask:${user._id}` });
        } else {
            row2.push({ text: "🚫 Block", callback_data: `block_ask:${user._id}` });
        }
        buttons.push(row2);
        
        buttons.push([{ text: "🔙 Back to List", callback_data: `users:1` }]);

        const opts = { parse_mode: 'Markdown', reply_markup: { inline_keyboard: buttons } };

        if (msgId) await bot.editMessageText(text, { chat_id: chatId, message_id: msgId, ...opts });
        else await bot.sendMessage(chatId, text, opts);
    } catch (e) {
        bot.sendMessage(chatId, "❌ Error fetching details.");
    }
};

// 🔐 Approval Workflow
exports.handleApproveUser = async (bot, chatId, userId, msgId) => {
    try {
        const user = await adminService.setUserApproval(userId, true);
        await logService.logAction(chatId, 'APPROVE_USER', userId, `User Approved: ${user.email}`);
        
        // Remove buttons and update text
        await bot.editMessageText(`✅ *User Approved*\n\nName: ${user.name}\nEmail: ${user.email}\nID: \`${user._id}\``, {
            chat_id: chatId,
            message_id: msgId,
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: [] } // Remove buttons
        });
    } catch (e) {
        bot.answerCallbackQuery(msgId, { text: "Failed to approve user" });
    }
};

exports.handleRejectUser = async (bot, chatId, userId, msgId) => {
    try {
        const user = await adminService.setUserApproval(userId, false);
        await logService.logAction(chatId, 'REJECT_USER', userId, `User Rejected: ${user.email}`);
        
        await bot.editMessageText(`❌ *User Rejected*\n\nName: ${user.name}\nEmail: ${user.email}\nID: \`${user._id}\``, {
            chat_id: chatId,
            message_id: msgId,
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: [] }
        });
    } catch (e) {
        bot.answerCallbackQuery(msgId, { text: "Failed to reject user" });
    }
};

// 🔍 Search
exports.handleSearch = async (bot, chatId, query) => {
    const user = await adminService.searchUser(query);
    if (!user) return bot.sendMessage(chatId, "❌ No user found.");
    exports.handleUserView(bot, chatId, user._id.toString());
};

// 🚫 Block/Unblock Workflow
exports.handleBlockAsk = async (bot, chatId, userId, msgId, isUnblock = false) => {
    const action = isUnblock ? "UNBLOCK" : "BLOCK";
    const text = `⚠️ *CONFIRM ${action}*\n\nAre you sure you want to ${action.toLowerCase()} this user?`;
    
    const buttons = [
        [
            { text: "✅ Yes, Proceed", callback_data: `${isUnblock ? 'unblock_do' : 'block_do'}:${userId}` },
            { text: "❌ Cancel", callback_data: `view:${userId}` }
        ]
    ];

    await bot.editMessageText(text, {
        chat_id: chatId, 
        message_id: msgId, 
        parse_mode: 'Markdown', 
        reply_markup: { inline_keyboard: buttons }
    });
};

exports.handleBlockExecute = async (bot, chatId, userId, msgId, isUnblock = false) => {
    try {
        const user = await adminService.toggleBlockStatus(userId, !isUnblock);
        await logService.logAction(chatId, isUnblock ? 'UNBLOCK_USER' : 'BLOCK_USER', userId, `User: ${user.email}`);
        
        await bot.answerCallbackQuery(msgId, { text: isUnblock ? "User Unblocked" : "User Blocked" });
        exports.handleUserView(bot, chatId, userId, msgId); // Refresh view
    } catch (e) {
        bot.sendMessage(chatId, "❌ Operation failed.");
    }
};

// 📢 Broadcast Workflow
exports.handleBroadcastDraft = async (bot, chatId, text) => {
    drafts.set(chatId, text);
    const count = (await adminService.getSystemStats()).users;

    const msg = `
📢 *Broadcast Preview*
------------------
${text}
------------------
*Recipients:* ~${count} Users
    `;

    const buttons = [[
        { text: "🚀 Send Now", callback_data: "broadcast_send" },
        { text: "❌ Discard", callback_data: "broadcast_cancel" }
    ]];

    bot.sendMessage(chatId, msg, { parse_mode: 'Markdown', reply_markup: { inline_keyboard: buttons } });
};

exports.handleBroadcastExecute = async (bot, chatId, msgId) => {
    const text = drafts.get(chatId);
    if (!text) return bot.deleteMessage(chatId, msgId);

    await adminService.broadcastMessage(text);
    await logService.logAction(chatId, 'BROADCAST', 'ALL', text.substring(0, 50) + '...');
    
    drafts.delete(chatId);
    await bot.editMessageText(`✅ *Broadcast Sent*`, { chat_id: chatId, message_id: msgId, parse_mode: 'Markdown' });
};

// 📜 Logs
exports.handleLogs = async (bot, chatId, page = 1, msgId = null) => {
    try {
        const { logs, totalPages } = await logService.getLogs(page);
        
        let text = `📜 *Admin Activity Log* (Page ${page}/${totalPages || 1})\n\n`;
        logs.forEach(l => {
            text += `🔹 *${l.action}* | ${l.timestamp.toLocaleDateString()}\nTarget: \`${l.target}\`\n\n`;
        });

        const buttons = [getNavButtons(page, totalPages, 'logs')];
        const opts = { parse_mode: 'Markdown', reply_markup: { inline_keyboard: buttons } };

        if (msgId) await bot.editMessageText(text, { chat_id: chatId, message_id: msgId, ...opts });
        else await bot.sendMessage(chatId, text, opts);
    } catch (e) {
        bot.sendMessage(chatId, "❌ Error fetching logs.");
    }
};