const express = require('express');
const router = express.Router();
const { logSession, getStats } = require('../controllers/BreathingController');

// Fake User Middleware
const mockUser = (req, res, next) => {
  if (!req.user) req.user = { _id: "60c72b2f9b1d8b2bad7f1234" }; 
  next();
};

router.post('/session', mockUser, logSession);
router.get('/stats', mockUser, getStats);

module.exports = router;