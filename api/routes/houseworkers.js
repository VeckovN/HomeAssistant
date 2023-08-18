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
    addProfession,
    udpateHouseworker,
    getHouseworkerWithFilters,
    getRatingUsername,
    getCities,
    updatePassword,
    getHouseworkerInfo,
    getHouseworkerCommentsCount,
} = require('../controller/houseworkerController');


const router = express.Router();

// router.get('/', checkClient, getHouseworkers); //client will see all houseworkers
router.get('/',  getHouseworkers); //client will see all houseworkers
//with filterData and Search
// router.get('/:filter/:search', getHouseworkerFilterAndSearch);

router.put('/update', checkHouseworker, udpateHouseworker);


// router.get('/filterSearch', getHouseworkerFilterAndSearch);
// //with filterData only (with req.query.param)
// router.get('/filter/', getHouseworkerFilterAndSearch);
// // router.get('/filter/:filterObj/', getHouseworkerFilterAndSearch);

// //or One route for filter and in controller check for existing params end send it to backend
//http://localhost:5000/api/houseworker/filter?gender=male&city=Beograd  --- "?" between filter and params
router.get('/filter', getHouseworkerWithFilters);
router.get('/info', checkHouseworker, getHouseworkerInfo )

//IF IS THIS ROUTE (with :username - params) is ABOVE the /rating,comments,professions -get route with 
//will make conflict, this MUST BE BELOVE ALL OF THESE
// router.get('/:username', checkHouseworker, getHouseworkerByUsername);
router.delete('/:username', checkHouseworker, deleteHouseworker);
router.get('/rating', checkHouseworker, getRatings);
router.get('/rating/:username', getRatingUsername);


// router.get('/comments', checkHouseworker, getComments);

// router.get('/comments', checkHouseworker, getComments);
//Client click on comment button
router.get('/comments/:username',  getComments);
router.get('/comments/count/:username', getHouseworkerCommentsCount)
router.get('/ourcomments/', getOurComments)
// router.get('/professions', checkHouseworker, getProfessions);
router.get('/professions/:username', getProfessions);
router.get('/cities',  getCities);
//Here without conflict
router.get('/:username', checkHouseworker, getHouseworkerByUsername);
router.post('/professions/add', checkHouseworker, addProfession);
router.post('/update/password', checkHouseworker, updatePassword)



module.exports = router;