const clientModel = require('../model/Client');
const userModel = require('../model/User');
const bcrypt = require('bcrypt');

const getClientByUsername = (req,res)=>{
    const username = req.params.username;
    clientModel.findByUsername(username)
    .then((data)=>{
        //prvent password returning
        const {password, ...clientData} = data;
        res.json(clientData)
    })
    .catch(err=>{
        console.log("ERROR: " + err);
        res.status(400).json({error:'Error with client username'});
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
        res.json(clients);
    }
    catch(err){
        console.log("Error getClients: " + err);
        res.status(400).json({error:'Clients error'});
    }
}

const getClientInfo = async(req,res)=>{
    //logged user session
    try{
        const username = req.session.user.username;

        const result = await clientModel.getInfo(username);
        res.json(result);
    }
    catch(err){
        console.log("ERROR GetClientInfo: " + err);
        res.status(500).json({error:'You cant add user to ROom'});
    }
}


const getComments = async(req,res)=>{
    try{
        const result = await clientModel.getAllComments(req.params.username);
        res.json(result);
    }
    catch(err){
        console.log("Error getComments: " + err);
        res.send(err).status(400);
        res.status(404).json({error:`Comments not found`});
    }
}

const rateHouseworker = async (req,res)=>{
    try{
        //client = req.session.user.username
        const client = req.body.client;
        const houseWorker = req.body.houseworker;
        const rating = req.body.rating;
        const result = await clientModel.rateHouseworker(client, houseWorker,rating);
        res.json(result);
    }
    catch(err){
        console.log("Error Rating: " + err);
        res.status(400).json({error:'Rate House error'});
    }
}

const deleteComment = async(req,res) =>{
    try{
        const username = req.query.client_username;
        const id = req.query.comment_id;
    
        await clientModel.deleteComment(username,id);
        console.log("COMMENT: " + id + " username: " + username);
        res.send({success:"Successfully deleted"}).status(200);
    }
    catch(err){
        console.log("Error delete comment: " + err);
        res.status(400).json({error:'Delete comment Error'});
    }
    
}

const commentHouseworker = async(req, res)=>{
    try{
        // const client = req.session.user.username;
        const client= req.body.client
        const houseworker = req.body.houseworker;
        const comment = req.body.comment;
        console.log("JSSSOSOSOSO: " + client + "/ " + houseworker + "/ " + comment)
        const result = await clientModel.commentHouseworker(client,houseworker, comment);
        console.log("RESSS: " +  JSON.stringify(result));
        res.json(result);
    }
    catch(err){
        console.log("Error Comment: " + err);
        res.status(400).json({error:'Comment error'});
    }
}

const createClient = async(req,res)=>{
    try{
        const clientObj = req.body;
        const result = await clientModel.create(clientObj);
        res.json(result);
    }
    catch(err){
        console.log("Error CreateClient: " + err);
        res.send(err).status(400);
    }
}

const udpateClient = async(req,res)=>{
    try{
        const newInfo = req.body;
        const username = req.session.user.username;

        if(newInfo.email){
            const emailExists = await userModel.checkEmail(newInfo.email)
            if(emailExists)
                return res.status(400).json({error:"User with this email exists"})
        }   

        //hash password if is password updated
        if(newInfo.password)
            newInfo.password = bcrypt.hashSync(newInfo.password, 12);
        
        const result = await clientModel.update(username,newInfo);
        console.log("CLIENT UPDATED!!!");
        console.log("NEWINFO " + JSON.stringify(newInfo));

        //chech if city is necessery to update
        if(newInfo.city)
            await userModel.updateCityRelation(username, newInfo.city);
        res.send("Successfully updated");
    }
    catch(err){
        console.log("Error UpdateClient(Yourself): " + err);
        // return res.status(406).send("Error with updating");
        res.status(400).json({error:'Error with updating'});
    }
}

const getRecommendedHouseworkers = async(req,res)=>{
    const username = req.params.username;
    try{
        const city = await clientModel.getCity(username);
        //take filter parameters from url
        const result = await clientModel.recomendedByCityAndInterest(username,city);

        const houseworkers = result.map(el =>{
            const {password, ...houseworkerData} =el;
            return houseworkerData;
        })
        res.status(200).json(houseworkers);

        //const result = await houseworkerModel.findUserWithFilters();
    }catch(err){
        console.log("ERROR HouseworkerFilters: " + err);
        // res.send(err);
        res.status(400).json({error:'Recomended Houseworker Erros'});
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
