const express = require('express');
const router = express.Router();
const catalogApiController = require('../../controllers/api/adminCatalogApiController');
const { requireAdmin } = require('../../middleware/apiAuth');

router.use(requireAdmin);

router.get('/', catalogApiController.getBrands);
router.post('/', catalogApiController.createBrand);
router.get('/:brandId', catalogApiController.getBrand);
router.put('/:brandId', catalogApiController.updateBrand);
router.delete('/:brandId', catalogApiController.deleteBrand);

module.exports = router;
