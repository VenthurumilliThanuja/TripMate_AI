import React from 'react';
import { NavLink } from 'react-router-dom';
import { TrendingUp, Compass, Users, Sparkles, User } from 'lucide-react';

export default function MobileNav() {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: TrendingUp },
    { name: 'Trips', path: '/trips', icon: Compass },
    { name: 'Advisor', path: '/ai-assistant', icon: Sparkles },
    { name: 'Circle', path: '/friends', icon: Users },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex justify-around items-center shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[11px] font-medium transition-colors ${
                isActive ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span>{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

