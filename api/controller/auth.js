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

const {get, set, sadd, hset} = require('../db/redis');


const register = async (req,res)=>{
    const {username,password,type, ...otherData} = req.body;
    const hashedPassword = bcrypt.hashSync(password, 12);
    // const picturePath = req.files[0].filename;
    //if picturePath exists
    const picturePath = req.files[0]?.filename;
    const userData = {username, password:hashedPassword, picturePath:picturePath, ...otherData};
    const userExists = await userModal.checkUser(username);
    const emailExist = await userModal.checkEmail(username);

    if(userExists)
        return res.status(400).json({error:"User with this username exists"}) 
    if(emailExist)
        return res.status(400).json({error:"User with this email exists"}) 
    
    try{
        const redisUser = await chatModel.createUser(username, hashedPassword, picturePath);

        if(redisUser.success){
            userData.id = Number(redisUser.id);

            try{
                if(type=='Client'){
                    await clientModal.create(userData);
                    //assign user to the session after creating the user /request from client(set the sesson to client)
                    res.status(200).send({success:true, message:"Client Sucessfully created"});
                }
                else if(type=='Houseworker'){ //houseworker
                    await houseworkerModal.create(userData);
                    res.status(200).send({success:true, message:"Houseworker  Sucessfully created"});
                }
            }
            catch(neo4jError){
                console.error("Neo4j error: " + neo4jError);
                await chatModel.deleteUserOnNeo4JFailure(username, redisUser.id);
                return res.status(500).json({error:"Error creating user in Neo4j"})
            }
        }
    }
    catch(error){
        console.error("Error during creating user");
        return res.status(500).json({error:"An error during user registration"})
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
            return res.status(404).json({error: "User not found!!!"});
        
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

const putPicturePathToRedisUsers = async(req,res) =>{

    const usersInfo = await userModal.getAllUsersnameWithPicturePath();
    console.log("CONTROLLER USER INFO", usersInfo);

    try{
        await Promise.all(usersInfo.map(async (el) =>{
            let userID = parseInt(el.id);
            let hsetKey = `user:${userID}`
            console.log(`${hsetKey} picturePath ${el.picturePath}`);
            await hset(hsetKey, 'picturePath', el.picturePath);
        }));

        return res.send("SUCCESSFULLY PICTURE PUT TO REDIS");
    }
    catch(error){
        console.error("Error with puting picturePath to Redis User hash")
    }
}




module.exports ={
    register,
    login,
    logout,
    putPicturePathToRedisUsers
}