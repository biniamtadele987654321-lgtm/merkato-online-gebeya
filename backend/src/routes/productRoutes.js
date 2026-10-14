const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const productController = require('../controllers/productController');

const router = express.Router();

router.get('/', productController.list);
router.get('/:id', productController.get);
router.post('/', authenticate, authorize('vendor'), productController.create);
router.patch('/:id', authenticate, authorize('vendor'), productController.update);
router.delete('/:id', authenticate, authorize('vendor'), productController.remove);

module.exports = router;
