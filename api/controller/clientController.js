const clientModel = require('../model/Client');
const bcrypt = require('bcrypt');

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

//Logged client
// const getClient = async (req,res)=>{
//     // const username = req.params.username;
//     const username = req.session.user.username;
//     //THIS IS A PROMISE

//     try{
//         const result = await clientModel.findByUsername(username)
//         const {password, ...clientData} = data;
//         // res.json(data)
//         res.json(clientData)
//     }
//     catch(err){
//         console.log("ERROR: " + err);
//         res.send(err).status(400);
//     }
// }


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

// const commentHouseworker = async(req, res)=>{
//     try{
//         const ourUsername = req.session.user.username
//         const houseworker = req.body.username;
//         const comment = req.body.comment;
//         console.log("JSSSOSOSOSO: " + ourUsername + "/ " + houseworker + "/ " + comment)
//         const result = await clientModel.commentHouseworker(ourUsername,houseworker, comment);
//         console.log("RESSS: " +  JSON.stringify(result));
//         res.json(result);
//     }
//     catch(err){
//         console.log("Error Comment: " + err);
//         res.send(err).status(400);
//     }
// }
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
        //Catch in front wiht axios try catch  (THIS will shotdown server functionality)
        //throw new Error("Error with client profile update")

        // THIS wont stop the server
        return res.status(406).send("Error with updating");
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
    createClient,
    getClientInfo
}
