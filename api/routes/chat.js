const express = require('express');

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

router.get('/room/:id/messages', getMessages);
router.post('/room/delete', deleteRoom);
router.post('/sendMessage', sendMessage);
router.post('/room/addUser', addUserToRoom);


router.get('/conversationCount/:userID', getConversationCount);



//probelm with req.sessions
// router.get('/rooms', getAllRooms);
router.get('/rooms/:username', getAllRooms);
// router.delete('room/:roomID', deleteRoom);

module.exports = router;