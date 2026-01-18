const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const isProduction = process.env.NODE_ENV === 'production';
const isPlaceholder = !token || token === 'your-telegram-bot-token' || token === 'your-bot-token';

if (isPlaceholder) {
  console.warn('⚠️ TELEGRAM_BOT_TOKEN is not set or is using a placeholder. Bot features will be disabled.');
  // Return a mock bot to prevent crashes
  module.exports = {
    sendMessage: async () => console.log('[MOCK BOT] Message sent (mock)'),
    on: () => {},
    onText: () => {},
    getMe: async () => ({ username: 'MockBot' })
  };
} else {
  // We use 'polling' for simplest local setup (real-time). 
  // For production with HTTPS, webhooks are recommended.
  const bot = new TelegramBot(token, { polling: true });

  // Test bot connection
  bot.getMe().then(me => {
    console.log(`✅ Telegram Bot connected: @${me.username} (${me.first_name})`);
  }).catch(err => {
    console.error('❌ Failed to connect to Telegram:', err.message);
  });

  console.log('🤖 Telegram Bot is running and polling...');
  module.exports = bot;
}