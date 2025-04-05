const express = require('express');
const router = express.Router();
const InvitationController = require('../controllers/InvitationController');
const { protectRoute } = require('../middleware/authMiddleware');

// Invite a team member
router.post('/invite', protectRoute, InvitationController.inviteTeamMember);

// Get pending invites count
router.get('/pending-invites/count', protectRoute, InvitationController.getPendingInvitesCount);

// Verify invitation token
router.get('/verify-invitation/:token', InvitationController.verifyInvitation);

module.exports = router; 