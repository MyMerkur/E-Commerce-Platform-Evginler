const express = require('express');
const routes = express.Router();
const superUserController = require('../controllers/superUserController');
const locals = require('../middleware/locals');
const isAuthenticated = require('../middleware/authenticated');

routes.get('/register',locals,superUserController.getRegister);
routes.post('/register',locals,superUserController.postRegister);


routes.get('/',locals,superUserController.getLogin);
routes.post('/',locals,superUserController.postLogin);

routes.get('/logout',locals,superUserController.getLogout);

module.exports = routes;