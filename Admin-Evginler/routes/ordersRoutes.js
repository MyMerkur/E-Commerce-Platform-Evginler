const express = require('express');
const routes = express.Router();
const locals = require('../middleware/locals');
const isAuthenticated = require('../middleware/authenticated');
const adminSiteController = require('../controllers/adminSiteController');
const ordersControllers = require('../controllers/ordersController');


//Orders Routes
routes.get('/orders',locals,isAuthenticated,ordersControllers.getOrders);
//Incoming Orders
routes.get('/incomingOrders',locals,isAuthenticated,ordersControllers.getIncomingOrders);
routes.post('/incomingOrders/:orderId', locals, isAuthenticated, ordersControllers.postIncomingOrders);
//Confirmed Orders
routes.get('/confirmedOrders',locals,isAuthenticated,ordersControllers.getConfirmedOrders);
//Cancelled Orders
routes.get('/canceledOrders/',locals,isAuthenticated,ordersControllers.getCanceledOrders);
routes.post('/canceledOrders/:orderId', locals, isAuthenticated, ordersControllers.getDeliveredOrders);
//Delivered Orders
routes.get('/deliveredOrders/',locals,isAuthenticated,ordersControllers.getDeliveredOrders);
routes.post('/deliveredOrders/:orderId', locals, isAuthenticated, ordersControllers.postDeliveredOrder);
//Returned Orders
routes.get('/returnedOrders',locals,isAuthenticated,ordersControllers.getReturnedOrders);
//Search
routes.get('/searchIncomingOrders',locals,isAuthenticated,ordersControllers.getSearchIncomingOrders);
routes.get('/searchConfirmedOrders',locals,isAuthenticated,ordersControllers.getSearchConfirmedOrders);
routes.get('/searchDeliveredOrders',locals,isAuthenticated,ordersControllers.getSearchDeliveredOrders);
routes.get('/searchReturnedOrders',locals,isAuthenticated,ordersControllers.getSearchReturnedOrders);







module.exports = routes;
