const express = require('express');
const routes = express.Router();
const locals = require('../middleware/locals');
const isAuthenticated = require('../middleware/authenticated');
const productController = require('../controllers/productsController');
const catalogApiController = require('../controllers/api/adminCatalogApiController');


//Products Routes
routes.get('/products',locals,isAuthenticated,productController.getProducts);
routes.patch('/products/bulk-status',isAuthenticated,catalogApiController.updateProductsStatus);
routes.get('/addProduct',locals,isAuthenticated,productController.getAddProduct);
routes.post('/addProduct',locals,isAuthenticated,productController.postAddProduct);
routes.get('/editProduct/:productid',locals,isAuthenticated,productController.getEditProduct);
routes.post('/editProduct',locals,isAuthenticated,productController.postEditProduct);
routes.post('/deleteProduct',locals,isAuthenticated,productController.postDeleteProduct);
routes.get('/productReturn',locals,isAuthenticated,productController.getProductReturn);

module.exports = routes;
