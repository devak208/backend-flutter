const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication failed. Token not provided or invalid format.' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decodedToken.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed. User not found.' });
    }
    
    // Attach user to request
    req.userId = decodedToken.userId;
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Authentication failed. Invalid token.' });
  }
};