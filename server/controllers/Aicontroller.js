const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI;
const getGenAI = () => {
  if (!genAI) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI;
};

// @route POST /api/ai/analyze-journal
const analyzeJournal = async (req, res) => {
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
    } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: true,
        analysis: getFallbackAnalysis(mood, stress, sleepHours),
      });
    }

    const model = getGenAI().getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are MindGuard AI, a compassionate mental wellness coach for students preparing for Indian competitive exams (NEET, JEE, UPSC, CAT, GATE, CUET).

Analyze this student's daily check-in data:
- Mood: ${mood}
- Energy Level: ${energy}/10
- Stress Level: ${stress}/10
- Focus Level: ${focus}/10
- Motivation Level: ${motivation}/10
- Sleep Hours: ${sleepHours}h
- Study Hours: ${studyHours}h
- Stress Triggers: ${triggers && triggers.length ? triggers.join(", ") : "None selected"}
- Journal Entry: "${journal || "No journal entry provided"}"

Provide a compassionate, personalized analysis. Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "emotion": "primary emotion in 1-2 words",
  "confidence": 0-100,
  "risk": "Low|Moderate|High",
  "summary": "2-3 sentence empathetic summary of their emotional state and situation",
  "recommendations": ["specific actionable tip 1", "specific actionable tip 2", "specific actionable tip 3"],
  "motivation": "one powerful motivational sentence personalized to their exam preparation journey"
}

Important:
- Be warm, empathetic, and non-judgmental
- Never provide medical diagnoses
- Base recommendations on actual data provided
- Keep recommendations practical and exam-specific`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const clean = text.replace(/```json|```/g, "").trim();
    const analysis = JSON.parse(clean);

    res.json({ success: true, analysis });
  } catch (error) {
    console.error("AI analyze error:", error);
    res.json({
      success: true,
      analysis: getFallbackAnalysis(
        req.body.mood,
        req.body.stress,
        req.body.sleepHours,
      ),
    });
  }
};

// @route POST /api/ai/chat
const chat = async (req, res) => {
  try {
    const { message, history, userProfile } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: true,
        reply: getFallbackChatReply(message),
      });
    }

    const model = getGenAI().getGenerativeModel({ model: "gemini-2.0-flash" });

    const systemContext = `You are MindGuard AI, a compassionate and empathetic mental wellness coach specifically designed for students preparing for Indian competitive exams (NEET, JEE, UPSC, CAT, GATE, CUET, SSC, Banking, Board Exams).

Student profile: ${userProfile ? `Name: ${userProfile.name}, Exam: ${userProfile.examType}` : "Competitive exam student"}

Your role:
- Provide emotional support, motivation, and practical wellness guidance
- Offer study strategies, stress management, and mindfulness techniques
- Be warm, understanding, encouraging, and culturally sensitive
- Keep responses concise (2-4 sentences) unless more detail is genuinely helpful
- Never provide medical diagnoses or replace professional mental health care
- For serious distress signals, gently suggest speaking with a trusted adult or counselor
- Use simple, friendly language appropriate for students`;

    const conversationHistory = (history || []).slice(-6).map((h) => ({
      role: h.role,
      parts: [{ text: h.content }],
    }));

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemContext }] },
        {
          role: "model",
          parts: [
            {
              text: "Understood. I am MindGuard AI, ready to support students with compassion and practical guidance.",
            },
          ],
        },
        ...conversationHistory,
      ],
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    res.json({ success: true, reply });
  } catch (error) {
    console.error("AI chat error:", error);
    res.json({
      success: true,
      reply:
        "I'm here for you. Remember that every challenge in your preparation journey is making you stronger. Take a deep breath and know that you're doing your best. 💙",
    });
  }
};

// @route POST /api/ai/daily-summary
const getDailySummary = async (req, res) => {
  try {
    const { entries } = req.body;

    if (!entries || !entries.length) {
      return res.json({ success: true, summary: null });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: true,
        summary:
          "You've been consistent with your check-ins. Keep monitoring your wellness daily for better insights.",
      });
    }

    const model = getGenAI().getGenerativeModel({ model: "gemini-2.0-flash" });

    const recentData = entries.slice(0, 7);
    const prompt = `Analyze these 7-day wellness trends for a competitive exam student and provide a brief, encouraging weekly summary in 2-3 sentences:

Data: ${JSON.stringify(
      recentData.map((e) => ({
        mood: e.mood,
        wellness: e.wellnessScore,
        stress: e.stress,
        sleep: e.sleepHours,
      })),
    )}

Be specific about what you notice (improving/declining patterns) and give one concrete suggestion. Keep it warm and motivating.`;

    const result = await model.generateContent(prompt);
    res.json({ success: true, summary: result.response.text() });
  } catch (error) {
    console.error("Daily summary error:", error);
    res.json({ success: true, summary: null });
  }
};

const getFallbackAnalysis = (mood, stress, sleep) => {
  const risk = stress >= 8 ? "High" : stress >= 5 ? "Moderate" : "Low";
  return {
    emotion: mood || "Neutral",
    confidence: 75,
    risk,
    summary: `Your check-in has been recorded. ${stress >= 7 ? "Your stress levels seem elevated today — this is normal during exam preparation." : "You seem to be managing your stress reasonably well."} ${sleep < 6 ? "Try to prioritize sleep tonight as it directly impacts your focus and memory retention." : "Good sleep habits will continue to support your performance."}`,
    recommendations: [
      "Take 5-minute breaks every hour during study sessions to maintain focus",
      "Practice the 4-4-6 breathing exercise in the Tools section to manage stress",
      `${sleep < 7 ? "Aim for 7-8 hours of sleep tonight — it enhances memory consolidation" : "Maintain your sleep schedule, it's helping your preparation"}`,
    ],
    motivation:
      "Every hour of focused preparation today is an investment in your success tomorrow. You have the strength to achieve your goals.",
  };
};

const getFallbackChatReply = (message) => {
  const lower = message.toLowerCase();
  if (lower.includes("fail") || lower.includes("score")) {
    return "One test doesn't define your journey. Every great achiever has faced setbacks — what matters is how you respond. Review what went wrong, adjust your approach, and keep going. Your consistency will pay off. 💪";
  }
  if (
    lower.includes("anxious") ||
    lower.includes("anxiety") ||
    lower.includes("stress")
  ) {
    return "Exam anxiety is incredibly common and shows you care about your future. Try the breathing exercise in the Tools section right now — it activates your body's calm response within minutes. You're more prepared than you feel. 🌿";
  }
  if (lower.includes("focus") || lower.includes("concentrate")) {
    return "Difficulty focusing often signals your brain needs a reset. Try the Pomodoro technique: 25 minutes of focused study, then a 5-minute break. Also ensure you've had water, food, and movement today. Small resets lead to big breakthroughs. ⏱️";
  }
  if (lower.includes("motivat")) {
    return "Remember why you started this journey. Your dream — whether it's NEET, JEE, or any other exam — is worth every difficult day. Progress is rarely linear, but every consistent step forward matters. You're closer than you were yesterday. 🌟";
  }
  return "I hear you. Whatever you're going through during this exam preparation phase is valid. Take it one day at a time, use the wellness tools available here, and remember — your mental health matters as much as your rank. How can I support you today? 💙";
};

module.exports = { analyzeJournal, chat, getDailySummary };
