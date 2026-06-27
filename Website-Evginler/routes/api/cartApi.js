const express = require('express');
const router = express.Router();
const cartApiController = require('../../controllers/api/cartApiController');
const { requireUser } = require('../../middleware/apiAuth');

router.use(requireUser);

router.get('/', cartApiController.getCart);
router.post('/items', cartApiController.addItem);
router.patch('/items/:productId', cartApiController.updateItem);
router.delete('/items/:productId', cartApiController.removeItem);

module.exports = router;
