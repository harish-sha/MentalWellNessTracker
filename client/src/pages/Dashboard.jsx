import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, CheckSquare, Timer, Wind, Award, MessageSquare,
  TrendingUp, Brain, Zap, Moon, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { entriesAPI, aiAPI } from '../services/api'; // Make sure this path is correct

export default function Dashboard() {
  const [stats, setStats] = useState({
    streak: 0,
    wellnessScore: 0,
    studyHours: 0,
    sleepHours: 0
  });
  const [aiSummary, setAiSummary] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 🚀 Fetch real user stats from backend
        const statsRes = await entriesAPI.getStats(7);
        
        if (statsRes.data.success && statsRes.data.stats) {
          const s = statsRes.data.stats;
          setStats({
            streak: s.streak || 0,
            wellnessScore: s.avgWellness || 0,
            studyHours: s.avgStudy || 0,
            sleepHours: s.avgSleep || 0
          });

          // Fetch Gemini AI weekly summary based on the retrieved entries
          if (s.entries && s.entries.length > 0) {
            const aiRes = await aiAPI.getDailySummary({ entries: s.entries });
            setAiSummary(aiRes.data.summary || "You're doing great, keep logging your data!");
          } else {
            setAiSummary("Start logging your daily check-ins so I can generate insights for you!");
          }
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        setAiSummary("Could not load insights at this time. Please make sure you are logged in.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="flex h-screen bg-[#0f172a] overflow-hidden">
      
      {/* Main Content Area (Layout wrapper handles sidebar now, but kept your code structure) */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Your Overview Dashboard</h1>
            <p className="text-[#94a3b8] mt-1">Here is your wellness data from the last 7 days.</p>
          </div>
          <Link to="/checkin" className="bg-gradient-to-br from-[#6366f1] to-[#a78bfa] px-5 py-2.5 rounded-xl font-medium text-white hover:opacity-90 transition-all shadow-lg hover:-translate-y-0.5">
            + New Check-in
          </Link>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-[#6366f1] mb-4" size={48} />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                icon={<TrendingUp className="text-emerald-400" />} 
                label="Current Streak" 
                value={`${stats.streak} Days`} 
              />
              <StatCard 
                icon={<Brain className="text-[#a78bfa]" />} 
                label="Avg Wellness" 
                value={`${stats.wellnessScore}/100`} 
              />
              <StatCard 
                icon={<Zap className="text-amber-400" />} 
                label="Avg Study Focus" 
                value={`${stats.studyHours}h / day`} 
              />
              <StatCard 
                icon={<Moon className="text-blue-400" />} 
                label="Avg Sleep" 
                value={`${stats.sleepHours}h / night`} 
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Chart Area Placeholder */}
              <div className="lg:col-span-2 bg-[#1e293b] border border-[#334155] rounded-2xl p-6 h-80 flex flex-col justify-between shadow-xl">
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">Activity Overview</h3>
                  <p className="text-sm text-[#94a3b8]">You can integrate a library like Recharts here later to plot the entries array.</p>
                </div>
                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-[#334155] rounded-xl mt-4 bg-[#16161d]">
                  <p className="text-[#94a3b8]">Chart Visualization Ready</p>
                </div>
              </div>

              {/* AI Insights Panel */}
              <div className="bg-gradient-to-b from-[#1e293b] to-[#16161d] border border-[#334155] rounded-2xl p-6 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#6366f1] opacity-10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#6366f1]/20 p-2 rounded-lg text-[#a78bfa]">
                    <MessageSquare size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-100">Weekly AI Summary</h3>
                </div>
                
                <p className="text-sm text-slate-300 leading-relaxed mb-6 whitespace-pre-wrap">
                  {aiSummary}
                </p>

                <Link to="/coach" className="block w-full py-2.5 rounded-xl border border-[#334155] bg-[#0f172a] text-center text-sm font-medium text-slate-300 hover:text-white hover:border-[#6366f1] transition-all">
                  Chat with AI Coach
                </Link>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// Helper Component for Dashboard Stats
function StatCard({ icon, label, value }) {
  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-5 hover:border-[#6366f1]/50 transition-colors shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div className="bg-[#0f172a] p-2.5 rounded-xl border border-[#334155]">
          {icon}
        </div>
      </div>
      <div>
        <h4 className="text-[#94a3b8] text-sm font-medium mb-1">{label}</h4>
        <div className="text-2xl font-bold text-slate-100">{value}</div>
      </div>
    </div>
  );
}