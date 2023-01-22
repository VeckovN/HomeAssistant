const clientModel = require('../model/Client');
const bcrypt = require('bcrypt');

const getClientByUsername = (req,res)=>{
    const username = req.params.username;
    clientModel.findByUsername(username)
    .then((data)=>{
        //console.log("THEN DATA " + JSON.stringify(data));
        // res.send(data).status(201);
        
        //prvent password returning
        const {password, ...clientData} = data;
        // res.json(data)
        res.json(clientData)
    })
    .catch(err=>{
        console.log("ERROR: " + err);
        res.send(err).status(400);
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
        res.send(err).status(400);
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
    }
}

const rateHouseworker = async (req,res)=>{
    try{
        // console.log("ASSS:" + req.body);
        //ClientUsername from session
        //client = req.session.user.username
        const client = req.body.client;
        const houseWorker = req.body.houseworker;
        const rating = req.body.rating;
        // const result = await clientModel.rateHouseworker(houseWorker,rating);
        const result = await clientModel.rateHouseworker(client, houseWorker,rating);
        // const result = await clientModel.rateHouseworker(client, houseWorker,rating);
        res.json(result);
    }
    catch(err){
        console.log("Error Rating: " + err);
        res.send(err).status(400);
    }
}

const commentHouseworker = async(req, res)=>{
    try{
        //we comment
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
        res.send(err).status(400);
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

        //hash password if is password updated
        if(newInfo.password)
            newInfo.password = bcrypt.hashSync(newInfo.password, 12);
        
        const result = await clientModel.update(username,newInfo);
        console.log("CLIENT UPDATED!!!");
        console.log("NEWINFO " + JSON.stringify(newInfo));

        //chech if city is necessery to update
        if(newInfo.city)
            await clientModel.updateCity(username,newInfo.city)
            //console.log("CITY UPDATED")
        res.json(result);
        
    }
    catch(err){
        console.log("Error UpdateClient(Yourself): " + err);
        return res.status(406).send("Error with updating");
    }
}

const getRecommendedHouseworkers = async(req,res)=>{
    const username = req.params.username;
    try{

        console.log("USERNAMEEE: " + username);

        const city = await clientModel.getCity(username);

        console.log("CITTTTYYYYY : " + city);

        //take filter parameters from url
        const result = await clientModel.recomendedByCityAndInterest(username,city);

        const houseworkers = result.map(el =>{
            const {password, ...houseworkerData} =el;
            return houseworkerData;
        })

        console.log("\n HOUSEWORKERS: \n " + JSON.stringify(houseworkers));

        res.json(houseworkers);

        //const result = await houseworkerModel.findUserWithFilters();
    }catch(err){
        console.log("ERROR HouseworkerFilters: " + err);
        res.send(err);
    }
}




module.exports = {
    getClientByUsername:getClientByUsername,
    getClients:getClients,
    getComments:getComments, 
    rateHouseworker,
    udpateClient,
    commentHouseworker,
    createClient,
    getClientInfo,
    getRecommendedHouseworkers
}
