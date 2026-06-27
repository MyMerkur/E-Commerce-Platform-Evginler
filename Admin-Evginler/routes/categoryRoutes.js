const express = require('express');
const routes = express.Router();
const locals = require('../middleware/locals');
const isAuthenticated = require('../middleware/authenticated');
const categoryControllers = require('../controllers/categoryController');


//Category Routes
routes.get('/categories',locals,isAuthenticated,categoryControllers.getCategories);
routes.get('/addCategory',locals,isAuthenticated,categoryControllers.getAddCategory);
routes.post('/addCategory',locals,isAuthenticated,categoryControllers.postAddCategory);
routes.get('/editCategory/:categoryid',locals,isAuthenticated,categoryControllers.getEditCategory);
routes.post('/editCategory/:categoryid',locals,isAuthenticated,categoryControllers.postEditCategory);
routes.post('/deleteCategory',locals,isAuthenticated,categoryControllers.postDeleteCategory);

module.exports = routes;