const express = require('express');
const router = express.Router();
const catalogApiController = require('../../controllers/api/adminCatalogApiController');
const { requireAdmin } = require('../../middleware/apiAuth');

router.use(requireAdmin);

router.get('/', catalogApiController.getCategories);
router.post('/', catalogApiController.createCategory);
router.get('/:categoryId', catalogApiController.getCategory);
router.put('/:categoryId', catalogApiController.updateCategory);
router.delete('/:categoryId', catalogApiController.deleteCategory);

module.exports = router;
