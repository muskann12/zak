const TelegramBot = require('node-telegram-bot-api');
const setupCommands = require('./commands');
const handlers = require('./handlers');

let bot = null;

const initBot = () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return console.warn("⚠️ Telegram Bot Token missing.");

    bot = new TelegramBot(token, { polling: true });

    const isAdmin = (chatId) => {
        const admins = (process.env.TELEGRAM_ADMIN_CHAT_IDS || '').split(',');
        return admins.includes(chatId.toString());
    };

    // Setup Text Commands
    setupCommands(bot, isAdmin);

    // Setup Callback Queries (Buttons)
    bot.on('callback_query', async (q) => {
        const chatId = q.message.chat.id.toString();
        const msgId = q.message.message_id;

        if (!isAdmin(chatId)) return bot.answerCallbackQuery(q.id, { text: "⛔ Unauthorized" });

        try {
            const [action, param] = q.data.split(':');

            switch (action) {
                // Approval Workflow (Real-time)
                case 'approve_user':
                    await handlers.handleApproveUser(bot, chatId, param, msgId);
                    break;
                case 'reject_user':
                    await handlers.handleRejectUser(bot, chatId, param, msgId);
                    break;

                // Navigation
                case 'users':
                    await handlers.handleUsersList(bot, chatId, parseInt(param), msgId);
                    break;
                case 'logs':
                    await handlers.handleLogs(bot, chatId, parseInt(param), msgId);
                    break;
                case 'view':
                    await handlers.handleUserView(bot, chatId, param, msgId);
                    break;

                // Blocking
                case 'block_ask':
                    await handlers.handleBlockAsk(bot, chatId, param, msgId, false);
                    break;
                case 'unblock_ask':
                    await handlers.handleBlockAsk(bot, chatId, param, msgId, true);
                    break;
                case 'block_do':
                    await handlers.handleBlockExecute(bot, chatId, param, msgId, false);
                    break;
                case 'unblock_do':
                    await handlers.handleBlockExecute(bot, chatId, param, msgId, true);
                    break;

                // Broadcast
                case 'broadcast_send':
                    await handlers.handleBroadcastExecute(bot, chatId, msgId);
                    break;
                case 'broadcast_cancel':
                    await bot.deleteMessage(chatId, msgId);
                    break;
            }

            await bot.answerCallbackQuery(q.id);
        } catch (e) {
            console.error("Callback Error:", e);
            bot.answerCallbackQuery(q.id, { text: "Error" });
        }
    });

    console.log("✅ Telegram Admin Bot Started");
};

// External Trigger: Send Approval Request to Admin
const sendApprovalRequest = async (user) => {
    if (!bot) return;
    
    const adminIds = (process.env.TELEGRAM_ADMIN_CHAT_IDS || '').split(',');
    
    const text = `
🆕 *New User Signup*

👤 *Name:* ${user.name}
📧 *Email:* ${user.email}
🏷 *Role:* ${user.role}
🆔 *ID:* \`${user._id}\`
📅 *Date:* ${new Date().toLocaleString()}

_Please approve or reject this user._
    `;

    const buttons = [
        [
            { text: "✅ Accept", callback_data: `approve_user:${user._id}` },
            { text: "❌ Reject", callback_data: `reject_user:${user._id}` }
        ]
    ];

    for (const adminId of adminIds) {
        if (adminId) {
            try {
                await bot.sendMessage(adminId, text, { parse_mode: 'Markdown', reply_markup: { inline_keyboard: buttons } });
            } catch (error) {
                console.error(`Failed to send Telegram notification to ${adminId}:`, error.message);
            }
        }
    }
};

module.exports = { initBot, sendApprovalRequest };