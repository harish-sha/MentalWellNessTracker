import React, { useState } from 'react';
import { Brain, Activity, Battery, Moon, BookOpen, Target, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { entriesAPI } from '../services/api'; // Make sure this path is correct

const MOODS = [
  { label: 'Excellent', emoji: '🤩', score: 5 },
  { label: 'Happy', emoji: '😊', score: 4 },
  { label: 'Neutral', emoji: '😐', score: 3 },
  { label: 'Sad', emoji: '😔', score: 2 },
  { label: 'Anxious', emoji: '😰', score: 1 },
  { label: 'Burned Out', emoji: '😫', score: 0 }
];

export default function CheckIn() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Note: I added 'motivation' because your backend Mongoose schema requires it!
  const [formData, setFormData] = useState({
    mood: '', stress: 5, energy: 5, focus: 5, motivation: 5, sleepHours: 7, studyHours: 4, journal: ''
  });
  const [result, setResult] = useState(null);

  const handleSlider = (e) => setFormData({ ...formData, [e.target.name]: Number(e.target.value) });

  const submitCheckIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 🚀 Send data to your real backend
      const res = await entriesAPI.create(formData);
      const { entry, newBadges } = res.data;

      // Check if backend awarded any new achievements
      if (newBadges && newBadges.length > 0) {
        toast.success(`Achievement Unlocked: ${newBadges[0].badgeName}! 🏆`);
      }

      // Show real score calculated by your backend
      setResult({
        score: entry.wellnessScore,
        message: entry.burnoutRisk === 'High' || entry.burnoutRisk === 'Critical' 
          ? "It looks like you're at risk of burnout. Please prioritize rest today."
          : entry.wellnessScore > 75 
            ? "You're doing great! Keep up the momentum." 
            : "You're doing okay, but make sure to take breaks."
      });
      setStep(3);
      toast.success('Check-in saved successfully!');
    } catch (error) {
      console.error("Check-in Error:", error);
      toast.error(error.response?.data?.message || 'Failed to save check-in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-2">
          <Activity className="text-[#a78bfa]" /> Daily Wellness Check-in
        </h2>

        {step === 1 && (
          <div className="space-y-6 animation-fadeIn">
            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-3 uppercase tracking-wider">How are you feeling?</label>
              <div className="grid grid-cols-3 gap-3">
                {MOODS.map(m => (
                  <button key={m.label} onClick={() => setFormData({ ...formData, mood: m.label })}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${formData.mood === m.label ? 'border-[#6366f1] bg-[#6366f1]/20' : 'border-[#334155] bg-[#0f172a] hover:border-[#6366f1]/50'}`}>
                    <span className="text-3xl">{m.emoji}</span>
                    <span className="text-sm font-medium text-slate-200">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <button disabled={!formData.mood} onClick={() => setStep(2)} className="w-full py-3 bg-gradient-to-r from-[#6366f1] to-[#a78bfa] rounded-xl font-bold text-white disabled:opacity-50">Next Step</button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={submitCheckIn} className="space-y-6 animation-fadeIn">
            <div className="space-y-4">
              <SliderField icon={<Activity />} label="Stress Level" name="stress" value={formData.stress} max="10" onChange={handleSlider} />
              <SliderField icon={<Battery />} label="Energy Level" name="energy" value={formData.energy} max="10" onChange={handleSlider} />
              <SliderField icon={<Target />} label="Focus Level" name="focus" value={formData.focus} max="10" onChange={handleSlider} />
              {/* Added Motivation Slider for backend compatibility */}
              <SliderField icon={<Brain />} label="Motivation" name="motivation" value={formData.motivation} max="10" onChange={handleSlider} />
              <SliderField icon={<Moon />} label="Sleep (Hours)" name="sleepHours" value={formData.sleepHours} max="12" onChange={handleSlider} />
              <SliderField icon={<BookOpen />} label="Study (Hours)" name="studyHours" value={formData.studyHours} max="16" onChange={handleSlider} />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 border border-[#334155] rounded-xl text-slate-300">Back</button>
              <button type="submit" disabled={loading} className="flex-1 py-3 bg-gradient-to-r from-[#6366f1] to-[#a78bfa] rounded-xl font-bold text-white flex justify-center items-center gap-2">
                {loading ? <><Loader2 className="animate-spin" size={20} /> Saving...</> : 'Save Check-in'}
              </button>
            </div>
          </form>
        )}

        {step === 3 && result && (
          <div className="text-center py-8 animation-fadeIn">
            <div className="w-32 h-32 rounded-full border-8 border-[#16161d] border-t-[#6366f1] border-r-[#a78bfa] flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl font-bold text-slate-100">{result.score}</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-100 mb-2">Check-in Complete!</h3>
            <p className="text-[#94a3b8] mb-8">{result.message}</p>
            <button onClick={() => { setStep(1); setFormData({ ...formData, mood: '' }); }} className="px-8 py-3 bg-[#0f172a] border border-[#334155] rounded-xl text-slate-300 hover:text-white">Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

function SliderField({ icon, label, name, value, max, onChange }) {
  return (
    <div className="bg-[#0f172a] p-4 rounded-xl border border-[#334155]">
      <div className="flex justify-between items-center mb-2">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-300"><span className="text-[#a78bfa]">{icon}</span> {label}</label>
        <span className="text-lg font-bold text-[#6366f1]">{value}</span>
      </div>
      <input type="range" name={name} min="0" max={max} value={value} onChange={onChange} className="w-full h-2 bg-[#1e293b] rounded-lg appearance-none cursor-pointer accent-[#6366f1]" />
    </div>
  );
}