const express = require('express');
const routes = express.Router();
const rateLimit = require('express-rate-limit');
const userController = require('../controllers/userControllers');
const locals = require('../middleware/locals');
const isAuthenticated = require('../middleware/authenticated');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.'
});

//Login
routes.get('/login',locals,userController.getLogin);
routes.post('/login',locals,authLimiter,userController.postLogin);
//Register
routes.post('/register',locals,authLimiter,userController.postRegister);
routes.get('/register',locals,userController.getRegister);

//Profile
routes.get('/user',locals,isAuthenticated,userController.getUser);

routes.get('/userInformation',locals,isAuthenticated,userController.getUserInformation);
routes.post('/userUpdateInfo',locals,isAuthenticated,userController.postUserInformation);
//Tüm Siparişler
routes.get('/userAllOrders',locals,isAuthenticated,userController.userAllOrders);
//Teslim Edilen Siparişler
routes.get('/userDeliveredOrders',locals,isAuthenticated,userController.userDeliveredOrders);


routes.get('/userAdressInfo',locals,isAuthenticated,userController.getUserAdressInfo);
//Adres Ekle
routes.post('/addAdress',locals,isAuthenticated,userController.postUserAdress);
//Adres Düzenle
routes.post('/userUpdateAddress/:address_id',locals,isAuthenticated,userController.postUserAddressUpdate);
//Adres Seçme
routes.get('/selectAddress',locals,isAuthenticated, userController.getSelectAddressForOrder);
routes.post('/selectAddressForOrder',locals,isAuthenticated, userController.postSelectAddressForOrder);

//Shopping Card
routes.get('/shoppingCard',locals,isAuthenticated,userController.getShoppingCard);

//Logout
routes.get('/logout',locals,userController.getLogout);

//Ürünü İade Et
routes.get('/returnedOrders',locals,isAuthenticated,userController.getReturnedOrders);
routes.post('/returnedOrders/:orderId',locals,isAuthenticated, userController.postReturnedOrders);

//Favori Ürünler
routes.get('/favoriteProducts',locals,isAuthenticated,userController.getFavoriteProducts);
routes.post('/favoriteProducts',locals,isAuthenticated,userController.postFavoriteProducts);



module.exports = routes;
