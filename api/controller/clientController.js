const clientModel = require('../model/Client');

const getClientByUsername = (req,res)=>{
    //One way with chaining .then()
    const username = req.params.username;
    //THIS IS A PROMISE
    // const client = clientModel.findByUsername(username)
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

    //or using async.await
    //const client = await clientModel.findByUsername(username);
    // try{
    //     //from body
    //     // const username = req.body.username;
    //     //from url
    //     const username = req.params.username;

    //     //THIS IS A PROMISE

    //     //const client = await clientModel.findByUsername(username);

    //     console.log("CLIENTTT: " + client);
    //     res.send(client).status(201);
    // }catch(err){
    //     console.log("ERRPR WITH CONTROLLER");
    //     res.send('ERRORRRRR').status(400);
    // }

}

const getClients = async(req,res)=>{
    //with await/async is simplier 
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
        const houseWorker = req.body.houseworker;
        const rating = req.body.rating;
        const result = await clientModel.rateHouseworker(houseWorker,rating);
        res.json(result);
    }
    catch(err){
        console.log("Error Rating: " + err);
        res.send(err).status(400);
    }
}

const commentHouseworker = async(req, res)=>{
    try{
        const houseworker = req.body.username;
        const comment = req.body.comment;
        const result = await clientModel.commentHouseworker(houseworker, comment);
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
        const result = await clientModel.update(newInfo);
        res.json(result);
    }
    catch(err){
        console.log("Error UpdateClient(Yourself): " + err);
        res.send(err).status(400);
    }
}


//Coomment should have the ID
const deleteCommentById = async(req,res)=>{
    try{

    }
    catch(err){

    }
}


module.exports = {
    getClientByUsername:getClientByUsername,
    getClients:getClients,
    getComments:getComments, 
    rateHouseworker,
    udpateClient,
    commentHouseworker,
    createClient
}
