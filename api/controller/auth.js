const bcrypt = require('bcrypt');
const { json } = require('body-parser');
const {client:redisClient, sub} = require('../db/redis.js');
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
    // const picturePath = req.files[0].filename;
    //if picturePath exists
    const picturePath = req.files[0].filename;

    const userData = {username, password:hashedPassword, picturePath:picturePath, ...otherData};

    console.log("USERDATA: "+ JSON.stringify(userData));
    console.log('TP: ' + type);

    const userExists = await userModal.checkUser(username);
    if(userExists)
        return res.status(400).json({error:"User with this username exists"}) 
    else{
        try{
            const redisUser = await chatModel.createUser(username, hashedPassword);
            console.log("IDDDDDDD : " + redisUser.id);
            userData.id = Number(redisUser.id);

            console.log("REDIS USER: " + JSON.stringify(redisUser));

            if(type=='Client'){
                const user = {username:username, type:type}
                await clientModal.create(userData);
                //assign user to the session after creating the user /request from client(set the sesson to client)
                req.session.user = user
                console.log("SESION123123:" + JSON.stringify(user));
                //return res.json(req.session.user); //created user
                return res.send(req.session.user)
            }
            else if(type=='Houseworker'){ //houseworker

                const user = {username:username, type:type}
                console.log("EHHHHHHH");
                await houseworkerModal.create(userData);
                req.session.user = user;
                console.log("REQ SESSION<> :" + JSON.stringify(req.session.user));
                //return res.json(req.session.user);
                return res.send(req.session.user)
            }
        }
        catch(error){
            console.error("Error during creating user");
            res.status(500).json({error:"An error during user registration"})
        }
        
    } 

}

const login = async(req,res)=>{
    try{
        console.log("PREEEE SESSION: " + JSON.stringify(req.session))
        if(req.session.user)
            return res.json({connect:"You are still logged in"});
    
        const {username, password} = req.body;
        const user = await userModal.findByUsername(username);
        if(!user)
            return res.status(404).json({error: "User not found"});
        
        const userType = user.type;
        const userInfo = user.props;
    
        const match = bcrypt.compareSync(password, userInfo.password); 
        //password from client and hashed password from DB
        //if(user && match){ //both is unecessery because if match is true then 100% is user true
        if(match){
            //Take UserID from redisDB for chat purpose
            try{ //because get method return promise (need to be try-catched)
                const userRedis = await get(`username:${username}`); //user:{userID}
                console.log("USERRRRR : "  + user);

                let userID = userRedis.split(':')[1]; //[user, {userID}]
        
                req.session.user = {username:username, type:userType, userID:userID}
                console.log("SESSSSSLogion22222222: " + JSON.stringify(req.session))

                // if("Client"){
                //     sub.subscribe('OnlineUsers', (err) => {
                //         if (err) {
                //           console.error('Failed to subscribe to Redis channel:', err);
                //         } else {
                //           console.log(`Houseworker ${username} subscribed to notifications.`);
                //         }
                //       });
                // }

                if("Houseworker"){
                    sub.subscribe('Notifications', (err) => {
                        if (err) {
                          console.error('Failed to subscribe to Redis channel:', err);
                        } else {
                          console.log(`Houseworker ${username} subscribed to notifications.`);
                        }
                      });
                }

                return res.send(req.session.user)
            }
            catch(error){
                console.error("Error durring getting user id", error);
                return res.status(500).json({error: "Can't get the redis ID"})
            }
        }
        else
            return res.status(401).json({error: "Incorrect username or password"});
            //THIS should be caught as error.response - to get error object
            //and then error.response.data.error to get this json prop

            //return res.send({error: "Incorrect username or password"});
            
    }
    catch(error){
        console.error("Error during login: ", error );
        return res.status(500).json({error:"An internal error occurred"});
    }
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
        return res.json({error:"You're not logged"})
   
}




module.exports ={
    register,
    login,
    logout
}