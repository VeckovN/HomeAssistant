const bcrypt = require('bcrypt');
const { json } = require('body-parser');
//express-session
//To store confidential session data, we can use the express-session package.
// It stores the session data on the server and gives the client
//a session ID to access the session data. 

const clientModal = require('../model/Client');
const houseworkerModal = require('../model/HouseWorker');
const userModal = require('../model/User')

const register = async (req,res)=>{
    //type='client' or 'houseworker'
    const {username,password, type, ...otherData} = req.body;
    const hashedPassword = bcrypt.hashSync(password, 12);
    //without type data
    const userData = {username, password:hashedPassword, ...otherData};

    console.log("USERDATA: "+ JSON.stringify(userData));

    if(type=='Client'){
        const data = await clientModal.findByUsername(username);
        //this return a null value if there ins't the client
        if(data){
            return res.json({error:"User exists"}).status(400);
        }   
        else{
            const user = {username:username, type:type}
            await clientModal.create(userData);
            //assign user to the session after creating the user /request from client(set the sesson to client)
            req.session.user = user
            console.log("SESION123123:" + JSON.stringify(req.session));
            return res.json(user); //created user
        }
    }
    else if(type=='Houseworker'){ //houseworker
        const data = await houseworkerModal.findByUsername(username);
        console.log(data);
        if(data)
            return res.json({error:"User with this username exists"})
        else{
            const user = {username:username, type:type}
            await houseworkerModal.create(userData);
            req.session.user = user;
            return res.json(user);
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
    const userType = user.type;
    const userInfo = user.props;
    console.log("TYPEEEE: " + userType + "PROPS : " + userInfo);

    const match = bcrypt.compareSync(password, userInfo.password); 
    //password from client and hashed password from DB
    //if(user && match){ //both is unecessery because if match is true then 100% is user true
    if(match){
        req.session.user = {username:username, type:userType}
        // return res.redirect(`/${user.type}`)
        console.log("SESSSSSLogion22222222: " + JSON.stringify(req.session))
        return res.json({connect:"U are logged in"})
    }
    else
        return res.json({error:"User not found"}).status(400);

}

const logout = async(req,res)=>{
    //req.session = null //Deletes the cookies
    //req.session.destroy() //Delets the session in the DB
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