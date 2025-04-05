const mongoose = require('mongoose');

const UserGptAssignmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomGpt',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Compound index to ensure a user can only be assigned a specific GPT once
UserGptAssignmentSchema.index({ userId: 1, gptId: 1 }, { unique: true });

module.exports = mongoose.model('UserGptAssignment', UserGptAssignmentSchema);