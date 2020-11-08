const jwt = require('jsonwebtoken');
const sign = (obj) => {
  return jwt.sign(obj, process.env.JWT_SECRET)
};

module.exports = sign;
