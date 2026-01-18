require('dotenv').config();
const app = require('./app');
const connectDB = require('./database/connection');
const initBot = require('./telegram/bot');

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB().then(() => {
    // Start Server
    app.listen(PORT, () => {
        console.log(`✅ Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        
        // Initialize Telegram Bot after server & DB are ready
        initBot();
    });
});