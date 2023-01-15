const express = require('express');

const {
    getMessages,
    sendMessage,
    getAllRooms
} = require('../controller/chatController'); 



const router = express.Router();

// "api/chat/"
// router.get('/', getRoomId);



// '/room/:id/messages/offset=0?size=50 ->>>> with req.query we can take offset and size value from URL
//http://localhost:5000/api/chat/room/1:2/messages?offset=0&size=50
router.get('/room/:id/messages', getMessages);
router.post('/sendMessage', sendMessage);

//probelm with req.sessions
// router.get('/rooms', getAllRooms);
router.get('/rooms/:username', getAllRooms);

module.exports = router;