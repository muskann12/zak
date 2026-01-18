const jwt = require('jsonwebtoken');
const sendResponse = require('../utils/sendResponse');
const prisma = require('../config/db');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendResponse(res, 401, false, 'Access denied. No token provided.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists and is approved
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    
    if (!user) {
      return sendResponse(res, 401, false, 'User not found.');
    }

    if (!user.isApproved) {
      return sendResponse(res, 403, false, 'Account is not approved yet.');
    }

    req.user = user;
    next();
  } catch (error) {
    return sendResponse(res, 401, false, 'Invalid token.');
  }
};

module.exports = { verifyToken };