const chatModal = require('../model/Chat')

//using req.query because url .../message?offset=0?size=50
//BECASE THIS IS GET METHOD, if we wanna post/put we could use req.body to take value from body of request
// http://localhost:5000/api/chat/room/1:2/messages?offset=0&size=50
const getMessages = async(req,res)=>{
    const roomID = req.params.id;
    const offset = req.query.offset;
    const size = req.query.size;
    try{
        const messages = await chatModal.getMessages(roomID, offset, size);
        res.json(messages);
    }
    catch(err){
        console.log(err);
        res.status(400).json({error:"Message Errors"});
    }
}

const getAllRooms = async(req,res)=>{
    try{
        const username = req.params.username;
        const result = await chatModal.getAllRooms(username);
        res.json(result);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Error durring getting all rooms"});
    }
}

const deleteRoom = async(req, res)=>{
    const roomID = req.body.roomID
    console.log("DELETE ROOMID:" + JSON.stringify(roomID));
    try{
        await chatModal.deleteRoomByRoomID(roomID);
        res.status(200).send("Room sucessfully deleted");
    }
    catch(err){
        console.log(err);
        res.status(400).json({error:"Room can't be deleted"});
    }
}

const addUserToRoom = async(req,res) =>{

    const roomID = req.body.roomID;
    const newUsername = req.body.newUsername;
    console.log("ROOMID: " + roomID + " newUsername " + newUsername);
    
    try{
        const result = await chatModal.addUserToRoom(newUsername, roomID);
        res.status(200).json(result);
    }
    catch(err){
        res.status(400).json({error:'You cant add user to ROom'});
    }
}

const getConversationCount = async(req,res)=>{
    try{
        const userID = req.params.userID;
        const result = await chatModal.getRoomCount(userID);
        res.status(200).json(result);
    }
    catch(err){
        res.status(400).json({error: 'Conversetion Count error'})
    }
}

module.exports ={
    getMessages,
    getAllRooms,
    deleteRoom,
    addUserToRoom,
    getConversationCount
}