import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Users,
  Sparkles,
  User,
  LogOut,
  PlusCircle,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ onOpenCreateTrip }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: TrendingUp },
    { name: 'My Trips', path: '/trips', icon: Compass },
    { name: 'Travel Circle', path: '/friends', icon: Users },
    { name: 'AI Travel Advisor', path: '/ai-assistant', icon: Sparkles },
    { name: 'Profile & Settings', path: '/profile', icon: User },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-navy-900 text-white min-h-screen border-r border-navy-800 flex-shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-navy-800">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-teal-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
          <Compass className="w-6 h-6 text-white animate-spin-slow" />
        </div>
        <div>
          <div className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-brand-300 bg-clip-text text-transparent">
            TripMate <span className="text-accent-400">AI</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Smart Travel & Expenses</p>
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="px-4 pt-5 pb-2">
        <button
          onClick={() => {
            if (onOpenCreateTrip) {
              onOpenCreateTrip();
            } else {
              navigate('/trips?action=create');
            }
          }}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-brand-500 to-teal-500 hover:from-brand-600 hover:to-teal-600 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Trip Folder</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30 font-semibold'
                    : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-navy-800 bg-navy-900/60">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-navy-800/80 border border-navy-700/60">
          <img
            src={
              user?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Traveler')}&background=0ea5e9&color=fff`
            }
            alt={user?.name}
            className="w-9 h-9 rounded-lg object-cover border border-brand-400/40"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.currency || '₹'} Account</p>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-navy-700 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

