const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.use(authenticate, authorize('customer'));
router.post('/', orderController.create);
router.get('/mine', orderController.listMine);
router.get('/:id', orderController.getMine);
router.post('/:id/cancel', orderController.cancelMine);
router.post('/:id/payment', orderController.initiatePayment);

module.exports = router;
