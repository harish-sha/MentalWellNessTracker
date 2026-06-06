const BreathingSession = require("../models/BreathingSession");
const Achievement = require("../models/Achievement");

const getTodayDate = () => new Date().toISOString().split("T")[0];

// @route POST /api/breathing/session
const logSession = async (req, res) => {
  try {
    const date = getTodayDate();

    let record = await BreathingSession.findOne({ userId: req.user._id, date });

    if (record) {
      record.sessionsCompleted += 1;
      await record.save();
    } else {
      record = await BreathingSession.create({
        userId: req.user._id,
        date,
        sessionsCompleted: 1,
      });
    }

    // Check Calm Mind achievement (10 sessions total)
    const allSessions = await BreathingSession.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: null, total: { $sum: "$sessionsCompleted" } } },
    ]);

    const totalSessions = allSessions[0]?.total || 0;
    if (totalSessions >= 10) {
      const existing = await Achievement.findOne({
        userId: req.user._id,
        badgeName: "Calm Mind",
      });
      if (!existing) {
        await Achievement.create({
          userId: req.user._id,
          badgeName: "Calm Mind",
          description: "10 breathing sessions completed",
        });
      }
    }

    res.json({ success: true, record, totalSessions });
  } catch (error) {
    console.error("Breathing session error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to log breathing session" });
  }
};

// @route GET /api/breathing/stats
const getStats = async (req, res) => {
  try {
    const records = await BreathingSession.find({ userId: req.user._id });
    const totalSessions = records.reduce((s, r) => s + r.sessionsCompleted, 0);
    const today = getTodayDate();
    const todayRecord = records.find((r) => r.date === today);

    res.json({
      success: true,
      stats: {
        totalSessions,
        todaySessions: todayRecord?.sessionsCompleted || 0,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch breathing stats" });
  }
};

module.exports = { logSession, getStats };
