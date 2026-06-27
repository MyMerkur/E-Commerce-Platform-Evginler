const express = require('express');
const routes = express.Router();
const locals = require('../middleware/locals');
const isAuthenticated = require('../middleware/authenticated');
const adminSiteController = require('../controllers/adminSiteController');

routes.get('/index',locals,isAuthenticated,adminSiteController.getIndex);







module.exports = routes;