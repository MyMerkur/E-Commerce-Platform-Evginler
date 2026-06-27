const express = require('express');
const router = express.Router();
const authApiController = require('../../controllers/api/authApiController');

router.get('/me', authApiController.me);
router.post('/register', authApiController.register);
router.post('/login', authApiController.login);
router.post('/logout', authApiController.logout);

module.exports = router;
