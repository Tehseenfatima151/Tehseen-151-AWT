const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_here';
    const bearer = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
    const decoded = jwt.verify(bearer, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
