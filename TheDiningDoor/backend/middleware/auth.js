const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dining_door_dev_secret';

module.exports = function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token. Authorization denied.' });
  }
  try {
    const token   = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Token is invalid or expired.' });
  }
};
