const express = require('express');
const router = express.Router();
const adminOrdersApiController = require('../../controllers/api/adminOrdersApiController');
const { requireAdmin } = require('../../middleware/apiAuth');

router.use(requireAdmin);

router.get('/', adminOrdersApiController.getDashboard);

module.exports = router;
