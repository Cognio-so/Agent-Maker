const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const customGptSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    instructions: {
        type: String,
        required: true,
    },
    conversationStarter: {
        type: String,
        default: '',
    },
    model: {
        type: String,
        enum: ['gpt-4', 'gpt-3.5', 'claude', 'gemini', 'llama'],
        default: 'gpt-4',
    },
    capabilities: {
        webBrowsing: {
            type: Boolean,
            default: true,
        },
    },
    imageUrl: {
        type: String,
        default: null,
    },
    knowledgeFiles: [{
        name: String,
        fileUrl: String,
        fileType: String,
    }],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, { timestamps: true });

// Add logging to debug Schema registration
const CustomGpt = mongoose.model('CustomGpt', customGptSchema);

module.exports = CustomGpt; 