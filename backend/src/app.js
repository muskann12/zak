const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const walletRoutes = require('./routes/wallet.routes');
const xrayRoutes = require('./routes/xray.routes');
const notificationRoutes = require('./routes/notification.routes');
const marketRoutes = require('./routes/market.routes');
const blogRoutes = require('./routes/blog.routes');
const securityConfig = require('./config/security');
const {
    requestId,
    ipBlacklist,
    sanitizeBody,
    detectSqlInjection,
    securityLogger,
    detectBot,
    secureErrorHandler
} = require('./middleware/security.middleware');

const app = express();

// ==========================================
// SECURITY MIDDLEWARE - LAYER 1: Core
// ==========================================

// 0. Request ID for tracking
app.use(requestId);

// 1. IP Blacklist check (first line of defense)
app.use(ipBlacklist);

// 2. Security logging
app.use(securityLogger);

// 3. Bot detection
app.use(detectBot);

// ==========================================
// SECURITY MIDDLEWARE
// ==========================================

// 1. Helmet - Sets various HTTP headers for security
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", "https://serpapi.com"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 2. Remove X-Powered-By header
app.disable('x-powered-by');

// 3. Rate Limiting - Prevent brute force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { 
        success: false, 
        message: 'Too many requests, please try again later.' 
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// 4. Stricter rate limit for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login attempts per windowMs
    message: { 
        success: false, 
        message: 'Too many login attempts, please try again after 15 minutes.' 
    }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// 5. HPP - Prevent HTTP Parameter Pollution
app.use(hpp());

// 6. CORS Configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com'] // Add your production domain
        : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));

// 7. Body parser with size limits
app.use(express.json({ limit: '10mb' })); // Limit body size to prevent DoS
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 8. Sanitize body and detect SQL injection
app.use(sanitizeBody);
app.use(detectSqlInjection);

// 9. Security headers middleware
app.use((req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Enable XSS filter
    res.setHeader('X-XSS-Protection', '1; mode=block');
    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // Permissions policy
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    // Cache control for API responses
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

// 9. Request sanitization middleware
app.use((req, res, next) => {
    // Sanitize request body
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                // Remove potential XSS patterns
                req.body[key] = req.body[key]
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/javascript:/gi, '')
                    .replace(/on\w+=/gi, '');
            }
        });
    }
    next();
});

// 10. Hide error details in production
app.use((err, req, res, next) => {
    console.error('[ERROR]', err);
    
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' 
        ? 'An error occurred' 
        : err.message;
    
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

// 11. Withdrawal rate limiting
const withdrawalLimiter = rateLimit(securityConfig.rateLimit.withdrawal);
app.use('/api/wallet/withdraw', withdrawalLimiter);

// ==========================================
// ROUTES
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/xray', xrayRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/blog', blogRoutes);

// Base Route
app.get('/', (req, res) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Endpoint not found' 
    });
});

// Global error handler (security-aware)
app.use(secureErrorHandler);

module.exports = app;