const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  badgeName: {
    type: String,
    required: true,
    enum: [
      'Consistency Champion',
      'Reflection Master',
      'Focus Warrior',
      'Calm Mind',
      'Stress Slayer',
      'Sleep Hero',
      'Wellness Warrior'
    ]
  },
  description: {
    type: String,
    default: ''
  },
  earnedAt: {
    type: Date,
    default: Date.now
  }
});

achievementSchema.index({ userId: 1, badgeName: 1 }, { unique: true });

module.exports = mongoose.model('Achievement', achievementSchema);