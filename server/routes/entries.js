const express = require('express');
const router = express.Router();
const { createEntry, getEntries, getTodayEntry, getStats, getCalendarData } = require('../controllers/entriescontroller');

// Fake User Middleware so the database doesn't crash without a login
const mockUser = (req, res, next) => {
  if (!req.user) req.user = { _id: "60c72b2f9b1d8b2bad7f1234" }; 
  next();
};

router.post('/', mockUser, createEntry);
router.get('/', mockUser, getEntries);
router.get('/today', mockUser, getTodayEntry);
router.get('/stats', mockUser, getStats);
router.get('/calendar', mockUser, getCalendarData);

module.exports = router;