const express = require('express');
const {isLogged ,checkClient, checkHouseworker} = require('../middleware/checkLoggin.js')

const {
    getMessages,
    sendMessage,
    getAllRooms,
    deleteRoom,
    addUserToRoom,
    getConversationCount
} = require('../controller/chatController'); 

const router = express.Router();

// "api/chat/"
// router.get('/', getRoomId);


// '/room/:id/messages/offset=0?size=50 ->>>> with req.query we can take offset and size value from URL
//http://localhost:5000/api/chat/room/1:2/messages?offset=0&size=50

router.get('/room/:id/messages', isLogged, getMessages);
router.post('/room/delete', checkClient, deleteRoom);
router.post('/sendMessage', isLogged, sendMessage);
router.post('/room/addUser', checkClient, addUserToRoom);

router.get('/conversationCount/:userID', getConversationCount);

//probelm with req.sessions
// router.get('/rooms', getAllRooms);
router.get('/rooms/:username', isLogged, getAllRooms);
// router.delete('room/:roomID', deleteRoom);

module.exports = router;