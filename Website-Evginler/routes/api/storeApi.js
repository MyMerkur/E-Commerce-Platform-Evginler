const express = require('express');
const router = express.Router();
const storeApiController = require('../../controllers/api/storeApiController');

router.get('/home', storeApiController.getHome);
router.get('/products', storeApiController.getProducts);
router.get('/products/:productId', storeApiController.getProduct);
router.get('/categories', storeApiController.getCategories);
router.get('/brands', storeApiController.getBrands);

module.exports = router;
