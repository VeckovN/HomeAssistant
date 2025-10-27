const bcrypt = require('bcrypt');
const {getUserIdByUsername} = require('../db/redisUtils.js');
const clientModel = require('../model/Client');
const houseworkerModel = require('../model/HouseWorker');
const userModel = require('../model/User');
const chatModel = require('../model/Chat');
const {uploadToCloudinaryBuffer} = require('../utils/cloudinaryConfig.js');

const register = async (req,res)=>{
    try{
        const {username,password,type, ...otherData} = req.body;
        const hashedPassword = bcrypt.hashSync(password, 12);

        let picturePath = null;
        let picturePublicId = null;
        if (req.files && req.files.avatar) {
            const file = req.files.avatar;
            try{
                if (req.files.avatar.size > 5 * 1024 * 1024) {
                     return res.status(400).json({ error: 'File is too large. Max 5MB allowed.' });
                }
                
                const uploadResult = await uploadToCloudinaryBuffer(file.data, 'avatars')
                picturePath = uploadResult.secure_url; // Cloudinary URL
                picturePublicId = uploadResult.public_id;
            }
            catch(error){
                console.error("Failed to upload image: ", error);
                res.status(400).json({error: "Image uplaod failed"});
            }
        }

        const userData = {username, password:hashedPassword, picturePath:picturePath, picturePublicId:picturePublicId, ...otherData};
        const userExists = await userModel.checkUser(username);
        const emailExist = await userModel.checkEmail(username);

        if(userExists)
            return res.status(400).json({error:"User with this username exists"}) 
        if(emailExist)
            return res.status(400).json({error:"User with this email exists"}) 
        
        try{
            const redisUser = await chatModel.createUser(username, hashedPassword, picturePath, picturePublicId);

            if(redisUser.success){
                // userData.id = Number(redisUser.id);
                userData.id = parseInt(redisUser.id, 10);

                try{
                    if(type=='Client'){
                        await clientModel.create(userData);
                        res.status(200).send({success:true, message:"Client Sucessfully created"});
                    }
                    else if(type=='Houseworker'){
                        await houseworkerModel.create(userData);
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
    try{
        if(req.session.user){
            return res.send(req.session.user)
        }
    
        const {username, password} = req.body;
        const user = await userModel.findByUsername(username);
        if(!user)
            return res.status(404).json({error: "Incorrect username or password, please try again", errorType:'input'});

        const userType = user.type;
        const userInfo = user.props;
    
        const match = bcrypt.compareSync(password, userInfo.password); 
        if(match){
            try{
                const userID = await getUserIdByUsername(username);
                req.session.user = {username:username, type:userType, userID:userID}
                
                //Ensure session is saved before sending response (in production the cookie session isn't stored)
                req.session.save((err) => {
                    if (err) return res.status(500).json({ error: "Session save failed" });
                    res.send(req.session.user);
                });
                // return res.send(req.session.user)
            }
            catch(error){
                return res.status(500).json({error: "Can't get the redis ID"})
            }
        }
        else
            return res.status(401).json({error: "Incorrect username or password, please try again", errorType:"input"});
            //THIS should be caught as error.response - to get error object
            //and then error.response.data.error to get this json prop      
    }
    catch(error){
        return res.status(500).json({error:"An internal error occurred"});
    }
}

const logout = async(req,res)=>{
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

module.exports ={
    register,
    login,
    logout
}