const bcrypt = require('bcrypt');
const {client:redisClient, sub} = require('../db/redis.js');
// const sharp = require('sharp');
//express-session
//To store confidential session data, we can use the express-session package.
// It stores the session data on the server and gives the client
//a session ID to access the session data. 

const clientModal = require('../model/Client');
const houseworkerModal = require('../model/HouseWorker');
const userModal = require('../model/User');
const chatModel = require('../model/Chat');

const {getUserIdByUsername} = require('../db/redisUtils.js');

const register = async (req,res)=>{

    try{
        const {username,password,type, ...otherData} = req.body;
        const hashedPassword = bcrypt.hashSync(password, 12);

        //*TODO BackUp the projects and Upgrade NodeJS 
        //Sharp module support: Node-API v9, including Node.js >= 18.17.0  
        
        //CURRENT NodeJS Version Doesn't support Sharp module 
        //image compression
        // const file = req.files[0];
        // if(file){
        //     try{
        //         const compressedBuffer = await sharp(file.path)
        //             .jpeg({quality: 70})
        //             .toBuffer();

        //         console.log("CompressedBuffer", compressedBuffer);
        //         console.log("\n CompressBuffer size: " + compressedBuffer.length)

        //         // if(compressedBuffer.length > 50 * 1024){
        //         //     compressedBuffer = await sharp(compressedBuffer) // Use the existing buffer
        //         //     .jpeg({ quality: 70}) // Adjust quality as needed
        //         //     .toBuffer();
        //         // }

        //         await sharp(compressedBuffer)
        //             .toFile(`../../client/public/assets/userImages/${file.filename}`)
            
        //     }catch(commpressionError){
        //         console.error("Error compressing image", commpressionError);
        //         //just notify user, the uncompressed image will exist 
        //     }
        // }
        //if is image size above 50kb


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
        catch(redisError){
            console.error("Error during creating user", redisError);
            return res.status(500).json({error:"An error during user registration"})
        }
    }catch(error){
        console.error("Error during registration", error);
        return res.status(500).json({error:"An unexpected register error occurred"});
    }
     
}

const login = async(req,res)=>{
    //same error message for userNotFound and inncorectPassword
    try{
        if(req.session.user)
            return res.json({connect:"You are still logged in"});
    
        const {username, password} = req.body;
        const user = await userModal.findByUsername(username);
        if(!user)
            return res.status(404).json({error: "Incorrect username or password, please try again", errorType:'input'});

        const userType = user.type;
        const userInfo = user.props;
    
        const match = bcrypt.compareSync(password, userInfo.password); 
        //password from client and hashed password from DB
        //if(user && match){ //both is unecessery because if match is true then 100% is user true
        if(match){
            //Take UserID from redisDB for chat purpose
            try{ //because get method return promise (need to be try-catched) 
                const userID = await getUserIdByUsername(username);
                req.session.user = {username:username, type:userType, userID:userID}
                
                return res.send(req.session.user)
            }
            catch(error){
                return res.status(500).json({error: "Can't get the redis ID"})
            }
        }
        else
            // return res.status(401).json({error: "Incorrect username or password", errorType:"password"});
            return res.status(401).json({error: "Incorrect username or password, please try again", errorType:"input"});
            //THIS should be caught as error.response - to get error object
            //and then error.response.data.error to get this json prop      
    }
    catch(error){
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
        return res.clearCookie('sessionLog').json({success:"You're logout now"});
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