const express = require('express');
const { getAchievements } = require('../controllers/achievementsController');
const router = express.Router();
// NOTE: Add your authentication middleware here once created (e.g., protect)
// For now, we stub a mock user to avoid crashing your controller request

router.get('/', (req, res, next) => {
  // Temporary middleware injector until your auth middleware is implemented
  if (!req.user) req.user = { _id: "60c72b2f9b1d8b2bad7f1234" }; 
  next();
}, getAchievements);

module.exports = router;