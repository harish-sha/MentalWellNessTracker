const mongoose = require('mongoose');

const pomodoroSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completedSessions: {
    type: Number,
    default: 0
  },
  focusTimeMinutes: {
    type: Number,
    default: 0
  },
  breakTimeMinutes: {
    type: Number,
    default: 0
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  }
});

pomodoroSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Pomodoro', pomodoroSchema);