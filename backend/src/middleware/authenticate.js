const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

const authenticate = asyncHandler(async (req, res, next) => {
  const authorization = req.get('authorization');
  const [scheme, token] = authorization ? authorization.split(' ') : [];

  if (scheme !== 'Bearer' || !token) {
    throw httpError(401, 'Authentication is required');
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw httpError(401, 'The access token is invalid or expired');
    }
    throw error;
  }

  const user = await User.findById(payload.sub).select('_id name email role phone');
  if (!user) {
    throw httpError(401, 'The account for this access token no longer exists');
  }

  req.user = user;
  next();
});

module.exports = authenticate;
