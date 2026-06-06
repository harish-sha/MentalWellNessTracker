const mongoose = require('mongoose');

const dailyEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mood: {
    type: String,
    enum: ['Excellent', 'Happy', 'Neutral', 'Sad', 'Anxious', 'Burned Out'],
    required: true
  },
  moodScore: {
    type: Number,
    min: 0,
    max: 5
  },
  energy: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  stress: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  focus: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  motivation: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  sleepHours: {
    type: Number,
    min: 0,
    max: 12,
    required: true
  },
  studyHours: {
    type: Number,
    min: 0,
    max: 16,
    required: true
  },
  triggers: {
    type: [String],
    enum: [
      'Exam Pressure',
      'Family Expectations',
      'Low Scores',
      'Social Media',
      'Future Uncertainty',
      'Sleep Issues',
      'Financial Issues',
      'Peer Comparison',
      'Time Management'
    ],
    default: []
  },
  journal: {
    type: String,
    maxlength: [5000, 'Journal cannot exceed 5000 characters'],
    default: ''
  },
  wellnessScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  burnoutRisk: {
    type: String,
    enum: ['Low', 'Moderate', 'High', 'Critical'],
    default: 'Low'
  },
  burnoutScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  aiAnalysis: {
    emotion: { type: String, default: '' },
    confidence: { type: Number, default: 0 },
    risk: { type: String, default: 'Low' },
    summary: { type: String, default: '' },
    recommendations: { type: [String], default: [] },
    motivation: { type: String, default: '' }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// One entry per day per user
dailyEntrySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('DailyEntry', dailyEntrySchema);