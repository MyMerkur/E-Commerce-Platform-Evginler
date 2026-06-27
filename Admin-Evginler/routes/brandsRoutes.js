const express = require('express');
const routes = express.Router();
const locals = require('../middleware/locals');
const isAuthenticated = require('../middleware/authenticated');
const adminSiteController = require('../controllers/adminSiteController');
const brandsController = require('../controllers/brandsController');




//Brands Routes
routes.get('/brands',locals,isAuthenticated,brandsController.getBrands);
routes.get('/addBrand',locals,isAuthenticated,brandsController.getAddBrand);
routes.post('/addBrand',locals,isAuthenticated,brandsController.postAddBrand);
routes.get('/editBrand/:brandid',locals,isAuthenticated,brandsController.getEditBrand);
routes.post('/editBrand',locals,isAuthenticated,brandsController.postEditBrand);
routes.post('/deleteBrand',locals,isAuthenticated,brandsController.postDeleteBrand);

module.exports = routes;