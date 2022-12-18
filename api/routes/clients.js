const express = require('express');

const {getClientByUsername, getClients, getComments} = require('../controller/clientController');

const router = express.Router();

router.get('/', getClients);
router.get('/:username', getClientByUsername);
router.get('/comments/:username', getComments)


module.exports = router;