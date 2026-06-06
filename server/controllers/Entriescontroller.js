const DailyEntry = require("../models/DailyEntry");
const Achievement = require("../models/Achievement");

const MOOD_SCORES = {
  Excellent: 5,
  Happy: 4,
  Neutral: 3,
  Sad: 2,
  Anxious: 1,
  "Burned Out": 0,
};

// Calculate wellness score (0-100)
const calculateWellnessScore = (data) => {
  const moodScore = (MOOD_SCORES[data.mood] / 5) * 25;
  const sleepScore = (data.sleepHours / 12) * 20;
  const focusScore = (data.focus / 10) * 20;
  const stressScore = ((10 - data.stress) / 10) * 20;
  const energyScore = (data.energy / 10) * 15;
  return Math.round(
    Math.min(
      100,
      moodScore + sleepScore + focusScore + stressScore + energyScore,
    ),
  );
};

// Calculate burnout risk
const calculateBurnoutRisk = (data, consecutiveLowMoodDays = 0) => {
  const sleepDeficit = Math.max(0, 8 - data.sleepHours);
  const anxietyDays = consecutiveLowMoodDays;
  const score = Math.round(
    data.stress * 0.4 + sleepDeficit * 0.3 + anxietyDays * 0.3,
  );

  let risk = "Low";
  if (score >= 8) risk = "Critical";
  else if (score >= 6) risk = "High";
  else if (score >= 4) risk = "Moderate";

  return { risk, score: Math.min(100, score * 10) };
};

// Check and award achievements
const checkAchievements = async (userId) => {
  try {
    const entries = await DailyEntry.find({ userId }).sort({ createdAt: -1 });
    const existing = await Achievement.find({ userId });
    const earnedNames = existing.map((a) => a.badgeName);
    const newBadges = [];

    // Consistency Champion - 7 consecutive days
    if (!earnedNames.includes("Consistency Champion") && entries.length >= 7) {
      const last7 = entries.slice(0, 7);
      const isConsecutive = last7.every((entry, i) => {
        if (i === 0) return true;
        const diff =
          new Date(last7[i - 1].createdAt) - new Date(entry.createdAt);
        return diff < 48 * 60 * 60 * 1000;
      });
      if (isConsecutive) {
        newBadges.push({
          badgeName: "Consistency Champion",
          description: "7 consecutive check-ins",
        });
      }
    }

    // Reflection Master - 10 journals
    if (!earnedNames.includes("Reflection Master")) {
      const journalCount = entries.filter(
        (e) => e.journal && e.journal.length > 20,
      ).length;
      if (journalCount >= 10) {
        newBadges.push({
          badgeName: "Reflection Master",
          description: "10 journal entries completed",
        });
      }
    }

    // Wellness Warrior - avg wellness > 75 for 5 days
    if (!earnedNames.includes("Wellness Warrior") && entries.length >= 5) {
      const avg =
        entries.slice(0, 5).reduce((s, e) => s + e.wellnessScore, 0) / 5;
      if (avg >= 75) {
        newBadges.push({
          badgeName: "Wellness Warrior",
          description: "Average wellness > 75 for 5 days",
        });
      }
    }

    // Save new badges
    for (const badge of newBadges) {
      await Achievement.create({ userId, ...badge });
    }

    return newBadges;
  } catch (error) {
    console.error("Achievement check error:", error);
    return [];
  }
};

// @route POST /api/entries
const createEntry = async (req, res) => {
  try {
    const {
      mood,
      energy,
      stress,
      focus,
      motivation,
      sleepHours,
      studyHours,
      triggers,
      journal,
      aiAnalysis,
    } = req.body;

    // Count consecutive low mood days
    const recentEntries = await DailyEntry.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(7);

    let consecutiveLowMoodDays = 0;
    for (const entry of recentEntries) {
      if (MOOD_SCORES[entry.mood] <= 1) consecutiveLowMoodDays++;
      else break;
    }

    const wellnessScore = calculateWellnessScore({
      mood,
      energy,
      stress,
      focus,
      motivation,
      sleepHours,
    });
    const { risk: burnoutRisk, score: burnoutScore } = calculateBurnoutRisk(
      { stress, sleepHours, mood },
      consecutiveLowMoodDays,
    );

    const entry = await DailyEntry.create({
      userId: req.user._id,
      mood,
      moodScore: MOOD_SCORES[mood],
      energy,
      stress,
      focus,
      motivation,
      sleepHours,
      studyHours,
      triggers: triggers || [],
      journal: journal || "",
      wellnessScore,
      burnoutRisk,
      burnoutScore,
      aiAnalysis: aiAnalysis || {},
    });

    const newBadges = await checkAchievements(req.user._id);

    res.status(201).json({
      success: true,
      message: "Check-in saved successfully",
      entry,
      newBadges,
    });
  } catch (error) {
    console.error("Create entry error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to save check-in" });
  }
};

// @route GET /api/entries
const getEntries = async (req, res) => {
  try {
    const { limit = 30, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const entries = await DailyEntry.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await DailyEntry.countDocuments({ userId: req.user._id });

    res.json({ success: true, entries, total, page: parseInt(page) });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch entries" });
  }
};

// @route GET /api/entries/today
const getTodayEntry = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const entry = await DailyEntry.findOne({
      userId: req.user._id,
      createdAt: { $gte: today, $lt: tomorrow },
    });

    res.json({ success: true, entry });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch today entry" });
  }
};

// @route GET /api/entries/stats
const getStats = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const entries = await DailyEntry.find({
      userId: req.user._id,
      createdAt: { $gte: since },
    }).sort({ createdAt: 1 });

    if (!entries.length) {
      return res.json({ success: true, stats: null });
    }

    const avgWellness = Math.round(
      entries.reduce((s, e) => s + e.wellnessScore, 0) / entries.length,
    );
    const avgSleep = +(
      entries.reduce((s, e) => s + e.sleepHours, 0) / entries.length
    ).toFixed(1);
    const avgStress = +(
      entries.reduce((s, e) => s + e.stress, 0) / entries.length
    ).toFixed(1);
    const avgFocus = +(
      entries.reduce((s, e) => s + e.focus, 0) / entries.length
    ).toFixed(1);
    const avgStudy = +(
      entries.reduce((s, e) => s + e.studyHours, 0) / entries.length
    ).toFixed(1);

    // Streak calculation
    const allEntries = await DailyEntry.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    for (const entry of allEntries) {
      const entryDate = new Date(entry.createdAt);
      entryDate.setHours(0, 0, 0, 0);
      const diff = Math.round(
        (currentDate - entryDate) / (1000 * 60 * 60 * 24),
      );
      if (diff <= 1) {
        streak++;
        currentDate = entryDate;
      } else break;
    }

    res.json({
      success: true,
      stats: {
        avgWellness,
        avgSleep,
        avgStress,
        avgFocus,
        avgStudy,
        streak,
        totalEntries: allEntries.length,
        entries: entries.map((e) => ({
          date: e.createdAt,
          mood: e.mood,
          moodScore: e.moodScore,
          wellnessScore: e.wellnessScore,
          burnoutRisk: e.burnoutRisk,
          burnoutScore: e.burnoutScore,
          stress: e.stress,
          sleepHours: e.sleepHours,
          studyHours: e.studyHours,
          focus: e.focus,
          energy: e.energy,
        })),
      },
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
};

// @route GET /api/entries/calendar
const getCalendarData = async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 3;
    const since = new Date();
    since.setMonth(since.getMonth() - months);

    const entries = await DailyEntry.find({
      userId: req.user._id,
      createdAt: { $gte: since },
    }).select("createdAt moodScore mood wellnessScore");

    const calData = entries.map((e) => ({
      date: e.createdAt.toISOString().split("T")[0],
      moodScore: e.moodScore,
      mood: e.mood,
      wellnessScore: e.wellnessScore,
    }));

    res.json({ success: true, calData });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch calendar data" });
  }
};

module.exports = {
  createEntry,
  getEntries,
  getTodayEntry,
  getStats,
  getCalendarData,
};
