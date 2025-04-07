const jwt = require('jsonwebtoken');
const User = require('../models/User');
const connectDB = require('../lib/db');

const protectRoute = async (req, res, next) => {
    let token;
    // Check for Authorization header (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Ensure database is connected before proceeding
            await connectDB();

            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify access token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token (excluding password)
            req.user = await User.findById(decoded.userId).select('-password');

            if (!req.user) {
                 return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            next();
        } catch (error) {
             console.error('Auth middleware error:', error.message);
             if (error.name === 'JsonWebTokenError') {
                 return res.status(401).json({ message: 'Not authorized, invalid token' });
             }
             if (error.name === 'TokenExpiredError') {
                 return res.status(401).json({ message: 'Not authorized, token expired' });
             }
             // Generic server error for other issues
            return res.status(500).json({ message: 'Server error during authentication' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

module.exports = { protectRoute };
