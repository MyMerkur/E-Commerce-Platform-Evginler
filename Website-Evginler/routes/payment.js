const express = require('express');
const router = express.Router();
const iyzicoContorller  =require('../controllers/iyzicoController');
const locals = require('../middleware/locals');
const isAuthenticated = require('../middleware/authenticated');

router.post('/callback',iyzicoContorller.postCallback);





module.exports = router;