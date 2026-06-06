const Achievement = require("../models/Achievement");

// @route GET /api/achievements
const getAchievements = async (req, res) => {
  try {
    const earned = await Achievement.find({ userId: req.user._id }).sort({
      earnedAt: -1,
    });

    const allBadges = [
      {
        name: "Consistency Champion",
        description: "7 consecutive check-ins",
        icon: "🏆",
      },
      {
        name: "Reflection Master",
        description: "10 journal entries completed",
        icon: "📝",A
      },
      {
        name: "Focus Warrior",
        description: "20 Pomodoro sessions completed",
        icon: "⚡",
      },
      {
        name: "Calm Mind",
        description: "10 breathing sessions completed",
        icon: "🌿",
      },
      {
        name: "Wellness Warrior",
        description: "Average wellness > 75 for 5 days",
        icon: "💪",
      },
      {
        name: "Stress Slayer",
        description: "Stress below 4 for 5 consecutive days",
        icon: "🧘",
      },
      {
        name: "Sleep Hero",
        description: "7+ hours sleep for 5 consecutive days",
        icon: "🌙",
      },
    ];

    const earnedNames = earned.map((a) => a.badgeName);
    const badges = allBadges.map((badge) => ({
      ...badge,
      earned: earnedNames.includes(badge.name),
      earnedAt:
        earned.find((a) => a.badgeName === badge.name)?.earnedAt || null,
    }));

    res.json({ success: true, badges, totalEarned: earned.length });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch achievements" });
  }
};

module.exports = { getAchievements };
