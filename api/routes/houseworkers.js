const express = require('express');
const {isLogged, checkClient, checkHouseworker} = require('../middleware/checkLoggin');

const {
    getHouseworkerByUsername,
    getHouseworkers,
    deleteHouseworker,
    getRatings,
    getComments,
    getOurComments,
    getProfessions,
    getProfessionsByUsername,
    getAllProfessions,
    addProfession,
    deleteProfession,
    udpateHouseworker,
    updateProfessionWorkingHour,
    getHouseworkerWithFilters,
    getRatingUsername,
    getCities,
    getHouseworkerInfo,
    getHouseworkerCommentsCount,
    getHomeInfo,
    getHouseworkerProfessionsAndRating
} = require('../controller/houseworkerController');

const router = express.Router();

router.get('/', getHouseworkers); //client will see all houseworkers
router.put('/update', checkHouseworker, udpateHouseworker);
// //or One route for filter and in controller check for existing params end send it to backend
//http://localhost:5000/api/houseworker/filter?gender=male&city=Beograd  --- "?" between filter and params
router.get('/filter', getHouseworkerWithFilters);
router.get('/info', checkHouseworker, getHouseworkerInfo )


//IF IS THIS ROUTE (with :username - params) is ABOVE the /rating,comments,professions -get route 
//will make conflict, this MUST BE BELOWE ALL OF THESE
// router.get('/:username', checkHouseworker, getHouseworkerByUsername);
router.delete('/:username', checkHouseworker, deleteHouseworker);
router.get('/rating', checkHouseworker, getRatings);
router.get('/rating/:username', getRatingUsername);

// router.get('/comments/:username',  getComments);
router.get('/comments/:username/:pageNumber',  getComments);
router.get('/comments/count/:username', getHouseworkerCommentsCount)
// router.get('/ourcomments/', checkHouseworker, getOurComments)
router.get('/ourcomments/:pageNumber', checkHouseworker, getOurComments)

// router.get('/professions/:username', getProfessions);
router.get('/professions/', checkHouseworker, getProfessions)
router.get('/professions/all', getAllProfessions)
router.get('/professions/:username', getProfessionsByUsername)
router.delete('/professions/:profession', checkHouseworker, deleteProfession);
router.put('/professions/update', checkHouseworker, updateProfessionWorkingHour);
router.get('/cities',  getCities);
router.get('/:username', checkHouseworker, getHouseworkerByUsername);
router.post('/professions/add', checkHouseworker, addProfession);
router.get('/home/:username', isLogged, getHomeInfo);
router.get('/professionsandrating/:username', getHouseworkerProfessionsAndRating)

module.exports = router;