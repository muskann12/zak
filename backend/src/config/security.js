/**
 * Security Configuration
 * Centralized security settings for the backend
 */

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
    // Rate Limiting Configuration
    rateLimit: {
        general: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: isProduction ? 100 : 1000, // Stricter in production
            message: {
                success: false,
                message: 'Too many requests. Please try again later.',
                code: 'RATE_LIMIT_EXCEEDED'
            },
            standardHeaders: true,
            legacyHeaders: false,
        },
        auth: {
            windowMs: 15 * 60 * 1000,
            max: isProduction ? 5 : 50, // Very strict for auth
            message: {
                success: false,
                message: 'Too many authentication attempts. Please try again later.',
                code: 'AUTH_RATE_LIMIT_EXCEEDED'
            }
        },
        api: {
            windowMs: 1 * 60 * 1000, // 1 minute
            max: isProduction ? 30 : 300,
            message: {
                success: false,
                message: 'API rate limit exceeded.',
                code: 'API_RATE_LIMIT'
            }
        },
        withdrawal: {
            windowMs: 60 * 60 * 1000, // 1 hour
            max: isProduction ? 3 : 20, // Max 3 withdrawal requests per hour
            message: {
                success: false,
                message: 'Withdrawal request limit exceeded. Try again later.',
                code: 'WITHDRAWAL_LIMIT'
            }
        }
    },

    // CORS Configuration
    cors: {
        origin: isProduction 
            ? [process.env.FRONTEND_URL || 'https://amazonmarketradar.com']
            : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID'],
        exposedHeaders: ['X-Request-ID', 'X-RateLimit-Remaining'],
        maxAge: 86400, // 24 hours
    },

    // Helmet Configuration
    helmet: {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", 'data:', 'https:'],
                connectSrc: ["'self'"],
                fontSrc: ["'self'", 'https://fonts.gstatic.com'],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'none'"],
                frameAncestors: ["'none'"],
                formAction: ["'self'"],
                upgradeInsecureRequests: isProduction ? [] : null,
            }
        },
        crossOriginEmbedderPolicy: isProduction,
        crossOriginOpenerPolicy: { policy: 'same-origin' },
        crossOriginResourcePolicy: { policy: 'same-origin' },
        dnsPrefetchControl: { allow: false },
        frameguard: { action: 'deny' },
        hsts: isProduction ? {
            maxAge: 31536000, // 1 year
            includeSubDomains: true,
            preload: true
        } : false,
        ieNoOpen: true,
        noSniff: true,
        originAgentCluster: true,
        permittedCrossDomainPolicies: { permittedPolicies: 'none' },
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
        xssFilter: true,
    },

    // Cookie Configuration
    cookie: {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/',
        domain: isProduction ? process.env.COOKIE_DOMAIN : undefined
    },

    // JWT Configuration
    jwt: {
        accessTokenExpiry: '15m',
        refreshTokenExpiry: '7d',
        issuer: 'amazonmarketradar.com',
        audience: 'amazonmarketradar-users'
    },

    // Input Validation Limits
    validation: {
        maxBodySize: '10kb',
        maxUrlLength: 2048,
        maxHeaderSize: 8192,
        allowedMimeTypes: ['application/json', 'application/x-www-form-urlencoded'],
    },

    // Sensitive Data Patterns (for sanitization)
    sensitivePatterns: [
        /password/i,
        /secret/i,
        /token/i,
        /api[_-]?key/i,
        /auth/i,
        /credit[_-]?card/i,
        /ssn/i,
        /social[_-]?security/i
    ],

    // IP Blacklist/Whitelist
    ipConfig: {
        // Add known malicious IPs here
        blacklist: [],
        // Admin-only IPs (empty means all allowed)
        adminWhitelist: []
    },

    // Request Fingerprinting
    fingerprint: {
        enabled: isProduction,
        maxRequestsPerFingerprint: 1000,
        windowMs: 60 * 60 * 1000 // 1 hour
    }
};
