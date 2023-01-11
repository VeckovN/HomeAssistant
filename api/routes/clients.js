const express = require('express');
const {isLogged, checkClient, checkHouseworker} = require('../middleware/checkLoggin');

const {
    getClientByUsername,
    getClients,
    getComments,
    rateHouseworker,
    udpateClient,
    commentHouseworker
} = require('../controller/clientController');

const router = express.Router();

router.get('/', checkClient, getClients);
router.get('/:username',checkHouseworker, getClientByUsername);
router.get('/comments/:username',checkClient, getComments);
// router.post('/rate', checkClient, rateHouseworker);
router.post('/rate', checkClient, rateHouseworker);
// router.post('/comment', checkClient,commentHouseworker);
router.post('/comment', commentHouseworker);
router.put('/update', checkClient, udpateClient);

module.exports = router;