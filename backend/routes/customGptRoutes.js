const express = require('express');
const router = express.Router();
const { 
    createCustomGpt, 
    getUserCustomGpts, 
    getCustomGptById, 
    updateCustomGpt, 
    deleteCustomGpt,
    deleteKnowledgeFile,
    uploadMiddleware,
    getAllCustomGpts,
    getUserAssignedGpts,
    assignGptToUser,
    unassignGptFromUser,
    getUserGptCount,
    getAssignedGptById
} = require('../controllers/customGptController');
const { protectRoute } = require('../middleware/authMiddleware');

// All routes need authentication
router.use(protectRoute);

// Root route - this should handle /api/custom-gpts GET requests
router.get('/', getAllCustomGpts);

// User-specific GPTs
router.get('/user', getUserCustomGpts);

// Team routes (need to come before /:id routes)
router.get('/team/gpt-counts', getUserGptCount);
router.get('/team/members/:userId/gpts', getUserAssignedGpts);
router.post('/team/members/:userId/gpts', assignGptToUser);
router.delete('/team/members/:userId/gpts/:gptId', unassignGptFromUser);

// Create new GPT
router.post('/', uploadMiddleware, createCustomGpt);

// Parameter routes - MUST be last
router.get('/:id', getCustomGptById);
router.put('/:id', uploadMiddleware, updateCustomGpt);
router.delete('/:id', deleteCustomGpt);
router.delete('/:id/knowledge/:fileIndex', deleteKnowledgeFile);

// Get assigned GPT by ID for the current user
router.get('/user/assigned/:id', protectRoute, getAssignedGptById);

// User assigned GPTs (for regular users to see their collections)
router.get('/user/assigned', protectRoute, getUserAssignedGpts);

module.exports = router; 