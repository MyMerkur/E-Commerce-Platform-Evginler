const express = require('express');
const routes = express.Router();
const rateLimit = require('express-rate-limit');
const superUserController = require('../controllers/superUserController');
const locals = require('../middleware/locals');
const isAuthenticated = require('../middleware/authenticated');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.'
});

routes.get('/register',locals,superUserController.getRegister);
routes.post('/register',locals,authLimiter,superUserController.postRegister);


routes.get('/',locals,superUserController.getLogin);
routes.post('/',locals,authLimiter,superUserController.postLogin);

routes.get('/logout',locals,superUserController.getLogout);

module.exports = routes;