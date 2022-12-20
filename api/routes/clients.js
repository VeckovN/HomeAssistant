const express = require('express');

const {
    getClientByUsername,
    getClients,
    getComments,
    rateHouseworker,
    udpateClient,
    commentHouseworker
} = require('../controller/clientController');

const router = express.Router();

router.get('/', getClients);
router.get('/:username', getClientByUsername);
router.get('/comments/:username', getComments);
router.post('/rate', rateHouseworker);
router.post('/comment', commentHouseworker);
router.put('/update',udpateClient);

module.exports = router;