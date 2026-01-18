const bot = require('../config/telegram');
const prisma = require('../config/db');

const ADMIN_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.ADMIN_TELEGRAM_ID;

// Helper: Parse ID (Int or String)
const parseId = (id) => {
  const intId = parseInt(id, 10);
  return isNaN(intId) ? id : intId;
};

// Helper: Check Admin Auth
const isAdmin = (chatId) => {
    return chatId.toString() === ADMIN_ID;
};

// Helper: Format Currency
const fmtMoney = (n) => Number(n).toLocaleString() + ' PKR';

// --- Commands ---

// /start or /help
bot.onText(/\/start|\/help/, (msg) => {
    if (!isAdmin(msg.chat.id)) return;
    const text = `
🤖 *Admin Panel Commands*

*Management*
/users - View user list (last 5)
/pending - View pending approvals
/blocked - View blocked users
/payouts - View recent payment history
/stats - View system statistics
    `;
    bot.sendMessage(msg.chat.id, text, { parse_mode: 'Markdown' });
});

// /stats
bot.onText(/\/stats/, async (msg) => {
    const chatId = msg.chat.id;
    if (!isAdmin(chatId)) return;

    try {
        const [userCount, trainerCount, blockedCount, totalReferrals] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { role: 'trainer' } }),
            prisma.user.count({ where: { isBlocked: true } }),
            prisma.referral.count()
        ]);
        
        // Revenue (Sum of 'COMMISSION' or 'DEPOSIT' transactions)
        const revenueAgg = await prisma.transaction.aggregate({
            _sum: { amount: true },
            where: { type: 'COMMISSION' } 
        });
        const revenue = revenueAgg._sum.amount || 0;

        const text = `
📊 *System Statistics*

👥 *Total Users:* ${userCount}
🎓 *Trainers:* ${trainerCount}
🚫 *Blocked:* ${blockedCount}
🔗 *Referrals:* ${totalReferrals}
💰 *Commission Paid:* ${fmtMoney(revenue)}
        `;
        bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
    } catch (e) {
        console.error("Stats Error:", e);
        bot.sendMessage(chatId, "❌ Failed to fetch stats.");
    }
});

// /payouts
bot.onText(/\/payouts/, async (msg) => {
    const chatId = msg.chat.id;
    if (!isAdmin(chatId)) return;

    try {
        const payouts = await prisma.transaction.findMany({
            where: { 
                type: 'WITHDRAWAL',
                status: 'COMPLETED'
            },
            take: 10,
            orderBy: { createdAt: 'desc' }
        });

        if (payouts.length === 0) {
            return bot.sendMessage(chatId, "ℹ️ No recent payouts found.");
        }

        let text = `💸 *Recent Payouts (Last 10)*\n\n`;

        for (const p of payouts) {
            const user = await prisma.user.findUnique({ where: { id: p.userId } });
            if (user) {
                const icon = user.role === 'trainer' ? '🎓' : '👤';
                text += `${icon} *${user.name}* (${user.role})\n`;
                text += `└ 💰 ${fmtMoney(p.amount)} • ${new Date(p.createdAt).toLocaleDateString()}\n\n`;
            }
        }

        bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
    } catch (e) {
        console.error("Payouts Error:", e);
        bot.sendMessage(chatId, "❌ Database error while fetching payouts.");
    }
});

// /users
bot.onText(/\/users/, async (msg) => {
    const chatId = msg.chat.id;
    if (!isAdmin(chatId)) return;
    await showUsersList(chatId);
});

async function showUsersList(chatId, messageId = null) {
    try {
        const users = await prisma.user.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' }
        });

        if (users.length === 0) {
            return bot.sendMessage(chatId, "✅ No users found.");
        }

        const text = `👥 *Recent Users (${users.length})*\n\nSelect a user to manage:`;
        
        const buttons = users.map(u => ({ 
            text: `${u.isApproved ? '🟢' : '🔴'} ${u.name}`, 
            callback_data: `view:${u.id}` 
        }));
        
        const keyboard = [];
        for (let i = 0; i < buttons.length; i += 2) {
            keyboard.push(buttons.slice(i, i + 2));
        }

        const opts = { 
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: keyboard }
        };

        if (messageId) {
            await bot.editMessageText(text, { chat_id: chatId, message_id: messageId, ...opts });
        } else {
            await bot.sendMessage(chatId, text, opts);
        }
    } catch (e) {
        console.error("Users Error:", e);
        bot.sendMessage(chatId, "❌ Failed to fetch users.");
    }
}


// /pending
bot.onText(/\/pending/, async (msg) => {
    const chatId = msg.chat.id;
    if (!isAdmin(chatId)) return;
    await showPendingList(chatId);
});

async function showPendingList(chatId, messageId = null) {
    try {
        const users = await prisma.user.findMany({
            where: { isApproved: false },
            take: 10,
            orderBy: { createdAt: 'desc' }
        });

        if (users.length === 0) {
            const text = "✅ *No Pending Approvals*\n\nAll users have been processed.";
            if (messageId) {
                return bot.editMessageText(text, { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown' });
            }
            return bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
        }

        const text = `📋 *Pending Approvals (${users.length})*\n\nSelect a user to view details:`;
        
        // Buttons: [ 👤 Name ]
        const buttons = users.map(u => ({ text: `👤 ${u.name} (${u.role})`, callback_data: `view:${u.id}` }));
        
        // Chunk into 2 columns
        const keyboard = [];
        for (let i = 0; i < buttons.length; i += 2) {
            keyboard.push(buttons.slice(i, i + 2));
        }

        // Add Refresh Button
        keyboard.push([{ text: '🔄 Refresh List', callback_data: 'refresh_pending:0' }]);
        
        const opts = { 
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: keyboard }
        };

        if (messageId) {
            await bot.editMessageText(text, { chat_id: chatId, message_id: messageId, ...opts });
        } else {
            await bot.sendMessage(chatId, text, opts);
        }
    } catch (e) {
        console.error("Pending Error:", e);
        bot.sendMessage(chatId, "❌ Failed to fetch pending users.");
    }
}

// /blocked
bot.onText(/\/blocked/, async (msg) => {
    const chatId = msg.chat.id;
    if (!isAdmin(chatId)) return;

    try {
        const users = await prisma.user.findMany({
            where: { isBlocked: true },
            take: 10,
            orderBy: { id: 'desc' }
        });

        if (users.length === 0) {
            return bot.sendMessage(chatId, "✅ No blocked users found.");
        }

        // Professional List View
        let text = `🚫 *Blocked Users List*\n━━━━━━━━━━━━━━━━\n`;
        users.forEach(u => {
            text += `🔴 *${u.name}*\n📧 ${u.email}\n🆔 \`${u.id}\`\n\n`;
        });

        bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
    } catch (e) {
         console.error("Blocked Error:", e);
         bot.sendMessage(chatId, "❌ Failed to fetch blocked users.");
    }
});


// 1. Send Approval Request
const sendApprovalRequest = async (user) => {
  if (!ADMIN_ID) {
    console.warn('⚠️ TELEGRAM_ADMIN_CHAT_ID is not set in .env');
    return;
  }

  console.log(`📤 Sending approval request to admin (${ADMIN_ID}) for user: ${user.name}`);

  // Determine Institute Info display
  const instituteInfo = user.instituteName ? `\n🏛 *Institute:* ${user.instituteName}\n📍 *Loc:* ${user.instituteLocation || 'N/A'}` : '';

  const message = `
🔔 *New Registration Request*

👤 *${user.name}*
📧 \`${user.email}\`
💼 Role: *${user.role}*${instituteInfo}
📅 ${new Date().toLocaleString()}

_Action Required:_
  `;

  const options = {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '✅ Approve', callback_data: `approve:${user.id}` },
          { text: '❌ Reject', callback_data: `reject:${user.id}` }
        ]
      ]
    }
  };

  try {
    const result = await bot.sendMessage(ADMIN_ID, message, options);
    console.log('✅ Message sent successfully to Telegram admin');
  } catch (error) {
    console.error('❌ Telegram Send Error:', error.message);
  }
};

// 1.5 Send Payment Notification (Actionable)
const sendPaymentNotification = async (user, senderName) => {
  if (!ADMIN_ID) return;

  // Determine Institute Info display
  const instituteInfo = user.instituteName ? `\n🏛 *Institute:* ${user.instituteName}\n📍 *Loc:* ${user.instituteLocation || 'N/A'}` : '';

  const paymentText = `
💰 *Payment Received*

👤 *Name:* ${user.name}
💼 *Role:* ${user.role}${instituteInfo}
🆔 *ID:* \`${user.id}\`
🏦 *Sender Name:* *${senderName || 'Not Provided'}*
📧 \`${user.email}\`
📅 ${new Date().toLocaleString()}

_Please verify the payment and approve the user._
  `;

  const options = {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '✅ Approve & Activate', callback_data: `approve:${user.id}` },
          { text: '❌ Reject', callback_data: `reject:${user.id}` }
        ]
      ]
    }
  };

  try {
    await bot.sendMessage(ADMIN_ID, paymentText, options);
  } catch (e) {
    console.error("Payment Notif Error:", e);
  }
};

// 2. Handle Callback Queries (Button Clicks)
bot.on('callback_query', async (query) => {
  const { data, message, from } = query;
  const chatId = message.chat.id;

  console.log(`📨 Callback received: ${data} from user ${from.id}`);

  // Security Check
  if (from.id.toString() !== ADMIN_ID) {
    console.log(`⛔ Unauthorized action attempt from ${from.id}`);
    return bot.answerCallbackQuery(query.id, { text: '⛔ Unauthorized action.' });
  }

  const [action, userIdRaw] = data.split(':');
  const userId = parseId(userIdRaw); // Handle Int/String ID

  console.log(`✅ Processing ${action} for userId: ${userId}`);

  try {

    // Helper to handle list refresh which has no user ID
    if (action === 'refresh_pending') {
        await showPendingList(chatId, message.message_id);
        return bot.answerCallbackQuery(query.id);
    }
    if (action === 'refresh_users') {
        await showUsersList(chatId, message.message_id);
        return bot.answerCallbackQuery(query.id);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      console.log(`❌ User not found: ${userId}`);
      return bot.editMessageText(`⚠️ User ID \`${userId}\` not found in database.`, {
        chat_id: chatId,
        message_id: message.message_id,
        parse_mode: 'Markdown'
      });
    }

    if (action === 'view') {
        const institute = user.instituteName ? `\n🏛 *Institute:* ${user.instituteName}` : '';
        const location = user.instituteLocation ? `\n📍 *Loc:* ${user.instituteLocation}` : '';
        const referral = user.referralCode ? `\n🔗 *Ref Code:* \`${user.referralCode}\`` : '';
        
        const text = `
👤 *User Details Review*

🆔 *ID:* \`${user.id}\`
*Name:* ${user.name}
*Email:* ${user.email}
*Role:* ${user.role.toUpperCase()}${institute}${location}${referral}
*Date:* ${user.createdAt.toLocaleString()}

_Select an action:_
        `;

        const keyboard = [
            [
                { text: '✅ Approve', callback_data: `approve:${user.id}` },
                { text: '🚫 Block', callback_data: `reject:${user.id}` }
            ],
            [
                { text: '🗑 Delete', callback_data: `delete_ask:${user.id}` }
            ],
            [
                { text: '🔙 Back to Pending', callback_data: `refresh_pending:0` },
                { text: '👥 All Users', callback_data: `refresh_users:0` }
            ]
        ];

        await bot.editMessageText(text, {
            chat_id: chatId,
            message_id: message.message_id,
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: keyboard }
        });
        
        await bot.answerCallbackQuery(query.id);
        return;
    }

    if (action === 'approve') {
      // Update DB
      await prisma.user.update({
        where: { id: userId },
        data: { isApproved: true }
      });
      console.log(`✅ User approved in database: ${userId}`);

      // Update Telegram Message
      const approvedText = `
✅ *User Successfully Approved*

👤 *Name:* ${user.name}
📧 *Email:* ${user.email}
      `;
      
      // Provide a button to go back to list
      const keyboard = [[{ text: '🔙 Back to Pending', callback_data: `refresh_pending:0` }]];

      await bot.editMessageText(approvedText, {
        chat_id: chatId,
        message_id: message.message_id,
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: keyboard }
      });

      await bot.answerCallbackQuery(query.id, { text: 'User Approved' });

    } else if (action === 'reject') {
      // Logic: Mark as blocked
      await prisma.user.update({
        where: { id: userId },
        data: { isBlocked: true, isApproved: false }
      });
      console.log(`❌ User rejected (blocked) in database: ${userId}`);

      const rejectedText = `
❌ *User Rejected & Blocked*

👤 *Name:* ${user.name}
📧 *Email:* ${user.email}
      `;

      // Back to List
      const keyboard = [[{ text: '🔙 Back to Pending', callback_data: `refresh_pending:0` }]];

      await bot.editMessageText(rejectedText, {
        chat_id: chatId,
        message_id: message.message_id,
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: keyboard }
      });

      await bot.answerCallbackQuery(query.id, { text: 'User Blocked' });

    } else if (action === 'delete_ask') {
        const text = `⚠️ *Are you sure you want to PERMANENTLY DELETE this user?*\n\n👤 ${user.name}\n\nThis action cannot be undone.`;
        const keyboard = [
            [
                { text: '✅ Yes, Delete', callback_data: `delete_confirm:${user.id}` },
                { text: '❌ Cancel', callback_data: `view:${user.id}` }
            ]
        ];
        await bot.editMessageText(text, { 
            chat_id: chatId, 
            message_id: message.message_id, 
            parse_mode: 'Markdown', 
            reply_markup: { inline_keyboard: keyboard } 
        });
        await bot.answerCallbackQuery(query.id);

    } else if (action === 'delete_confirm') {
        // ... (existing delete logic)
        await prisma.user.delete({ where: { id: userId } });
        console.log(`❌ User deleted in database: ${userId}`);
        
        const text = `🗑 *User Deleted Successfullly*\n\nUser ${user.name} has been removed from the database.`;
        const keyboard = [[{ text: '👥 Back to Users', callback_data: `refresh_users:0` }]];
        
        await bot.editMessageText(text, { 
            chat_id: chatId, 
            message_id: message.message_id, 
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: keyboard }
        });
        await bot.answerCallbackQuery(query.id, { text: 'User Deleted' });
    }
    
    // Handle Payment Processed (legacy)
    if (action === 'payment_done') {
        const [_, uid, amt] = data.split(':');
        await handleWithdrawProcessed(bot, chatId, uid, amt, message.message_id);
        await bot.answerCallbackQuery(query.id, { text: 'Payment Marked Processed' });
        return;
    }

    // Handle Withdrawal Paid
    if (action === 'withdraw_paid') {
        const [_, uid, amt] = data.split(':');
        await handleWithdrawPaid(bot, chatId, uid, parseFloat(amt), message.message_id);
        await bot.answerCallbackQuery(query.id, { text: '✅ Payment marked as completed' });
        return;
    }

    // Handle Withdrawal Rejected
    if (action === 'withdraw_reject') {
        const [_, uid, amt] = data.split(':');
        await handleWithdrawRejected(bot, chatId, uid, parseFloat(amt), message.message_id);
        await bot.answerCallbackQuery(query.id, { text: '❌ Withdrawal rejected' });
        return;
    }

    // Handle Copy Account (just show account number)
    if (action === 'copy_account') {
        const accountNumber = data.split(':')[1];
        await bot.answerCallbackQuery(query.id, { text: `Account: ${accountNumber}`, show_alert: true });
        return;
    }

  } catch (error) {
    console.error('❌ Callback Error:', error);
    bot.answerCallbackQuery(query.id, { text: 'Error processing request' });
  }
});

module.exports = {
  sendApprovalRequest,
  sendWithdrawalAlert,
  sendPaymentNotification
};

// 3. Send Withdrawal Alert with Payment Method
async function sendWithdrawalAlert(user, amount, accountNumber, paymentMethod = 'unknown') {
  if (!ADMIN_ID) return;

  // Payment method icon and name
  const methodInfo = {
    jazzcash: { icon: '🔴', name: 'JazzCash' },
    easypaisa: { icon: '🟢', name: 'Easypaisa' }
  };
  
  const method = methodInfo[paymentMethod.toLowerCase()] || { icon: '💳', name: paymentMethod };

  const text = `
💸 *NEW WITHDRAWAL REQUEST*

━━━━━━━━━━━━━━━━━━━━

👤 *User Details:*
   • Name: ${user.name}
   • Email: ${user.email}
   • Role: ${user.role || 'user'}

💰 *Withdrawal Details:*
   • Amount: *${fmtMoney(amount)}*
   • Method: ${method.icon} *${method.name}*
   • Account: \`${accountNumber}\`

📅 *Requested:* ${new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })}
🆔 *User ID:* \`${user.id}\`

━━━━━━━━━━━━━━━━━━━━

⚠️ _Please process this payment via ${method.name} to account ${accountNumber}_
  `;

  // Action buttons for admin
  const keyboard = [
    [
      { text: '✅ Mark as Paid', callback_data: `withdraw_paid:${user.id}:${amount}` },
      { text: '❌ Reject', callback_data: `withdraw_reject:${user.id}:${amount}` }
    ],
    [
      { text: `📱 Copy ${method.name} Number`, callback_data: `copy_account:${accountNumber}` }
    ]
  ];

  try {
    await bot.sendMessage(ADMIN_ID, text, { 
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: keyboard }
    });
    console.log(`[TELEGRAM] Withdrawal alert sent for ${user.name}: ${amount} PKR via ${method.name}`);
  } catch (e) {
    console.error("[TELEGRAM] Withdrawal Alert Error:", e);
  }
}

// Helper: Handle Withdraw Paid
async function handleWithdrawPaid(bot, chatId, userId, amount, msgId) {
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        
        // 1. Send Notification to User
        await prisma.notification.create({
            data: {
                userId: userId,
                message: `✅ Your withdrawal of ${fmtMoney(amount)} has been processed and sent to your account!`
            }
        });

        // 2. Update transaction status if exists
        try {
            await prisma.transaction.updateMany({
                where: { 
                    userId, 
                    type: 'WITHDRAWAL',
                    amount: amount,
                    status: 'PENDING'
                },
                data: { status: 'COMPLETED' }
            });
        } catch (e) {
            console.log("Transaction update skipped:", e.message);
        }

        // 3. Update Telegram Message
        const text = `
✅ *WITHDRAWAL COMPLETED*

━━━━━━━━━━━━━━━━━━━━

👤 *User:* ${user?.name || 'Unknown'}
💰 *Amount:* ${fmtMoney(amount)}
🆔 *User ID:* \`${userId}\`
✅ *Status:* PAID
📅 *Processed:* ${new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })}

━━━━━━━━━━━━━━━━━━━━

_Payment has been sent successfully._
        `;

        await bot.editMessageText(text, {
            chat_id: chatId,
            message_id: msgId,
            parse_mode: 'Markdown'
        });

        console.log(`[TELEGRAM] Withdrawal marked as paid: ${userId} - ${amount} PKR`);

    } catch (e) {
        console.error("Handle Withdraw Paid Error:", e);
        bot.sendMessage(chatId, "❌ Error processing payment status.");
    }
}

// Helper: Handle Withdraw Rejected
async function handleWithdrawRejected(bot, chatId, userId, amount, msgId) {
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        
        // 1. Refund the amount back to user's wallet
        if (user) {
            await prisma.user.update({
                where: { id: userId },
                data: { walletBalance: { increment: amount } }
            });
        }

        // 2. Send Notification to User
        await prisma.notification.create({
            data: {
                userId: userId,
                message: `❌ Your withdrawal of ${fmtMoney(amount)} was rejected. The amount has been refunded to your wallet.`
            }
        });

        // 3. Update transaction status
        try {
            await prisma.transaction.updateMany({
                where: { 
                    userId, 
                    type: 'WITHDRAWAL',
                    amount: amount,
                    status: 'PENDING'
                },
                data: { status: 'REJECTED' }
            });
        } catch (e) {
            console.log("Transaction update skipped:", e.message);
        }

        // 4. Update Telegram Message
        const text = `
❌ *WITHDRAWAL REJECTED*

━━━━━━━━━━━━━━━━━━━━

👤 *User:* ${user?.name || 'Unknown'}
💰 *Amount:* ${fmtMoney(amount)}
🆔 *User ID:* \`${userId}\`
❌ *Status:* REJECTED
💵 *Refunded:* Yes (to wallet)
📅 *Processed:* ${new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })}

━━━━━━━━━━━━━━━━━━━━

_Amount has been refunded to user's wallet._
        `;

        await bot.editMessageText(text, {
            chat_id: chatId,
            message_id: msgId,
            parse_mode: 'Markdown'
        });

        console.log(`[TELEGRAM] Withdrawal rejected and refunded: ${userId} - ${amount} PKR`);

    } catch (e) {
        console.error("Handle Withdraw Rejected Error:", e);
        bot.sendMessage(chatId, "❌ Error processing rejection.");
    }
}

// Helper: Handle Withdraw Processed (legacy)
async function handleWithdrawProcessed(bot, chatId, userId, amount, msgId) {
    try {
        // 1. Send Notification to User
        await prisma.notification.create({
            data: {
                userId: userId,
                message: `✅ Your withdrawal of ${fmtMoney(amount)} has been processed.`
            }
        });

        // 2. Update Telegram Message
        const text = `
✅ *Withdrawal Processed*

💰 *Amount:* ${fmtMoney(amount)}
🆔 *User ID:* \`${userId}\`
📅 *Done:* ${new Date().toLocaleString()}
        `;

        await bot.editMessageText(text, {
            chat_id: chatId,
            message_id: msgId,
            parse_mode: 'Markdown'
        });

    } catch (e) {
        console.error("Handle Withdraw Error:", e);
        bot.sendMessage(chatId, "❌ Database Error processing payment.");
    }
}