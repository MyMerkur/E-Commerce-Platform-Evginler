const express = require('express');
const router = express.Router();
const adminOrdersApiController = require('../../controllers/api/adminOrdersApiController');
const { requireAdmin } = require('../../middleware/apiAuth');

router.use(requireAdmin);

router.get('/', adminOrdersApiController.getOrders);
router.patch('/:orderId/confirm', adminOrdersApiController.confirmOrder);
router.patch('/:orderId/deliver', adminOrdersApiController.deliverOrder);

module.exports = router;
