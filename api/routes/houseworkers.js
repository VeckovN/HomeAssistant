const { application } = require('express');
const express = require('express');

const {
    getHouseworkerByUsername,
    getHouseworkers,
    deleteHouseworker,
    getRatings,
    getComments,
    getProfessions,
    addProfession,
    udpateHouseworker
} = require('../controller/houseworkerController');

const router = express.Router();


router.get('/', getHouseworkers);
router.get('/:username', getHouseworkerByUsername);
router.delete('/:username', deleteHouseworker);
router.get('/rating', getRatings);
router.get('/comments', getComments);
router.get('/professions', getProfessions);
router.post('/professions/add', addProfession);
router.put('/update', udpateHouseworker);