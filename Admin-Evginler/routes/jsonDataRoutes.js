const express = require('express');
const routes = express.Router();
const locals = require('../middleware/locals');
const isAuthenticated = require('../middleware/authenticated');
const productController = require('../controllers/productsController');
const categoryController = require('../controllers/categoryController');
const brandsController = require('../controllers/brandsController');


//JSON DATA
routes.get('/products/json', productController.getProductsJSON);
routes.get('/products/:productId/json', productController.getProductDetailsJSON);
routes.get('/categories/json',categoryController.getCategoriesJSON);
routes.get('/brands/json',brandsController.getBrandsJSON);

module.exports = routes;