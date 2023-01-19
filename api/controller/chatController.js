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
    // console.log("SESSIO CHAT : " + JSON.stringify(req.session ));
    // const username = req.session.user.username;
    const username = req.params.username;
    
    // const username = "Novak"
    console.log("ROOM USERNAME: " + username);
    try{
        const result = await chatModal.getAllRooms(username);
        console.log("LENGTH: " + JSON.stringify(result))
        res.json(result);
    }catch(err){
        console.log(err);
        res.status(400).send("error getAllRooms");
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
        res.status(400).send("You can't delete Room");
    }
}

const addUserToRoom = async(req,res) =>{

    const roomID = req.body.roomID;
    const newUsername = req.body.newUsername;
    // const user = req.body;
    console.log("ROOMID: " + roomID + " newUsername " + newUsername);
    
    try{
        const result = await chatModal.addUserToRoom(newUsername, roomID);
        res.status(200).json(result);
    }
    catch(err){
        res.status(400).send('You cant add user to ROom')
    }
        
}

module.exports ={
    getRoomId,
    getUserIdByUsername,
    getMessages,
    sendMessage,
    getAllRooms,
    deleteRoom,
    addUserToRoom


}