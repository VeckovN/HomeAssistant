const express = require('express');
const {isLogged, checkClient, checkHouseworker} = require('../middleware/checkLoggin');
const { apiReadLimiter, apiWriteLimiter } = require('../middleware/rateLimiter.js');
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

router.get('/', apiReadLimiter, getHouseworkers); 
router.get('/filter', apiReadLimiter, getHouseworkerWithFilters);

router.get('/stats/count', apiReadLimiter, getHouseworkerUsersCount)
router.get('/cities', apiReadLimiter, getCities);

router.put('/profile', checkHouseworker, apiWriteLimiter, udpateHouseworker);
router.get('/profile', checkHouseworker, apiReadLimiter, getHouseworkerInfo )

router.get('/rating', checkHouseworker, apiReadLimiter, getRatings);
router.get('/:username/rating', apiReadLimiter, getRatingUsername);

router.get('/professions', checkHouseworker, apiReadLimiter, getProfessions)
router.put('/professions', checkHouseworker, updateProfessionWorkingHour);
router.post('/professions', checkHouseworker, apiWriteLimiter, addProfession);
router.get('/professions/all', apiReadLimiter, getAllProfessions)
router.delete('/professions/:profession', checkHouseworker, apiWriteLimiter, deleteProfession);

router.get('/comments/my/:pageNumber', checkHouseworker, apiReadLimiter, getOurComments)
router.get('/:username/comments/unread', checkHouseworker, apiReadLimiter, getHouseworkerUnreadComments);
router.put('/:username/comments/unread/mark', checkHouseworker, apiWriteLimiter, markHouseworkerUnreadComments);
router.get('/:username/comments/count', apiReadLimiter, getHouseworkerCommentsCount)
//this dynamic '/comments/:pageNumber' below other specific
router.get('/:username/comments/:pageNumber', checkClient, apiReadLimiter, getComments); 

router.get('/:username/notifications', checkHouseworker, apiReadLimiter, getNotifications);
router.get('/:username/notifications/:batchNumber', checkHouseworker, apiReadLimiter, getMoreNotifications);
router.put('/notifications/mark', checkHouseworker, apiWriteLimiter, markUnreadNotification);
//must be below /notifications/mark => due to this :notificationID that comes after it
// router.put('/notifications/mark/:notificationID', checkHouseworker, markUnreadNotification);
router.get('/:username/professions', apiReadLimiter, getProfessionsByUsername)
router.get('/:username/professions/summary', apiReadLimiter, getHouseworkerProfessionsAndRating)

router.get('/home/:username', isLogged, apiReadLimiter, getHomeInfo);
router.get('/:username', checkHouseworker, apiReadLimiter, getHouseworkerByUsername);
router.delete('/:username', checkHouseworker, apiWriteLimiter, deleteHouseworker);

module.exports = router;