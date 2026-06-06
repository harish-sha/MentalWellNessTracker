import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardCheck, BarChart3,
  Wrench, MessageCircle, User, LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/checkin', icon: ClipboardCheck, label: 'Check-In' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/tools', icon: Wrench, label: 'Tools' },
  { to: '/coach', icon: MessageCircle, label: 'AI Coach' },
  { to: '/profile', icon: User, label: 'Profile' }
];

export default function Layout() {
  const navigate = useNavigate();
  
  // Mock user data since authentication is removed
  const [user] = useState({
    name: "Demo Student",
    examType: "NEET Aspirant"
  });

  const handleLogout = () => {
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'MG';

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col font-sans">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#1e293b] border-b border-[#334155] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Brand (Left) */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md"
                style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)' }}>
                🧠
              </div>
              <div className="hidden sm:block">
                <div className="font-display font-bold text-lg text-slate-100 leading-tight">MindGuard</div>
                <div className="text-[10px] text-[#94a3b8] tracking-widest uppercase">AI Wellness</div>
              </div>
            </div>

            {/* Navigation Links (Center) */}
            <nav className="flex items-center gap-1 md:gap-2 overflow-x-auto no-scrollbar mx-4">
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? 'bg-[#6366f1]/15 text-[#a78bfa] border border-[#6366f1]/30'
                        : 'text-[#94a3b8] hover:text-slate-200 hover:bg-[#0f172a]'
                    }`
                  }
                >
                  <Icon size={18} />
                  <span className="hidden md:block">{label}</span>
                </NavLink>
              ))}
            </nav>

            {/* User Profile & Logout (Right) */}
            <div className="flex items-center gap-4 shrink-0 border-l border-[#334155] pl-4">
              <div className="hidden lg:block text-right">
                <div className="text-sm font-medium text-slate-200 truncate">{user?.name}</div>
                <div className="text-xs text-[#94a3b8] truncate">{user?.examType}</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#6366f1]/20 border border-[#6366f1]/30 flex items-center justify-center text-sm font-bold text-[#a78bfa]">
                {initials}
              </div>
              {/* <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 rounded-xl text-[#94a3b8] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
              >
                <LogOut size={20} />
              </button> */}
            </div>

          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 page-enter">
          <Outlet />
        </div>
      </main>
      
    </div>
  );
}