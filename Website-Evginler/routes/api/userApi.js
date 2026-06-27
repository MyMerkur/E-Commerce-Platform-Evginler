const express = require('express');
const router = express.Router();
const userApiController = require('../../controllers/api/userApiController');
const { requireUser } = require('../../middleware/apiAuth');

router.use(requireUser);

router.get('/profile', userApiController.getProfile);
router.put('/profile', userApiController.updateProfile);
router.get('/addresses', userApiController.getAddresses);
router.post('/addresses', userApiController.createAddress);
router.put('/addresses/:addressId', userApiController.updateAddress);
router.post('/selected-address', userApiController.selectAddress);
router.get('/orders', userApiController.getOrders);
router.get('/returns', (req, res, next) => {
    req.query.status = 'returned';
    next();
}, userApiController.getOrders);
router.post('/orders/:orderId/return', userApiController.returnProduct);
router.get('/favorites', userApiController.getFavorites);
router.post('/favorites/:productId', userApiController.addFavorite);
router.delete('/favorites/:productId', userApiController.removeFavorite);

module.exports = router;
