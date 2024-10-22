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

const getMoreMessages = async(req,res) =>{
    console.log("REQWWQ : " , req.params);
    const roomID = req.params.id;
    const pageNumber = req.params.pageNumber;

    console.log("getMOremessages: " + roomID, + "pn: " + pageNumber);
    //or
    //const roomID = req.query.offset;
    //const pageNUmber = req.query.offset;

    try{
        const messages = await chatModal.getMoreMessages(roomID, pageNumber);
        res.json(messages);
    }
    catch(err){
        console.log(err);
        res.status(400).json({error:"More Messages Fetching Error"});
    }
}

const postMessage = async(req,res) =>{
    try{
        const messageObj = req.body;
        const messageResult = await chatModal.sendMessage(messageObj);
        res.json(messageResult);
    }
    catch(err){
        console.error(err);
        res.status(400).json({error:"Message posting Error"});
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
    const clientID = req.session.user.userID;
    const roomID = req.params.roomID;;
    try{
        const result = await chatModal.deleteRoomByRoomID(clientID, roomID);
        res.status(200).json(result);
    }
    catch(err){
        console.log(err);
        res.status(400).json({error:"Room can't be deleted"});
    }
}

const removeUserFromRoom = async(req,res)=>{
    const clientID = req.session.user.userID;
    const { roomID, username } = req.params;
    try{
        const result = await chatModal.removeUserFromRoomID(clientID, roomID, username);
        res.status(200).send(result);
    }
    catch(err){
        console.log(err);
        res.status(400).json({error:"Room can't be deleted"});
    }
}

const addUserToRoom = async(req,res) =>{
    const clientID = req.session.user.userID;
    const roomID = req.body.roomID;
    const newUsername = req.body.newUsername;
    console.log("ROOMID: " + roomID + " newUsername " + newUsername);
    
    try{
        const result = await chatModal.addUserToRoom(clientID, newUsername, roomID);
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

const getOnlineUsers = async(req,res) =>{
    try{
        const userID = req.params.userID;
        const userID2 = req.session.user.userID;
        console.log("REQ SESSION USER: ", req.session.user);
        console.log("UserID2: " , userID2);

        const result = await chatModal.getOnlineUsersFromChat(userID);
        res.status(200).json(result);
    }
    catch(err){
        res.status(400).json({error: 'Conversetion Count error'})
    }
}

const getFriendsList = async(req,res) =>{
    try{
        const userID = req.params.userID;
        const result = await chatModal.getFriendsListByUserID(userID);
        res.status(200).json(result);
    }
    catch(err){
        res.status(400).json({error: 'Friends list error'})
    }
}


const getAllUnreadMessages = async(req,res) =>{
    try{
        const username = req.params.username;
        const result = await chatModal.getUnreadMessages(username)
        res.status(200).json(result);
    }
    catch(err){
        res.status(400).json({error: 'UnreadMessage TotalCount error'})
    }
}

const getUnreadMessagesTotalCount = async(req,res) =>{
    try{
        const userID = req.params.userID;
        const result = await chatModal.getUnreadMessagesTotalCount(userID)
        res.status(200).json(result);
    }
    catch(err){
        res.status(400).json({error: 'UnreadMessage TotalCount error'})
    }
}

const removeUnreadMessagesFromRoom = async(req,res) =>{
    try{
        const {roomID, userID} = req.params;
        const result = await chatModal.resetUnreadMessagesCount(roomID, userID);
        res.status(200).json(result);

    }
    catch(err){
        res.status(400).json({error: 'UnreadMessage TotalCount error'})
    }
}

module.exports ={
    getMessages,
    getMoreMessages,
    postMessage,
    getAllRooms,
    deleteRoom,
    removeUserFromRoom,
    addUserToRoom,
    getConversationCount,
    getOnlineUsers,
    getFriendsList,
    getAllUnreadMessages,
    getUnreadMessagesTotalCount,
    removeUnreadMessagesFromRoom,
}