const express = require('express');
const router = express.Router();
const { 
    createCustomGpt, 
    getUserCustomGpts, 
    getCustomGptById, 
    updateCustomGpt, 
    deleteCustomGpt,
    deleteKnowledgeFile,
    uploadMiddleware
} = require('../controllers/customGptController');
const { protectRoute } = require('../middleware/authMiddleware');

// All routes are protected with authentication
router.use(protectRoute);

// Use the combined middleware for creation and update
router.post(
    '/', 
    uploadMiddleware,
    createCustomGpt
);

// Get all custom GPTs for authenticated user
router.get('/', getUserCustomGpts);

// Get, update, delete a specific custom GPT
router.get('/:id', getCustomGptById);

router.put(
    '/:id', 
    uploadMiddleware,
    updateCustomGpt
);

router.delete('/:id', deleteCustomGpt);

// Delete a knowledge file
router.delete('/:id/knowledge/:fileIndex', deleteKnowledgeFile);

module.exports = router; 