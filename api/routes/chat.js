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
    getFirstRoomID,
    getUnreadMessagesTotalCount,
    removeUnreadMessagesFromRoom,
    removeAllUnreadMessagesFromRoom,
    forwardUnreadMessages
} = require('../controller/chatController'); 
const router = express.Router();

router.get('/rooms/:username', isLogged, getAllRooms);
router.delete('/rooms/:roomID', checkClient, deleteRoom);

router.get('/rooms/:roomID/messages', isLogged, getMessages);
router.get('/rooms/:roomID/messages/:pageNumber', isLogged, getMoreMessages);
router.post('/rooms/messages', isLogged, postMessage);

router.post('/rooms/users', checkClient, addUserToRoom);
router.delete('/rooms/:roomID/users/:username', checkClient, removeUserFromRoom);

router.delete('/rooms/:roomID/unread/all/:clientID', isLogged, removeAllUnreadMessagesFromRoom);
router.delete('/rooms/:roomID/unread/:userID', isLogged, removeUnreadMessagesFromRoom);

router.get('/unread/:username', isLogged, getAllUnreadMessages);
router.put('/unread/forward', isLogged, forwardUnreadMessages);
router.get('/unread/count/:userID', isLogged, getUnreadMessagesTotalCount);

router.get('/online-users/:userID', isLogged, getOnlineUsers)
router.get('/friends/:userID', isLogged, getFriendsList);

router.get('/users/:userID/firstRoom', isLogged, getFirstRoomID)

router.get('/stats/conversation-count/:userID', checkHouseworker, getConversationCount);

module.exports = router;