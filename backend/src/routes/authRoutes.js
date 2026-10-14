const express = require('express');
const { rateLimit } = require('express-rate-limit');
const authenticate = require('../middleware/authenticate');
const authController = require('../controllers/authController');

const router = express.Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler(req, res) {
    res.status(429).json({ message: 'Too many sign-in attempts. Try again in 15 minutes.' });
  },
});

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.get('/me', authenticate, authController.me);

module.exports = router;
