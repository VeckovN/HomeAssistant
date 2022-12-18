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
        res.json(data)
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
        res.json(result);
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




module.exports = {
    getClientByUsername:getClientByUsername,
    getClients:getClients,
    getComments:getComments
}
