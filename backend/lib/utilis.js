const jwt = require('jsonwebtoken');

// Generates Access Token (short-lived)
const generateAccessToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' }); // e.g., 15 minutes
};

const generateRefreshTokenAndSetCookie = (res, userId) => {
    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' }); // e.g., 7 days

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // 'None' for cross-site, 'Lax' for development
        path: '/api/auth/refresh', // Scope cookie to the refresh token path
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

// Clears the Refresh Token cookie
const clearRefreshTokenCookie = (res) => {
    res.cookie('refreshToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        path: '/api/auth/refresh',
        expires: new Date(0), // Set expiry date to the past
    });
};

module.exports = { generateAccessToken, generateRefreshTokenAndSetCookie, clearRefreshTokenCookie };
