const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authApiController = require('../../controllers/api/authApiController');

const authApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        data: null,
        message: 'Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.',
        errors: null
    }
});

router.get('/me', authApiController.me);
router.post('/register', authApiLimiter, authApiController.register);
router.post('/login', authApiLimiter, authApiController.login);
router.post('/logout', authApiController.logout);

module.exports = router;
