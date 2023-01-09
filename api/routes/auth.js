const express = require('express');
// const uploadMulter = require('../utils/Multer.js');

const {
    register,
    login,
    logout
}
= require('../controller/auth');

const router = express.Router();

//route wiht files (//formData = new FormData used on Front to take file)
// router.post('/register', uploadMulter.single("picture", register));

//router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout)


module.exports = router;