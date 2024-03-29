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
router.put('/update', checkClient, udpateClient);
router.get('/info', checkClient, getClientInfo)

router.get('/:username',checkHouseworker, getClientByUsername);
router.delete('/comment', checkClient, deleteComment);
router.get('/comments/:username',checkClient, getComments);
router.get('/recommended/:username' , isLogged, getRecommendedHouseworkers);
//HERE WONT WORK, because exists get route with one '/string' above 
//just put it before router.get('/:username',
router.post('/rate', checkClient, rateHouseworker);
router.post('/comment', isLogged, commentHouseworker);

module.exports = router;