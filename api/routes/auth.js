const express = require('express');

const {
    register,
    login,
    logout,
    changePassword,
    putPicturePathToRedisUsers
}
= require('../controller/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout)
router.post('/changePassword', changePassword)
router.get('/redisUser', putPicturePathToRedisUsers);

module.exports = router;