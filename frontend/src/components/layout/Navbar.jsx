import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Sparkles, Plus, Wallet, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ title, onOpenCreateTrip }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 py-3.5 flex items-center justify-between">
      {/* Left Title / Mobile Logo */}
      <div className="flex items-center gap-3">
        <div className="md:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white">
            <Compass className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-navy-900 text-lg">TripMate AI</span>
        </div>
        <h1 className="hidden md:block text-xl font-bold text-navy-900">{title}</h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Currency Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200">
          <Wallet className="w-3.5 h-3.5 text-brand-600" />
          <span>Currency: {user?.currency || '₹'}</span>
        </div>

        {/* AI Travel Assistant Quick Button */}
        <Link
          to="/ai-assistant"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-lg text-xs font-semibold border border-brand-200 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          <span className="hidden sm:inline">AI Advisor</span>
        </Link>

        {/* Quick New Trip Button */}
        <button
          onClick={() => {
            if (onOpenCreateTrip) {
              onOpenCreateTrip();
            } else {
              navigate('/trips?action=create');
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Trip</span>
        </button>

        {/* User Avatar */}
        <Link to="/profile" className="flex items-center">
          <img
            src={
              user?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Traveler')}&background=0ea5e9&color=fff`
            }
            alt={user?.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/20 hover:ring-brand-500 transition-all"
          />
        </Link>
      </div>
    </header>
  );
}

