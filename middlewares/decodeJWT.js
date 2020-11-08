const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // Gather the jwt access token from the request header
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) {
    res.status(401).json({
      success: false,
      response: {
        reason: "No Authenticate Token Provided."
      }
    })
    return;
  } // if there isn't any token

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      res.status(403).json({ success: false,
        response: { reason: 'Invalid Auth Token.',
          error: err.message
        }})
      return ;
    }
    req.user = user
    next() // pass the execution off to whatever request the client intended
  })
}

module.exports = { authenticateToken }
