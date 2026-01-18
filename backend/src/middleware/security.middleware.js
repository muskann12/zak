/**
 * Advanced Security Middleware
 * Additional security layers for the backend
 */

const crypto = require('crypto');
const securityConfig = require('../config/security');

/**
 * Request ID Generator - Adds unique ID to each request for tracking
 */
const requestId = (req, res, next) => {
    req.requestId = crypto.randomUUID();
    res.setHeader('X-Request-ID', req.requestId);
    next();
};

/**
 * IP Blacklist Check
 */
const ipBlacklist = (req, res, next) => {
    const clientIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    
    if (securityConfig.ipConfig.blacklist.includes(clientIp)) {
        return res.status(403).json({
            success: false,
            message: 'Access denied',
            code: 'IP_BLOCKED'
        });
    }
    
    next();
};

/**
 * Admin IP Whitelist (for admin routes)
 */
const adminIpWhitelist = (req, res, next) => {
    const whitelist = securityConfig.ipConfig.adminWhitelist;
    
    // If whitelist is empty, allow all
    if (whitelist.length === 0) {
        return next();
    }
    
    const clientIp = req.ip || req.connection.remoteAddress;
    
    if (!whitelist.includes(clientIp)) {
        return res.status(403).json({
            success: false,
            message: 'Access denied',
            code: 'ADMIN_IP_RESTRICTED'
        });
    }
    
    next();
};

/**
 * Sanitize Request Body - Remove potential XSS vectors
 */
const sanitizeBody = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }
    next();
};

const sanitizeObject = (obj) => {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeString(value);
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = Array.isArray(value) 
                ? value.map(v => typeof v === 'string' ? sanitizeString(v) : v)
                : sanitizeObject(value);
        } else {
            sanitized[key] = value;
        }
    }
    
    return sanitized;
};

const sanitizeString = (str) => {
    return str
        .replace(/[<>]/g, '') // Remove < and >
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .replace(/data:/gi, '') // Remove data: protocol
        .trim();
};

/**
 * Sensitive Data Logger Filter - Masks sensitive data in logs
 */
const filterSensitiveData = (data) => {
    if (typeof data !== 'object' || data === null) {
        return data;
    }
    
    const filtered = { ...data };
    const patterns = securityConfig.sensitivePatterns;
    
    for (const key of Object.keys(filtered)) {
        if (patterns.some(pattern => pattern.test(key))) {
            filtered[key] = '***REDACTED***';
        } else if (typeof filtered[key] === 'object') {
            filtered[key] = filterSensitiveData(filtered[key]);
        }
    }
    
    return filtered;
};

/**
 * Request Size Validator
 */
const validateRequestSize = (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    const maxSize = parseInt(securityConfig.validation.maxBodySize, 10) * 1024; // Convert kb to bytes
    
    if (contentLength > maxSize) {
        return res.status(413).json({
            success: false,
            message: 'Request body too large',
            code: 'PAYLOAD_TOO_LARGE'
        });
    }
    
    next();
};

/**
 * Content-Type Validator
 */
const validateContentType = (req, res, next) => {
    // Skip for GET requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }
    
    const contentType = req.headers['content-type']?.split(';')[0];
    const allowed = securityConfig.validation.allowedMimeTypes;
    
    if (contentType && !allowed.includes(contentType)) {
        return res.status(415).json({
            success: false,
            message: 'Unsupported media type',
            code: 'UNSUPPORTED_MEDIA_TYPE'
        });
    }
    
    next();
};

/**
 * SQL Injection Detection (basic patterns)
 */
const detectSqlInjection = (req, res, next) => {
    const sqlPatterns = [
        /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
        /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
        /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
        /((\%27)|(\'))union/i,
        /exec(\s|\+)+(s|x)p\w+/i,
        /UNION(\s+)SELECT/i,
        /INSERT(\s+)INTO/i,
        /DELETE(\s+)FROM/i,
        /DROP(\s+)TABLE/i,
        /UPDATE(\s+)\w+(\s+)SET/i
    ];
    
    const checkValue = (value) => {
        if (typeof value === 'string') {
            return sqlPatterns.some(pattern => pattern.test(value));
        }
        return false;
    };
    
    const checkObject = (obj) => {
        for (const value of Object.values(obj)) {
            if (checkValue(value)) return true;
            if (typeof value === 'object' && value !== null) {
                if (checkObject(value)) return true;
            }
        }
        return false;
    };
    
    // Check query params, body, and URL
    if (checkObject(req.query) || checkObject(req.body || {}) || checkValue(req.url)) {
        console.warn(`[SECURITY] SQL Injection attempt detected from ${req.ip}`);
        return res.status(400).json({
            success: false,
            message: 'Invalid request',
            code: 'INVALID_REQUEST'
        });
    }
    
    next();
};

/**
 * Request Logging (security audit)
 */
const securityLogger = (req, res, next) => {
    const startTime = Date.now();
    
    // Log request
    const logData = {
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString()
    };
    
    // Log response on finish
    res.on('finish', () => {
        logData.statusCode = res.statusCode;
        logData.duration = Date.now() - startTime;
        
        // Only log errors and suspicious activity in production
        if (process.env.NODE_ENV === 'production') {
            if (res.statusCode >= 400) {
                console.log('[SECURITY_AUDIT]', JSON.stringify(filterSensitiveData(logData)));
            }
        } else {
            // Log all in development
            console.log('[REQUEST]', JSON.stringify(filterSensitiveData(logData)));
        }
    });
    
    next();
};

/**
 * Bot Detection (basic)
 */
const detectBot = (req, res, next) => {
    const userAgent = req.headers['user-agent'] || '';
    
    const botPatterns = [
        /bot/i,
        /spider/i,
        /crawler/i,
        /scraper/i,
        /curl/i,
        /wget/i,
        /python-requests/i,
        /postman/i,
        /insomnia/i
    ];
    
    // Allow bots for public routes, block for sensitive routes
    const sensitiveRoutes = ['/api/auth', '/api/wallet', '/api/admin'];
    const isSensitiveRoute = sensitiveRoutes.some(route => req.path.startsWith(route));
    
    if (isSensitiveRoute && botPatterns.some(pattern => pattern.test(userAgent))) {
        // Don't block, but flag for rate limiting
        req.isBot = true;
    }
    
    next();
};

/**
 * Error Handler that hides internal details
 */
const secureErrorHandler = (err, req, res, next) => {
    console.error('[ERROR]', {
        requestId: req.requestId,
        error: err.message,
        stack: err.stack
    });
    
    // Don't leak error details in production
    if (process.env.NODE_ENV === 'production') {
        return res.status(err.status || 500).json({
            success: false,
            message: 'An error occurred',
            requestId: req.requestId
        });
    }
    
    // More details in development
    return res.status(err.status || 500).json({
        success: false,
        message: err.message,
        requestId: req.requestId,
        stack: err.stack
    });
};

module.exports = {
    requestId,
    ipBlacklist,
    adminIpWhitelist,
    sanitizeBody,
    filterSensitiveData,
    validateRequestSize,
    validateContentType,
    detectSqlInjection,
    securityLogger,
    detectBot,
    secureErrorHandler
};
