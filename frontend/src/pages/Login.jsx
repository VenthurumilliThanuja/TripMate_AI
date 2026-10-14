import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Mail, Lock, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      navigate('/');
    }
  };

  const handleFillDemo = () => {
    setEmail('demo@tripmate.ai');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Form Section */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20 xl:px-28 z-10">
        <div className="w-full max-w-md mx-auto">
          {/* Logo Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-500 to-teal-400 flex items-center justify-center shadow-lg shadow-brand-500/25">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black text-navy-900 tracking-tight">
                TripMate <span className="text-brand-500">AI</span>
              </span>
              <p className="text-xs text-slate-500 font-medium">Smart Travel & Expense Planner</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-navy-900 tracking-tight">Welcome back</h2>
            <p className="text-sm text-slate-500 mt-1">
              Log in to manage your group trips, track budgets, and explore itineraries.
            </p>
          </div>

          {/* Quick Demo Fill Button */}
          <div className="mb-6 p-3.5 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-between">
            <div className="text-xs text-brand-900">
              <span className="font-bold block">Quick Demo Account:</span>
              <span className="text-brand-700">demo@tripmate.ai / password123</span>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fill Demo</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-navy-900 hover:bg-brand-600 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 group mt-2"
            >
              <span>{loading ? 'Logging in...' : 'Sign In to TripMate'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-6">
            Don't have an account yet?{' '}
            <Link to="/signup" className="font-bold text-brand-600 hover:text-brand-700">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Right Visual Section (Hidden on small screens) */}
      <div className="hidden lg:flex flex-1 relative bg-navy-900 overflow-hidden text-white p-12 flex-col justify-between">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80"
            alt="Travel Adventure"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/60 to-transparent" />
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs font-bold text-brand-300 uppercase tracking-widest">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>AI-Powered Travel Intelligence</span>
        </div>

        <div className="relative z-10 max-w-lg space-y-4">
          <h3 className="text-3xl font-extrabold leading-tight">
            Plan Group Trips Without Budget Headaches
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            From smart expense settlement and category tracking to day-by-day itineraries and music
            soundtracks, TripMate AI keeps your travel group perfectly synced.
          </p>

          <div className="pt-4 grid grid-cols-2 gap-3 text-xs font-semibold text-slate-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <span>Real-time Remaining Budget</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <span>Debt Minimization Splits</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <span>AI Day-wise Itineraries</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <span>Group Games & Playlists</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400">
          TripMate AI © 2026. Built with modern full-stack web standards.
        </div>
      </div>
    </div>
  );
}

