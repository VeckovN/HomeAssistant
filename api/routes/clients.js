const express = require('express');
const {isLogged, checkClient, checkHouseworker} = require('../middleware/checkLoggin');
const {apiReadLimiter, apiWriteLimiter} = require('../middleware/rateLimiter.js');
const {
    getClientByUsername,
    getClients,
    getComments,
    rateHouseworker,
    udpateClient,
    deleteComment,
    commentHouseworker,
    getClientInfo,
    getRecommendedHouseworkers
} = require('../controller/clientController');

const router = express.Router();

router.get('/', checkClient, apiReadLimiter, getClients);

router.put('/profile', checkClient, apiWriteLimiter, udpateClient);
router.get('/profile', checkClient, apiReadLimiter, getClientInfo)

router.get('/recommendations/:username', isLogged, apiReadLimiter, getRecommendedHouseworkers);

router.post('/rating', checkClient, apiWriteLimiter, rateHouseworker);

router.post('/comments', isLogged, apiWriteLimiter, commentHouseworker);
router.get('/comments/:username', checkClient, apiReadLimiter, getComments);
router.delete('/comments', checkClient, apiWriteLimiter, deleteComment);

router.get('/:username',checkHouseworker, apiReadLimiter, getClientByUsername);

module.exports = router;