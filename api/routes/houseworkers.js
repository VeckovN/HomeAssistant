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
    getHouseworkerProfessionsAndRating,
    getHouseworkerUsersCount,
    getHouseworkerUnreadComments,
    markHouseworkerUnreadComments,
    getNotifications,
    getMoreNotifications,
    markUnreadNotification
} = require('../controller/houseworkerController');

const router = express.Router();

router.get('/', getHouseworkers); 
router.get('/filter', getHouseworkerWithFilters);

router.get('/stats/count', getHouseworkerUsersCount)
router.get('/cities',  getCities);

router.put('/profile', checkHouseworker, udpateHouseworker);
router.get('/profile', checkHouseworker, getHouseworkerInfo )

router.get('/rating', checkHouseworker, getRatings);
router.get('/:username/rating', getRatingUsername);

router.get('/professions', checkHouseworker, getProfessions)
router.put('/professions', checkHouseworker, updateProfessionWorkingHour);
router.post('/professions', checkHouseworker, addProfession);
router.get('/professions/all', getAllProfessions)
router.delete('/professions/:profession', checkHouseworker, deleteProfession);

router.get('/comments/my/:pageNumber', checkHouseworker, getOurComments)
router.get('/:username/comments/unread', checkHouseworker, getHouseworkerUnreadComments);
router.put('/:username/comments/unread/mark', checkHouseworker, markHouseworkerUnreadComments);
router.get('/:username/comments/count', getHouseworkerCommentsCount)
//this dynamic '/comments/:pageNumber' below other specific
router.get('/:username/comments/:pageNumber', checkClient, getComments); 

router.get('/:username/notifications', checkHouseworker, getNotifications);
router.get('/:username/notifications/:batchNumber', checkHouseworker, getMoreNotifications);
router.put('/notifications/mark', checkHouseworker, markUnreadNotification);
//must be below /notifications/mark => due to this :notificationID that comes after it
// router.put('/notifications/mark/:notificationID', checkHouseworker, markUnreadNotification);
router.get('/:username/professions', getProfessionsByUsername)
router.get('/:username/professions/summary', getHouseworkerProfessionsAndRating)

router.get('/home/:username', isLogged, getHomeInfo);
router.get('/:username', checkHouseworker, getHouseworkerByUsername);
router.delete('/:username', checkHouseworker, deleteHouseworker);

module.exports = router;