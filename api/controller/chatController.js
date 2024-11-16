const chatModel = require('../model/Chat')

//using req.query because url .../message?offset=0?size=50
//BECASE THIS IS GET METHOD, if we wanna post/put we could use req.body to take value from body of request
//http://localhost:5000/api/chat/room/1:2/messages?offset=0&size=50
const getMessages = async(req,res)=>{
    const roomID = req.params.id;
    const offset = req.query.offset;
    const size = req.query.size;
    try{
        const messages = await chatModel.getMessages(roomID, offset, size);
        res.status(200).json(messages);
    }
    catch(err){
        console.error(err);
        //err.message -> throwned error message from getMessage caller function
        res.status(500).json({error: err.message || "Message Errors"});
    }
}

const getMoreMessages = async(req,res) =>{
    const roomID = req.params.id;
    const pageNumber = req.params.pageNumber;
    try{
        const messages = await chatModel.getMoreMessages(roomID, pageNumber);
        res.status(200).json(messages);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Fetching Messages Error"});
    }
}

const postMessage = async(req,res) =>{
    const messageObj = req.body;
    try{
        const messageResult = await chatModel.sendMessage(messageObj);
        res.status(201).json(messageResult);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Message posting Error"});
    }
}   

const getAllRooms = async(req,res)=>{
    const username = req.params.username;
    try{
        const result = await chatModel.getAllRooms(username);
        res.status(200).json(result);
    }catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Error durring getting all rooms"});
    }
}

const deleteRoom = async(req, res)=>{
    const clientID = req.session.user.userID;
    const roomID = req.params.roomID;;
    try{
        const result = await chatModel.deleteRoomByRoomID(clientID, roomID);
        res.status(200).json(result);
    }
    catch(err){
        console.error(err);
        res.status(400).json({error: err.message || "Room can't be deleted"});
    }
}

const removeUserFromRoom = async(req,res)=>{
    const clientID = req.session.user.userID;
    const { roomID, username } = req.params;
    try{
        const result = await chatModel.removeUserFromRoomID(clientID, roomID, username);
        res.status(200).send(result);
    }
    catch(err){    
        console.error(err);
        res.status(400).json({error: err.message || "You can't add user to Room"});
    }
}

const addUserToRoom = async(req,res) =>{
    const clientID = req.session.user.userID;
    const roomID = req.body.roomID;
    const newUsername = req.body.newUsername;
    try{
        const result = await chatModel.addUserToRoom(clientID, newUsername, roomID);
        res.status(200).json(result);
    }
    catch(err){
        console.error(err);
        res.status(400).json({error: err.message || "You can't add user to Room"});
    }
}

const getConversationCount = async(req,res)=>{
    const userID = req.params.userID;
    try{
        const result = await chatModel.getRoomCount(userID);
        res.status(200).json(result);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Conversetion Count error"});
    }
}

const getOnlineUsers = async(req,res) =>{
    const userID = req.params.userID;
    try{
        const result = await chatModel.getOnlineUsersFromChat(userID);
        res.status(200).json(result);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Fetching online users error"});
    }
}

const getFirstRoomID = async(req,res) =>{
    const userID = req.params.userID;
    try{
        const result = await chatModel.getHouseworkerFirstRoomID(userID);
        res.status(200).json(result);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Fetching First room Error"});
    }
}

const getFriendsList = async(req,res) =>{
    const userID = req.params.userID;
    try{
        const result = await chatModel.getFriendsListByUserID(userID);
        res.status(200).json(result);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Friends list error"});
    }
}

const getAllUnreadMessages = async(req,res) =>{
    const username = req.params.username;
    try{
        const result = await chatModel.getUnreadMessages(username)
        res.status(200).json(result);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Fetching unread messages error"});
    }
}

const getUnreadMessagesTotalCount = async(req,res) =>{
    const userID = req.params.userID;
    try{
        const result = await chatModel.getUnreadMessagesTotalCount(userID)
        res.status(200).json(result);
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: err.message || "Message posting Error"});
    }
}

const removeUnreadMessagesFromRoom = async(req,res) =>{
    const {roomID, userID} = req.params;
    try{
        const result = await chatModel.resetUnreadMessagesCount(roomID, userID);
        res.status(200).json(result);
    }
    catch(err){
        console.error(err);
        res.status(400).json({error: err.message || "Remove unread messages Error"});
    }
}

const removeAllUnreadMessagesFromRoom = async(req,res) =>{
    const {roomID, clientID} = req.params;
    try{
        const result = await chatModel.resetAllUnreadMessagesCountFromRoom(roomID, clientID);
        res.status(200).json(result);
    }
    catch(err){
        console.error(err);
        res.status(400).json({error: err.message || "Remove unread messages Error"});
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
    removeAllUnreadMessagesFromRoom,
    getFirstRoomID
}