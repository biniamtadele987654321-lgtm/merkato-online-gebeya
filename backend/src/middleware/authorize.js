const httpError = require('../utils/httpError');

module.exports = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    next(httpError(403, 'You do not have permission to perform this action'));
    return;
  }

  next();
};
