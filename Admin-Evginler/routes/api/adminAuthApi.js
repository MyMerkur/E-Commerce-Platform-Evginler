const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const adminAuthApiController = require('../../controllers/api/adminAuthApiController');
const { requireAdmin } = require('../../middleware/apiAuth');

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

router.get('/me', adminAuthApiController.me);
// Yeni admin oluşturmak için zaten oturum açmış bir admin gerekir — açık kayıt yüzeyi bırakılmaz.
router.post('/register', authApiLimiter, requireAdmin, adminAuthApiController.register);
router.post('/login', authApiLimiter, adminAuthApiController.login);
router.post('/logout', adminAuthApiController.logout);

module.exports = router;
