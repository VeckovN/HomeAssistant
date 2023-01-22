const bcrypt = require('bcrypt');
const { json } = require('body-parser');
//express-session
//To store confidential session data, we can use the express-session package.
// It stores the session data on the server and gives the client
//a session ID to access the session data. 

const clientModal = require('../model/Client');
const houseworkerModal = require('../model/HouseWorker');
const userModal = require('../model/User');
const chatModel = require('../model/Chat');

const {get, set, sadd } = require('../db/redis');


const register = async (req,res)=>{
    //type='client' or 'houseworker'
    const {username,password, type, ...otherData} = req.body;
    const hashedPassword = bcrypt.hashSync(password, 12);
    //without type data and with picturePath
    const picturePath = req.files[0].filename;
    const userData = {username, password:hashedPassword, picturePath:picturePath, ...otherData};

    console.log("USERDATA: "+ JSON.stringify(userData));
    console.log('TP: ' + type);

    const userExists = await userModal.checkUser(username);
    console.log("DAAAAA: " + JSON.stringify(userExists));

    if(userExists)
        return res.status(400).json({error:"User with this username exists"}) 
    else{

        const redisUser = await chatModel.createUser(username, hashedPassword);
        console.log("IDDDDDDD : " + redisUser.id);
        userData.id = Number(redisUser.id);

        console.log("REDIS USER: " + JSON.stringify(redisUser));

        if(type=='Client'){

            const user = {username:username, type:type}
            await clientModal.create(userData);
            //assign user to the session after creating the user /request from client(set the sesson to client)
            req.session.user = user
            console.log("SESION123123:" + JSON.stringify(req.session));
            return res.json(user); //created user


        }
        else if(type=='Houseworker'){ //houseworker

            const user = {username:username, type:type}
            console.log("EHHHHHHH");
            await houseworkerModal.create(userData);
            req.session.user = user;
            return res.json(user);

            // const data = await houseworkerModal.findByUsername(username);
            // console.log("EXIST:" + data);
            // if(data)
            //     return res.json({error:"User with this username exists"})
            // else{
            //     const user = {username:username, type:type}
            //     console.log("EHHHHHHH");
            //     await houseworkerModal.create(userData);
            //     req.session.user = user;
            //     return res.json(user);
            // }
        }
    } 

}

const login = async(req,res)=>{

    console.log("PREEEE SESSION: " + JSON.stringify(req.session))

    if(req.session.user)
        // return res.redirect(`/${req.session.user.type}`) // /client or /houseworker
        return res.json({connect:"You are still logged in"});

    const {username, password} = req.body;
    //find user by username and password no matter what type it is
    const user = await userModal.findByUsername(username);
    if(!user)
        return res.send({error:"Korisnik nije pronadjen"})
    const userType = user.type;
    const userInfo = user.props;
    console.log("TYPEEEE: " + userType + "PROPS : " + userInfo);

    const match = bcrypt.compareSync(password, userInfo.password); 
    //password from client and hashed password from DB
    //if(user && match){ //both is unecessery because if match is true then 100% is user true
    if(match){
        //Take UserID from redisDB for chat purpose
        const userRedis = await get(`username:${username}`); //user:{userID}
        console.log("USERRRRR : "  + user);
        console.log("USEEEEEERRRRRR");
        let userID = userRedis.split(':')[1]; //[user, {userID}]

        req.session.user = {username:username, type:userType, userRedisID:userID}
        console.log("SESSSSSLogion22222222: " + JSON.stringify(req.session))
        return res.send(req.session.user)
    }
    else
        return res.send({error:"Pogresna lozinka ili korisnicko ime"})

}

const logout = async(req,res)=>{

    console.log("LOOGOUTTT: " + JSON.stringify(req.session))
    if(req.session.user){
        req.session.destroy((err)=>{
            if(err)
                return res.json({error:err.message}).status(400);
        })
        return res.json({success:"You're logout now"});
    }
    else
        return res.json({errorr:"You're not logged"})
   
}




module.exports ={
    register,
    login,
    logout
}