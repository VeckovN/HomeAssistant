const express = require('express');
// const uploadMulter = require('../utils/Multer.js');
const UserModel = require('../model/User.js')

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


//ChangePaswwrod method
router.post('/changePassword', async(req,res) =>{

    const username = req.body.username
    const password = req.body.password;

    try{
        const result = await UserModel.changePassword(username, password);
        console.log("RES PASSWOD: " + JSON.stringify(result));
        res.send(result);
    }
    catch(err){
        console.log(err);
        res.status(400);
    }
    
    
})


module.exports = router;