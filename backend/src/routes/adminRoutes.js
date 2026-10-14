const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.use(authenticate, authorize('admin'));
router.get('/dashboard', adminController.dashboard);
router.get('/users', adminController.listUsers);
router.patch('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);
router.get('/stores', adminController.listStores);
router.patch('/stores/:id/verification', adminController.verifyStore);
router.get('/products', adminController.listProducts);
router.patch('/products/:id/visibility', adminController.setProductVisibility);
router.delete('/products/:id', adminController.deleteProduct);
router.get('/orders', adminController.listOrders);

module.exports = router;
