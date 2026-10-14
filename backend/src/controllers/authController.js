const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

function createToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
}

function authResponse(user) {
  return { token: createToken(user), user: user.toJSON() };
}

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role = 'customer' } = req.body;
  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    typeof phone !== 'string'
  ) {
    throw httpError(400, 'Name, email, password, and phone must be provided as text');
  }
  if (role !== 'customer' && role !== 'vendor') {
    throw httpError(400, 'Registration is only available for customers and vendors');
  }

  const existing = await User.exists({ email });
  if (existing) {
    throw httpError(409, 'An account with this email already exists');
  }

  const user = await User.create({ name, email, password, phone, role });
  res.status(201).json(authResponse(user));
});

exports.login = asyncHandler(async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = req.body.password;
  if (!email || typeof password !== 'string') {
    throw httpError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw httpError(401, 'Email or password is incorrect');
  }

  res.json(authResponse(user));
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toJSON() });
});
