const app = require('./app');
const prisma = require('./config/db');
require('./config/telegram'); // Initialize Bot listener

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    // Check DB connection
    await prisma.$connect();
    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Server failed to start:', error);
    process.exit(1);
  }
}

start();