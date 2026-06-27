const express = require('express');
const router = express.Router();
const catalogApiController = require('../../controllers/api/adminCatalogApiController');
const { requireAdmin } = require('../../middleware/apiAuth');

router.use(requireAdmin);

router.get('/', catalogApiController.getProducts);
router.post('/', catalogApiController.createProduct);
router.patch('/bulk-status', catalogApiController.updateProductsStatus);
router.get('/:productId', catalogApiController.getProduct);
router.put('/:productId', catalogApiController.updateProduct);
router.delete('/:productId', catalogApiController.deleteProduct);

module.exports = router;
