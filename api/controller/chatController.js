const chatModal = require('../model/Chat')


const getRoomId = async(req,res)=>{
    
}

const getUserIdByUsername = async(req,res)=>{

}

//get all messages from roomID(selected room)
//app.get(/room/:id/messages)
//using req.query becase we have in url .../message?offset=0?size=50
//BECASE THIS IS GET METHOD, if we wanna post/put we could use req.body to take value from body of request
// http://localhost:5000/api/chat/room/1:2/messages?offset=0&size=50
const getMessages = async(req,res)=>{
    const roomID = req.params.id;
    const offset = req.query.offset;
    const size = req.query.size;
    try{
        const messages = await chatModal.getMessages(roomID, offset, size);
        //return res.status(200).send(messages);
        // res.json({room:roomID, offset:offset, size:size});
        res.json(messages);
    }
    catch(err){
        console.log(err);
        res.status(400);
    }
}

const sendMessage = async(req,res)=>{
    const message = req.body;
    const obj =  await chatModal.sendMessage(message);
    res.json(obj)
    // console.log("CONTROL: " + obj);
}

const getAllRooms = async(req,res)=>{
    // const username = req.session.user.username;
    const username = "Novak"
    console.log("ROOM USERNAME: " + username);
    try{
        const result = await chatModal.getAllRooms(username);
        res.json(result);
    }catch(err){
        console.log(err);
        res.status(400).send("error getAllRooms");
    }
}

module.exports ={
    getRoomId,
    getUserIdByUsername,
    getMessages,
    sendMessage,
    getAllRooms


}