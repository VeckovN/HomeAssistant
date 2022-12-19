const express = require('express');

const {getClientByUsername, getClients, getComments, rateHouseworker} = require('../controller/clientController');

const router = express.Router();

router.get('/', getClients);
router.get('/:username', getClientByUsername);
router.get('/comments/:username', getComments)
router.post('/rate', rateHouseworker);
// router.post('/update', updateClient);

module.exports = router;