const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const vendorController = require('../controllers/vendorController');

const router = express.Router();

router.use(authenticate, authorize('vendor'));
router.get('/me/store', vendorController.getStore);
router.put('/me/store', vendorController.saveStore);
router.get('/me/dashboard', vendorController.dashboard);
router.get('/me/products', vendorController.listProducts);
router.get('/me/orders', vendorController.listOrders);
router.patch('/me/orders/:id/status', vendorController.updateOrderStatus);

module.exports = router;
