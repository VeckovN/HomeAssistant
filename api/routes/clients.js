const express = require('express');
const {isLogged, checkClient, checkHouseworker} = require('../middleware/checkLoggin');

const {
    getClientByUsername,
    getClients,
    getComments,
    rateHouseworker,
    udpateClient,
    commentHouseworker,
    getClientInfo
} = require('../controller/clientController');

const router = express.Router();

router.get('/', checkClient, getClients);
router.put('/update', checkClient, udpateClient);
router.get('/info', checkClient, getClientInfo)

router.get('/:username',checkHouseworker, getClientByUsername);
router.get('/comments/:username',checkClient, getComments);
//HERE WONT WORK, because exists get route with one '/string' above 
//just put it before router.get('/:username',
// router.get('/info', checkClient, getClientInfo)

// router.post('/rate', checkClient, rateHouseworker);
router.post('/rate', checkClient, rateHouseworker);
// router.post('/comment', checkClient,commentHouseworker);
router.post('/comment', commentHouseworker);
// router.put('/update', checkClient, udpateClient);

module.exports = router;