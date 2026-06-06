const Pomodoro = require("../models/Pomodoro");
const Achievement = require("../models/Achievement");

const getTodayDate = () => new Date().toISOString().split("T")[0];

// @route POST /api/pomodoro/session
const logSession = async (req, res) => {
  try {
    const { focusMinutes = 25, breakMinutes = 5 } = req.body;
    const date = getTodayDate();

    let record = await Pomodoro.findOne({ userId: req.user._id, date });

    if (record) {
      record.completedSessions += 1;
      record.focusTimeMinutes += focusMinutes;
      record.breakTimeMinutes += breakMinutes;
      await record.save();
    } else {
      record = await Pomodoro.create({
        userId: req.user._id,
        date,
        completedSessions: 1,
        focusTimeMinutes: focusMinutes,
        breakTimeMinutes: breakMinutes,
      });
    }

    // Check Focus Warrior achievement (20 sessions total)
    const allSessions = await Pomodoro.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: null, total: { $sum: "$completedSessions" } } },
    ]);

    const totalSessions = allSessions[0]?.total || 0;
    if (totalSessions >= 20) {
      const existing = await Achievement.findOne({
        userId: req.user._id,
        badgeName: "Focus Warrior",
      });
      if (!existing) {
        await Achievement.create({
          userId: req.user._id,
          badgeName: "Focus Warrior",
          description: "20 Pomodoro sessions completed",
        });
      }
    }

    res.json({ success: true, record });
  } catch (error) {
    console.error("Pomodoro session error:", error);
    res.status(500).json({ success: false, message: "Failed to log session" });
  }
};

// @route GET /api/pomodoro/stats
const getStats = async (req, res) => {
  try {
    const records = await Pomodoro.find({ userId: req.user._id });
    const totalSessions = records.reduce((s, r) => s + r.completedSessions, 0);
    const totalFocusMinutes = records.reduce(
      (s, r) => s + r.focusTimeMinutes,
      0,
    );
    const today = getTodayDate();
    const todayRecord = records.find((r) => r.date === today);

    res.json({
      success: true,
      stats: {
        totalSessions,
        totalFocusMinutes,
        todaySessions: todayRecord?.completedSessions || 0,
        todayFocusMinutes: todayRecord?.focusTimeMinutes || 0,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch Pomodoro stats" });
  }
};

module.exports = { logSession, getStats };
