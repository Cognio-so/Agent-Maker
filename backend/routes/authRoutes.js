const express = require('express');
const router = express.Router();
const { Signup, Login, Logout, googleAuth, googleAuthCallback, getCurrentUser, getAllUsers, inviteTeamMember, getPendingInvitesCount, setInactive } = require('../controllers/AuthContoller');
const passport = require('passport');
const { protectRoute } = require('../middleware/authMiddleware'); // Imports protectRoute

router.post('/signup', Signup);
router.post('/login', Login);
router.post('/logout', Logout);
router.get('/me', protectRoute, getCurrentUser); // Uses protectRoute

// Add the Google auth route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', googleAuthCallback);

// Add this route to authRoutes.js
router.get('/users', protectRoute, getAllUsers);

// Add this route to your existing routes
router.post('/invite', protectRoute, inviteTeamMember);

// Add this route
router.get('/pending-invites/count', protectRoute, getPendingInvitesCount);

// Add the new protected route to mark user as inactive BEFORE logout
router.put('/me/inactive', protectRoute, setInactive); // Use PUT and protectRoute

module.exports = router;
