const express = require('express');
const {isLogged, checkClient, checkHouseworker} = require('../middleware/checkLoggin');

const {
    getClientByUsername,
    getClients,
    getComments,
    rateHouseworker,
    udpateClient,
    deleteComment,
    commentHouseworker,
    getClientInfo,
    getRecommendedHouseworkers
} = require('../controller/clientController');

const router = express.Router();

router.get('/', checkClient, getClients);

router.put('/profile', checkClient, udpateClient);
router.get('/profile', checkClient, getClientInfo)

router.get('/recommendations/:username' , isLogged, getRecommendedHouseworkers);

router.post('/rating', checkClient, rateHouseworker);

router.post('/comments', isLogged, commentHouseworker);
router.get('/comments/:username',checkClient, getComments);
router.delete('/comments', checkClient, deleteComment);

router.get('/:username',checkHouseworker, getClientByUsername);

module.exports = router;