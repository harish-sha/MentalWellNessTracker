import React, { useState, useEffect } from 'react';
import { Timer, Wind, Play, Pause, RotateCcw } from 'lucide-react';

export default function Tools() {
  const [activeTab, setActiveTab] = useState('pomodoro');

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="flex gap-4 mb-6">
        <button onClick={() => setActiveTab('pomodoro')} className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'pomodoro' ? 'bg-[#6366f1] text-white' : 'bg-[#1e293b] text-[#94a3b8] border border-[#334155]'}`}>
          <Timer /> Pomodoro Focus
        </button>
        <button onClick={() => setActiveTab('breathe')} className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'breathe' ? 'bg-[#a78bfa] text-white' : 'bg-[#1e293b] text-[#94a3b8] border border-[#334155]'}`}>
          <Wind /> Breathe
        </button>
      </div>

      {activeTab === 'pomodoro' ? <PomodoroTimer /> : <BreathingExercise />}
    </div>
  );
}

function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('Focus');

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    else if (timeLeft === 0) {
      setIsActive(false);
      if (mode === 'Focus') { setMode('Break'); setTimeLeft(5 * 60); }
      else { setMode('Focus'); setTimeLeft(25 * 60); }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => { setIsActive(false); setTimeLeft(25 * 60); setMode('Focus'); };

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-12 text-center shadow-xl">
      <h3 className="text-2xl font-bold text-slate-100 mb-2">{mode} Session</h3>
      <p className="text-[#94a3b8] mb-8">Stay focused and eliminate distractions.</p>
      
      <div className="text-8xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a78bfa] mb-12 tabular-nums">
        {mins}:{secs}
      </div>

      <div className="flex justify-center gap-4">
        <button onClick={toggle} className="w-16 h-16 rounded-full bg-[#6366f1] hover:bg-[#4f46e5] flex items-center justify-center text-white shadow-lg transition-all">
          {isActive ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
        </button>
        <button onClick={reset} className="w-16 h-16 rounded-full bg-[#0f172a] border border-[#334155] hover:border-[#94a3b8] flex items-center justify-center text-slate-300 transition-all">
          <RotateCcw size={24} />
        </button>
      </div>
    </div>
  );
}

function BreathingExercise() {
  const [isBreathing, setIsBreathing] = useState(false);
  const [phase, setPhase] = useState('Ready');

  useEffect(() => {
    if (!isBreathing) { setPhase('Ready'); return; }
    
    const breatheCycle = () => {
      setPhase('Inhale...');
      setTimeout(() => {
        if(isBreathing) setPhase('Hold...');
        setTimeout(() => {
          if(isBreathing) setPhase('Exhale...');
        }, 4000); // Hold for 4s
      }, 4000); // Inhale for 4s
    };

    breatheCycle();
    const interval = setInterval(breatheCycle, 14000); // 4 + 4 + 6 cycle
    return () => clearInterval(interval);
  }, [isBreathing]);

  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-12 text-center shadow-xl flex flex-col items-center">
      <h3 className="text-2xl font-bold text-slate-100 mb-2">4-4-6 Breathing</h3>
      <p className="text-[#94a3b8] mb-12">Calm your nervous system before studying.</p>
      
      <div className="relative w-64 h-64 flex items-center justify-center mb-12">
        <div className={`absolute inset-0 rounded-full bg-[#a78bfa] opacity-20 transition-transform duration-[4000ms] ease-in-out ${phase === 'Inhale...' ? 'scale-150' : phase === 'Exhale...' ? 'scale-100' : 'scale-150'}`}></div>
        <div className={`relative z-10 w-48 h-48 rounded-full bg-gradient-to-br from-[#1e293b] to-[#0f172a] border-2 border-[#a78bfa] flex items-center justify-center shadow-2xl`}>
          <span className="text-2xl font-bold text-slate-100">{phase}</span>
        </div>
      </div>

      <button onClick={() => setIsBreathing(!isBreathing)} className="px-8 py-3 bg-[#a78bfa] hover:bg-[#8b5cf6] rounded-xl font-bold text-white transition-all">
        {isBreathing ? 'Stop Exercise' : 'Start Breathing'}
      </button>
    </div>
  );
}