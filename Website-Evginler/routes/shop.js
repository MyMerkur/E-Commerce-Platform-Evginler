const express = require('express');
const router = express.Router();
const shopController  =require('../controllers/shopControllers');
const locals = require('../middleware/locals');
const isAuthenticated = require('../middleware/authenticated');
const categoriesMiddleware = require('../middleware/categories');

router.get('/',locals,categoriesMiddleware,shopController.getIndex);
router.get('/about',locals,categoriesMiddleware,shopController.getAbout);
router.get('/productDetail/:productId', locals,categoriesMiddleware,shopController.getProductDetails);
router.post('/add-to-card',locals,isAuthenticated,categoriesMiddleware,shopController.addToCard);
router.post('/deleteProduct',locals,isAuthenticated,categoriesMiddleware,shopController.postDeleteProduct);
router.get('/search',locals,categoriesMiddleware,shopController.getSearch);
router.get('/payment',locals,isAuthenticated,categoriesMiddleware,shopController.getPayment);
router.post('/processPayment',locals,isAuthenticated,categoriesMiddleware,shopController.postProcessPayment);

router.get('/ordersJSON',shopController.getOrdersJSON);
router.get('/paymentSuccess',locals,categoriesMiddleware,shopController.getPaymentSuccess);
router.get('/paymentFailed',locals,categoriesMiddleware,shopController.getPaymentFailed);

router.post('/updateQuantity',isAuthenticated,shopController.updateQuantity);
router.get('/products/:brandId', shopController.filterByBrand);

router.get('/distanceSellingContract',locals,categoriesMiddleware, shopController.getDistanceSellingContract);
router.get('/dataSecure',locals,categoriesMiddleware, shopController.getDataSecure);
router.get('/preliminaryInfo',locals,categoriesMiddleware, shopController.getPreliminaryInfo);
router.get('/personalDataProcessing',locals,categoriesMiddleware, shopController.getPersonalDataProcessing);
router.get('/deliveryAndReturn',locals,categoriesMiddleware, shopController.getDeliveryAndReturn);


router.get('/products/subcategory/:subcategory', shopController.getProductsBySubcategory);



module.exports = router;
