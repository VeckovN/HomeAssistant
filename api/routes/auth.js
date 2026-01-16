const express = require('express');
const { authLimiter, loginLimiter } = require('../middleware/rateLimiter.js');

const {
    register,
    login,
    logout,
}
= require('../controller/auth');

const router = express.Router();

router.post('/register', authLimiter ,register);
router.post('/login', loginLimiter , login);
router.post('/logout', logout) 
module.exports = router;