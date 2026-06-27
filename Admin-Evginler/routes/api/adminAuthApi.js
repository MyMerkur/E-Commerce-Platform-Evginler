const express = require('express');
const router = express.Router();
const adminAuthApiController = require('../../controllers/api/adminAuthApiController');

router.get('/me', adminAuthApiController.me);
router.post('/register', adminAuthApiController.register);
router.post('/login', adminAuthApiController.login);
router.post('/logout', adminAuthApiController.logout);

module.exports = router;
