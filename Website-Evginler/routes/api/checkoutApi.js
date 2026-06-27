const express = require('express');
const router = express.Router();
const checkoutApiController = require('../../controllers/api/checkoutApiController');
const { requireUser } = require('../../middleware/apiAuth');

router.use(requireUser);

router.get('/', checkoutApiController.getCheckout);
router.post('/process-payment', checkoutApiController.processPayment);

module.exports = router;
