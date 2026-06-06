const mongoose = require('mongoose');

const breathingSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionsCompleted: {
    type: Number,
    default: 1
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

breathingSessionSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('BreathingSession', breathingSessionSchema);