const CustomGpt = require('../models/CustomGpt');
const { uploadToR2, deleteFromR2 } = require('../lib/r2');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Define specific field handlers
const handleImageUpload = upload.single('image');
const handleKnowledgeUpload = upload.array('knowledgeFiles', 5);

// New combined middleware for handling both optional fields
const handleCombinedUpload = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'knowledgeFiles', maxCount: 5 }
]);

// Create a new custom GPT
const createCustomGpt = async (req, res) => {
  
    
    try {
        const { name, description, instructions, conversationStarter, model, capabilities } = req.body;
        
        // Validate required fields manually for clarity (optional but helpful)
        if (!name || !description || !instructions) {
             console.error("Validation Error: Missing required fields (name, description, instructions)");
             return res.status(400).json({ success: false, message: 'Missing required fields: name, description, instructions' });
        }
        if (!req.user?._id) {
             console.error("Auth Error: req.user._id is missing");
             return res.status(401).json({ success: false, message: 'Authentication error, user ID not found' });
        }

        let parsedCapabilities;
        try {
            parsedCapabilities = JSON.parse(capabilities || '{"webBrowsing": true}');
        } catch (parseError) {
            console.error("Error parsing capabilities JSON:", parseError);
            return res.status(400).json({ success: false, message: 'Invalid format for capabilities' });
        }

        // Create the custom GPT object
        const customGptData = {
            name,
            description,
            instructions,
            conversationStarter,
            model,
            capabilities: parsedCapabilities,
            createdBy: req.user._id,
            imageUrl: null,       // Initialize explicitly
            knowledgeFiles: []  // Initialize explicitly
        };
        
        const customGpt = new CustomGpt(customGptData);

        // Access files from req.files
        const imageFile = req.files?.image?.[0];
        const knowledgeUploads = req.files?.knowledgeFiles || [];

        // Upload image if provided
        if (imageFile) {
            try {
                const { fileUrl } = await uploadToR2(
                    imageFile.buffer, 
                    imageFile.originalname, 
                    'images/gpt'
                );
                customGpt.imageUrl = fileUrl;
            } catch (uploadError) {
                 console.error("Error during image upload to R2:", uploadError);
                 // Decide if you want to stop or continue without the image
                 return res.status(500).json({ success: false, message: 'Failed during image upload', error: uploadError.message });
            }
        }

        // Upload knowledge files if provided
        if (knowledgeUploads.length > 0) {
            try {
                const knowledgeFilesData = await Promise.all(
                    knowledgeUploads.map(async (file) => {
                        const { fileUrl } = await uploadToR2(
                            file.buffer, 
                            file.originalname, 
                            'knowledge'
                        );
                        return {
                            name: file.originalname,
                            fileUrl,
                            fileType: file.mimetype,
                        };
                    })
                );
                customGpt.knowledgeFiles = knowledgeFilesData;
            } catch (uploadError) {
                console.error("Error during knowledge file upload to R2:", uploadError);
                // Decide if you want to stop or continue without the knowledge files
                return res.status(500).json({ success: false, message: 'Failed during knowledge file upload', error: uploadError.message });
            }
        }


        // Explicitly log the save operation and force a database test
        const savedGpt = await customGpt.save();
        
        // DIRECT DATABASE VERIFICATION - force a fresh read from DB
        const verifyResult = await CustomGpt.findById(savedGpt._id);
        if (verifyResult) {
        } else {
          console.error("VERIFICATION FAILED: Document not found in DB after save!");
        }
        
        res.status(201).json({
          success: true,
          message: 'Custom GPT created successfully',
          customGpt: savedGpt
        });

    } catch (error) {
        // Log the specific error
        console.error('--- Error caught in createCustomGpt catch block ---'); 
        console.error("Error Name:", error.name); 
        console.error("Error Message:", error.message); 
        console.error("Full Error Object:", error); 

        // Check for Mongoose validation errors specifically
        if (error.name === 'ValidationError') {
            // Extract cleaner validation messages
            const validationErrors = Object.values(error.errors).map(err => err.message);
            console.error("Validation Errors:", validationErrors);
            return res.status(400).json({ 
                success: false, 
                message: 'Validation failed', 
                errors: validationErrors 
            });
        }

        res.status(500).json({ 
            success: false, 
            message: 'Failed to create custom GPT', 
            error: error.message // Send a generic message or specific if safe
        });
    }
};

// Get all custom GPTs for the current user
const getUserCustomGpts = async (req, res) => {
    try {
        const customGpts = await CustomGpt.find({ createdBy: req.user._id });
        res.status(200).json({ 
            success: true, 
            customGpts 
        });
    } catch (error) {
        console.error('Error fetching custom GPTs:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch custom GPTs', 
            error: error.message 
        });
    }
};

// Get a specific custom GPT by ID
const getCustomGptById = async (req, res) => {
    try {
        const customGpt = await CustomGpt.findById(req.params.id);
        
        if (!customGpt) {
            return res.status(404).json({ 
                success: false, 
                message: 'Custom GPT not found' 
            });
        }

        // Check if the user owns this GPT
        if (customGpt.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to access this custom GPT' 
            });
        }

        res.status(200).json({ 
            success: true, 
            customGpt 
        });
    } catch (error) {
        console.error('Error fetching custom GPT:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch custom GPT', 
            error: error.message 
        });
    }
};

// Update a custom GPT
const updateCustomGpt = async (req, res) => {
    try {
        let customGpt = await CustomGpt.findById(req.params.id);
        
        if (!customGpt) {
            return res.status(404).json({ 
                success: false, 
                message: 'Custom GPT not found' 
            });
        }

        // Check if the user owns this GPT
        if (customGpt.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to update this custom GPT' 
            });
        }

        const { name, description, instructions, conversationStarter, model, capabilities } = req.body;
        
        // Update basic fields
        customGpt.name = name || customGpt.name;
        customGpt.description = description || customGpt.description;
        customGpt.instructions = instructions || customGpt.instructions;
        customGpt.conversationStarter = conversationStarter ?? customGpt.conversationStarter;
        customGpt.model = model || customGpt.model;
        
        if (capabilities) {
            customGpt.capabilities = JSON.parse(capabilities);
        }

        // Access files from req.files (now an object)
        const imageFile = req.files?.image ? req.files.image[0] : null;
        const knowledgeUploads = req.files?.knowledgeFiles || [];

        // Upload new image if provided
        if (imageFile) {
            // Delete old image if exists
            if (customGpt.imageUrl) {
                // Extract key from imageUrl
                const key = customGpt.imageUrl.replace(process.env.R2_PUBLIC_URL + '/', '');
                await deleteFromR2(key);
            }
            
            const { fileUrl } = await uploadToR2(
                imageFile.buffer, 
                imageFile.originalname, 
                'images/gpt'
            );
            customGpt.imageUrl = fileUrl;
        }

        // Handle knowledge files if provided
        if (knowledgeUploads.length > 0) {
            // Delete old files if needed and specified in request
            if (req.body.replaceKnowledge === 'true' && customGpt.knowledgeFiles.length > 0) {
                for (const file of customGpt.knowledgeFiles) {
                    const key = file.fileUrl.replace(process.env.R2_PUBLIC_URL + '/', '');
                    await deleteFromR2(key);
                }
                customGpt.knowledgeFiles = [];
            }
            
            // Upload new files
            const newKnowledgeFilesData = await Promise.all(
                knowledgeUploads.map(async (file) => {
                    const { fileUrl } = await uploadToR2(
                        file.buffer, 
                        file.originalname, 
                        'knowledge'
                    );
                    return {
                        name: file.originalname,
                        fileUrl,
                        fileType: file.mimetype,
                    };
                })
            );
            
            customGpt.knowledgeFiles = [
                ...customGpt.knowledgeFiles, 
                ...newKnowledgeFilesData
            ];
        }

        await customGpt.save();
        
        res.status(200).json({ 
            success: true, 
            message: 'Custom GPT updated successfully', 
            customGpt 
        });
    } catch (error) {
        console.error('Error updating custom GPT:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update custom GPT', 
            error: error.message 
        });
    }
};

// Delete a custom GPT
const deleteCustomGpt = async (req, res) => {
    try {
        const customGpt = await CustomGpt.findById(req.params.id);
        
        if (!customGpt) {
            return res.status(404).json({ 
                success: false, 
                message: 'Custom GPT not found' 
            });
        }

        // Check if the user owns this GPT
        if (customGpt.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to delete this custom GPT' 
            });
        }

        // Delete associated files from R2
        if (customGpt.imageUrl) {
            const imageKey = customGpt.imageUrl.replace(process.env.R2_PUBLIC_URL + '/', '');
            await deleteFromR2(imageKey);
        }

        // Delete knowledge files
        for (const file of customGpt.knowledgeFiles) {
            const fileKey = file.fileUrl.replace(process.env.R2_PUBLIC_URL + '/', '');
            await deleteFromR2(fileKey);
        }

        // Delete the custom GPT from database
        await CustomGpt.findByIdAndDelete(req.params.id);
        
        res.status(200).json({ 
            success: true, 
            message: 'Custom GPT deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting custom GPT:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete custom GPT', 
            error: error.message 
        });
    }
};

// Delete a specific knowledge file
const deleteKnowledgeFile = async (req, res) => {
    try {
        const { id, fileIndex } = req.params;
        
        const customGpt = await CustomGpt.findById(id);
        
        if (!customGpt) {
            return res.status(404).json({ 
                success: false, 
                message: 'Custom GPT not found' 
            });
        }

        // Check if the user owns this GPT
        if (customGpt.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to modify this custom GPT' 
            });
        }

        // Check if the file exists
        if (!customGpt.knowledgeFiles[fileIndex]) {
            return res.status(404).json({ 
                success: false, 
                message: 'Knowledge file not found' 
            });
        }

        // Delete the file from R2
        const fileKey = customGpt.knowledgeFiles[fileIndex].fileUrl.replace(process.env.R2_PUBLIC_URL + '/', '');
        await deleteFromR2(fileKey);

        // Remove the file from the array
        customGpt.knowledgeFiles.splice(fileIndex, 1);
        await customGpt.save();

        res.status(200).json({ 
            success: true, 
            message: 'Knowledge file deleted successfully', 
            customGpt 
        });
    } catch (error) {
        console.error('Error deleting knowledge file:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete knowledge file', 
            error: error.message 
        });
    }
};

module.exports = {
    createCustomGpt,
    getUserCustomGpts,
    getCustomGptById,
    updateCustomGpt,
    deleteCustomGpt,
    deleteKnowledgeFile,
    uploadMiddleware: handleCombinedUpload,
}; 