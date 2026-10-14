import React from 'react';

export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  colorScheme = 'brand',
}) {
  const schemeStyles = {
    brand: {
      bg: 'bg-brand-50 text-brand-600',
      border: 'border-slate-100',
      valueColor: 'text-navy-900',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100',
      valueColor: 'text-emerald-700',
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      border: 'border-rose-100',
      valueColor: 'text-rose-700',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100',
      valueColor: 'text-amber-800',
    },
    navy: {
      bg: 'bg-navy-800 text-brand-300',
      border: 'border-slate-100',
      valueColor: 'text-navy-900',
    },
  };

  const currentScheme = schemeStyles[colorScheme] || schemeStyles.brand;

  return (
    <div
      className={`p-5 rounded-2xl bg-white border ${currentScheme.border} shadow-soft hover:shadow-card transition-all duration-200 flex flex-col justify-between`}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentScheme.bg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className={`text-2xl font-extrabold tracking-tight ${currentScheme.valueColor}`}>
          {value}
        </div>
        {subtext && <p className="text-xs text-slate-500 mt-1 font-medium">{subtext}</p>}
      </div>

      {trend && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center text-xs font-semibold">
          <span className={trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}>
            {trend.label}
          </span>
        </div>
      )}
    </div>
  );
}

