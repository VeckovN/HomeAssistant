const express = require('express');
const {isLogged ,checkClient, checkHouseworker} = require('../middleware/checkLoggin.js')
const {
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
    removeUnreadMessagesFromRoom
} = require('../controller/chatController'); 
const router = express.Router();

// "api/chat/"
// '/room/:id/messages/offset=0?size=50 ->>>> with req.query we can take offset and size value from URL
//http://localhost:5000/api/chat/room/1:2/messages?offset=0&size=50

router.get('/room/:id/messages', isLogged, getMessages);
router.get('/room/message/:id/:pageNumber', isLogged, getMoreMessages);
//with query.params as /messages?roomID=0&pageNumber=10 // but not too smart to show roomID in urls
// router.get('/room/messages/', isLogged, getMoreMessages); 
router.post('/room/message', isLogged, postMessage);
router.delete('/room/delete/:roomID', checkClient, deleteRoom);
router.delete('/room/removeUser/:roomID/:username', checkClient, removeUserFromRoom);
router.post('/room/addUser', checkClient, addUserToRoom);
router.get('/room/onlineUsers/:userID', isLogged, getOnlineUsers)
router.get('/room/friends/:userID', isLogged, getFriendsList);
router.get('/room/unread/:username', isLogged, getAllUnreadMessages);
router.get('/room/unread/count/:userID', isLogged, getUnreadMessagesTotalCount);
router.delete('/room/unread/delete/:roomID/:userID', isLogged, removeUnreadMessagesFromRoom);
router.get('/conversationCount/:userID', checkHouseworker, getConversationCount);
router.get('/rooms/:username', isLogged, getAllRooms);


module.exports = router;