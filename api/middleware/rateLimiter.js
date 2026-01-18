const rateLimit = require('express-rate-limit');

const getKey = (req) => req.ip; 

//Custom hanlders for rate limit 
const rateLimitHandler = (req, res) => {
    res.status(429).json({
        error:"Too many requests, Please try again later.", //client expects 'error'
        retryAfter: Math.ceil(req.rateLimit.resetTime / 1000) //in seconds
    })
}

//Authentication rate limiter
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many registration attempts. Please try again after 15 minutes.',
    //we want to read req.rateLimit.resetTime to set up the 'retryAfter' so it must be put in headers
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: rateLimitHandler,
    keyGenerator: getKey
})

// Login rate limiter (slightly more lenient than register)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 10,
    message: 'Too many login attempts. Please try again after 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
    keyGenerator: getKey
});


//General API READ operations limiter
const apiReadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests. Please slow down.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
    keyGenerator: getKey
}) 

const apiWriteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 50,
    message: 'Too many requests. Please slow down',
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
    keyGenerator: getKey
})

const healthLimiter = rateLimit({
    windowMs: 2 * 60 * 1000, 
    max: 30,
    message: 'Too many health check requests.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
    keyGenerator: getKey
})

//Chat operation limits for messages - 60 messages per minute
const chatLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 60,
    message: 'You are sending messages too quickly. Please slow down.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
    keyGenerator: getKey,
    // Only count failed requests for chat
    skipSuccessfulRequests: true,
})

module.exports = { 
    authLimiter,
    loginLimiter,
    apiReadLimiter,
    apiWriteLimiter,
    healthLimiter,
    chatLimiter
}