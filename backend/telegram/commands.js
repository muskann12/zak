const handlers = require('./handlers');

const setupCommands = (bot, checkAuth) => {
    
    const cmd = (regex, handler) => {
        bot.onText(regex, (msg, match) => {
            const chatId = msg.chat.id.toString();
            if (checkAuth(chatId)) {
                handler(bot, chatId, match[1]); 
            }
        });
    };

    // --- Commands ---
    cmd(/\/stats/, (b, c) => handlers.handleStats(b, c));
    cmd(/\/users/, (b, c) => handlers.handleUsersList(b, c));
    cmd(/\/view (.+)/, (b, c, id) => handlers.handleUserView(b, c, id));
    cmd(/\/search (.+)/, (b, c, q) => handlers.handleSearch(b, c, q));
    cmd(/\/logs/, (b, c) => handlers.handleLogs(b, c));
    cmd(/\/broadcast (.+)/, (b, c, t) => handlers.handleBroadcastDraft(b, c, t));

    // Help
    cmd(/\/start|\/help/, (b, c) => {
        const text = `
🤖 *Admin Panel Commands*

*Management*
/users - View user list
/view <id> - View specific user
/search <query> - Search by email/name
/logs - View admin audit logs

*System*
/stats - View database stats
/broadcast <message> - Create announcement
        `;
        b.sendMessage(c, text, { parse_mode: 'Markdown' });
    });
};

module.exports = setupCommands;