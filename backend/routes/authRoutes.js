const express = require('express');
const router = express.Router();
const { Signup, Login, Logout, googleAuth, googleAuthCallback, getCurrentUser } = require('../controllers/AuthContoller');
const passport = require('passport');
const { protectRoute } = require('../middleware/authMiddleware'); // Imports protectRoute

router.post('/signup', Signup);
router.post('/login', Login);
router.post('/logout', Logout);
router.get('/me', protectRoute, getCurrentUser); // Uses protectRoute

// Add the Google auth route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', googleAuthCallback);

module.exports = router;
