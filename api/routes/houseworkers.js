const express = require('express');
const {isLogged, checkClient, checkHouseworker} = require('../middleware/checkLoggin');

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

router.get('/', checkClient,getHouseworkers); //client will see all houseworkers
router.get('/:username', checkHouseworker, getHouseworkerByUsername);
router.delete('/:username', checkHouseworker, deleteHouseworker);
router.get('/rating', checkHouseworker, getRatings);
router.get('/comments', checkHouseworker, getComments);
router.get('/professions', checkHouseworker, getProfessions);
router.post('/professions/add', checkHouseworker, addProfession);
router.put('/update', checkHouseworker, udpateHouseworker);


module.exports = router;