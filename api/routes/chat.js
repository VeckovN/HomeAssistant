const express = require('express');
const {isLogged ,checkClient, checkHouseworker} = require('../middleware/checkLoggin.js')
const {apiReadLimiter, chatLimiter} = require('../middleware/rateLimiter.js');
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

router.get('/rooms/:username', isLogged, apiReadLimiter, getAllRooms);
router.delete('/rooms/:roomID', chatLimiter, checkClient, deleteRoom);

router.get('/rooms/:roomID/messages', isLogged, apiReadLimiter, getMessages);
router.get('/rooms/:roomID/messages/:pageNumber', isLogged, apiReadLimiter, getMoreMessages);
router.post('/rooms/messages', isLogged, chatLimiter, postMessage);

router.post('/rooms/users', checkClient, chatLimiter, addUserToRoom);
router.delete('/rooms/:roomID/users/:username', checkClient, chatLimiter, removeUserFromRoom);

router.delete('/rooms/:roomID/unread/all/:clientID', isLogged, removeAllUnreadMessagesFromRoom);
router.delete('/rooms/:roomID/unread/:userID', isLogged, removeUnreadMessagesFromRoom);

router.get('/unread/:username', isLogged, apiReadLimiter, getAllUnreadMessages);
router.put('/unread/forward', isLogged, forwardUnreadMessages);
router.get('/unread/count/:userID', isLogged, apiReadLimiter, getUnreadMessagesTotalCount);

router.get('/online-users/:userID', isLogged, apiReadLimiter, getOnlineUsers)
router.get('/friends/:userID', isLogged, apiReadLimiter, getFriendsList);

router.get('/users/:userID/firstRoom', isLogged, apiReadLimiter, getFirstRoomID)

router.get('/stats/conversation-count/:userID', checkHouseworker, apiReadLimiter, getConversationCount);

module.exports = router;