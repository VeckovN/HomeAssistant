const bcrypt = require('bcrypt');
const {getUserIdByUsername} = require('../db/redisUtils.js');
const clientModel = require('../model/Client');
const houseworkerModel = require('../model/HouseWorker');
const userModel = require('../model/User');
const chatModel = require('../model/Chat');
const {cloudinary} = require('../utils/cloudinaryConfig.js');
const {faker} = require('@faker-js/faker'); 

const register = async (req,res)=>{
    try{
        const {username,password,type, ...otherData} = req.body;
        const hashedPassword = bcrypt.hashSync(password, 12);

        let picturePath = null;
        if (req.files && req.files[0]) { // Check for file in req.files array
            const file = req.files[0];
            try{
                const uploadResult = await cloudinary.uploader.upload(file.path, {
                    folder: 'avatars', // Optional folder for organization
                });
                picturePath = uploadResult.secure_url; // Cloudinary URL
                picturePublicId = uploadResult.public_id;
            }
            catch(error){
                console.error("Failed to upload image: ", error);
            }
        }

        console.log("\n picturePathCloudinary: ", picturePath, " publicID: ", picturePublicId);
        //real path to stored image (all users just use this path to dispaly image with src)
        //picturePathCloudinary: https://res.cloudinary.com/dwcncwmpb/image/upload/v1735382754/avatars/wvsgq7k9nbg84q8k5fpk.jpg

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
    //same error message for userNotFound and inncorectPassword
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
    const usersInfo = await userModel.getAllUsersnameWithPicturePath();
    try{
        await Promise.all(usersInfo.map(async (el) =>{
            let userID = parseInt(el.id);
            let hsetKey = `user:${userID}`
            await hset(hsetKey, 'picturePath', el.picturePath);
        }));

        return res.send("SUCCESSFULLY PICTURE PUT TO REDIS");
    }
    catch(error){
        console.error("Error with puting picturePath to Redis User hash")
    }
}



const userSeeder = async(req,res)=>{ 

    const { clientCount, houseworkerCount } = req.body;

    // Predefined options
    const city_options = [
        'Beograd', 'Novi Sad', 'Nis', 'Kragujevac', 'Subotica', 'Leskovac', 'Pancevo', 
        'Cacak', 'Krusevac', 'Kraljevo', 'Novi Pazar', 'Smederevo', 'Uzice', 'Valjevo', 
        'Vranje', 'Sabac', 'Sombor', 'Pozarevac', 'Pirot', 'Zajecar', 'Bor', 'Kikinda', 
        'Sremska Mitrovica', 'Jagodina', 'Vrsac'
    ];

    const profession_options = [
        'Housekeeper', 'Nanny', 'Personal Chef', 'Gardener', 'Personal Driver',
        'Elderly Caregiver', 'Pet Sitter', 'Home Health Aide', 'Personal Shopper', 'Butler'
    ];

    const genders = ['Male', 'Female']; // Only male and female


    const uploadImageToCloudinary = async (imageUrl) => {
        try{
            const uploadResult = await cloudinary.uploader.upload(imageUrl, {
                folder: 'avatars', // Optional folder for organization
            });
            console.log("uploadResult: ", uploadResult);
            return {
                picturePath: uploadResult.secure_url, // Cloudinary URL
                picturePublicId: uploadResult.public_id // Public ID for future reference
            };
        }
        catch(error){
            console.error("Failed to upload image: ", error);
            return {picturePath:null, picturePublicId:null};
        }
    }

    const generateClient = () => {
    // const generateClient = async () => {
        //uploading to cloudinary
        // const imageUrl = faker.image.avatar()
        // const {picturePath, picturePublicId} = await uploadImageToCloudinary(imageUrl);

        return{
            username: faker.internet.username(),
            email: faker.internet.email(),
            password: 'same',
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            // picturePath,
            // picturePublicId,
            picturePath: faker.image.avatar(),
            picturePublicId: faker.string.uuid(),
            city: faker.helpers.arrayElement(city_options),
            gender: faker.helpers.arrayElement(genders),
            interests: faker.helpers.arrayElements(profession_options, faker.number.int({ min: 1, max: 3 })).join(',')
        }

    };
    
    const generateHouseworker = () => {
    // const generateHouseworker = async () => {
        // const imageUrl = faker.image.avatar()
        // const {picturePath, picturePublicId} = await uploadImageToCloudinary(imageUrl);
        // console.log("picturePath: ", picturePath);
        // console.log("picturePublicId: ", picturePublicId);

        return{
            username: faker.internet.username(),
            email: faker.internet.email(),
            password: 'same',
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            // picturePath,
            // picturePublicId,
            picturePath: faker.image.avatar(), 
            picturePublicId: faker.string.uuid(),
            address: faker.location.streetAddress(),
            description: faker.lorem.sentence(),
            phoneNumber: faker.phone.number(),
            age: faker.number.int({ min: 18, max: 65 }),
            city: faker.helpers.arrayElement(city_options),
            gender: faker.helpers.arrayElement(genders),
            houseworkerProfessions: JSON.stringify(
                faker.helpers.arrayElements(profession_options, faker.number.int({ min: 1, max: 3 })).map(prof => ({
                    label: prof,
                    working_hour: faker.number.int({ min: 5, max: 12 }) // Random working hours
                }))
            )
        }
    };

    try{
        const seedClients = async (count) => {
            const users = [];
            for (let i = 0; i < count; i++) {
                // const user = await generateClient();
                const user = generateClient();
                try {
                    const hashedPassword = bcrypt.hashSync(user.password, 12);
                    const redisUser = await chatModel.createUser(user.username, hashedPassword, user.picturePath, user.picturePublicId);
    
                    if (redisUser.success) {
                        user.id = Number(redisUser.id);
                        user.password = hashedPassword;
                        await clientModel.create(user);
                        users.push(user);
                    }
                } catch (error) {
                    console.error(` Error creating Client:`, error);
                }
            }
            return users;
        };
    
        const seedHouseworkers = async (count) => {
            const users = [];
            for (let i = 0; i < count; i++) {
                // const user = await generateHouseworker();
                const user = generateHouseworker();
                try {
                    const hashedPassword = bcrypt.hashSync(user.password, 12);
                    const redisUser = await chatModel.createUser(user.username, hashedPassword, user.picturePath, user.picturePublicId);
    
                    if (redisUser.success) {
                        user.id = Number(redisUser.id);
                        user.password = hashedPassword;
                        await houseworkerModel.create(user);
                        users.push(user);
                    }
                } catch (error) {
                    console.error(`Error creating Houseworker:`, error);
                }
            }
            return users;
        };
    
        const clientsData = await seedClients(clientCount);
        const houseworkersData = await seedHouseworkers(houseworkerCount);
        
        console.log("Seeding users succeeded");
        res.status(200).send({
            success:true, 
            message:"Client and Houseworker successfully seeded",
            data:{client:clientsData, houseworker: houseworkersData}
        });
    }
    catch(err){
        console.error("Seeder Error: ", err);
        return res.status(500).json({error:"Error seeding users"});
    }                
}

module.exports ={
    register,
    login,
    logout,
    putPicturePathToRedisUsers,
    userSeeder,
}