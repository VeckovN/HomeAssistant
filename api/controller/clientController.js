const clientModel = require('../model/Client');
const userModel = require('../model/User');
const bcrypt = require('bcrypt');

const getClientByUsername = (req,res)=>{
    const username = req.params.username;
    clientModel.findByUsername(username)
    .then((data)=>{
        const {password, ...clientData} = data; //don't return password
        res.status(200).json(clientData)
    })
    .catch(err=>{
        console.error(err);
        //500 Internal Server Error for unexpected errors in fetching data
        res.status(500).json({error: err.message || "Error with client username"});
    });

}

const getClients = async(req,res)=>{
    try{
        const result = await clientModel.findAll();
        //array of Clients (wiht password)
        const clients = result.map(el =>{
            const {password, ...clientData} = el;
            return clientData;
        })
        //clients without passwords
        res.status(200).json(clients);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Error getting clients"});
    }
}

const getClientInfo = async(req,res)=>{
    const username = req.session.user.username;
    try{
        const result = await clientModel.getInfo(username);
        res.status(200).json(result);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Error with client info"});
    }
}

const getComments = async(req,res)=>{
    try{
        const result = await clientModel.getAllComments(req.params.username);
        res.status(200).json(result);
    }
    catch(err){
        // res.send(err).status(400);
        // res.status(404).json({error:`Comments not found`});
        console.error(err);
        res.status(500).json({error: err.message || "Error finding comments"});
    }
}

const rateHouseworker = async (req,res)=>{
    const clientID = req.session.user.userID;
    try{
        const {client:clientUsername, houseworker:houseworkerUsername, rating} = req.body
        const result = await clientModel.rateHouseworker(clientID, clientUsername, houseworkerUsername ,rating);
        res.status(200).json(result);
    }
    catch(err){
        console.error(err);
        // 500 Internal Server Error for unexpected server errors during rating
        res.status(500).json({error: err.message || "Error rating houseworker"});
    }
}

const deleteComment = async(req,res) =>{
    const username = req.query.client_username;
    const id = req.query.comment_id;
    try{
        await clientModel.deleteComment(username,id);
        res.status(204).send({success:"Successfully deleted"})
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Error deleting comment"});
    }
    
}

const commentHouseworker = async(req, res)=>{
    try{
        const {client, houseworker, comment} = req.body;
        const result = await clientModel.commentHouseworker(client,houseworker, comment);
        //201 Created for new comment
        res.status(201).json(result);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Error posting comment"});
    }
}

const createClient = async(req,res)=>{
    try{
        const clientObj = req.body;
        const result = await clientModel.create(clientObj);
        res.status(201).json(result);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Error creating username"});
    }
}

const udpateClient = async(req,res)=>{
    const file = req.files.avatar;
    const newInfo = {...req.body, file};
    const username = req.session.user.username;
    try{

        if(newInfo.email){
            const emailExists = await userModel.checkEmail(newInfo.email)
            if(emailExists)
                // 409 Conflict if email already exists
                return res.status(409).json({error:"User with this email exists"})
        }   

        //hash password if is password updated
        if(newInfo.password)
            newInfo.password = bcrypt.hashSync(newInfo.password, 12);

        await clientModel.update(username, newInfo);
        //chech if city is necessery to update
        if(newInfo.city)
            await userModel.updateCityRelation(username, newInfo.city);

        res.status(200).send("Successfully updated");
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Error updating username"});
    }
}

const getRecommendedHouseworkers = async(req,res)=>{
    const username = req.params.username;
    try{
        const city = await clientModel.getCity(username);
        const result = await clientModel.recomendedByCityAndInterest(username,city);
        const houseworkers = result.map(el =>{
            const {password, ...houseworkerData} =el;
            return houseworkerData;
        })
        res.status(200).json(houseworkers);
        //const result = await houseworkerModel.findUserWithFilters();
    }catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Error getting recommended houseworkers"});
    }
}

module.exports = {
    getClientByUsername:getClientByUsername,
    getClients:getClients,
    getComments:getComments, 
    rateHouseworker,
    udpateClient,
    deleteComment,
    commentHouseworker,
    createClient,
    getClientInfo,
    getRecommendedHouseworkers
}
