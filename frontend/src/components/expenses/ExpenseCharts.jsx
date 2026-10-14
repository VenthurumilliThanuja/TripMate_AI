import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#0EA5E9', '#14B8A6', '#F59E0B', '#8B5CF6', '#EC4899', '#10B981', '#64748B'];

export default function ExpenseCharts({ categorySummary = [], currency = '₹' }) {
  // Format data for Pie Chart
  const pieData = categorySummary
    .filter((c) => c.actualSpent > 0)
    .map((c) => ({
      name: c.category,
      value: c.actualSpent,
    }));

  // Format data for Bar Chart
  const barData = categorySummary.map((c) => ({
    category: c.category,
    Planned: c.plannedAmount,
    Spent: c.actualSpent,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-navy-900 text-white p-3 rounded-xl shadow-lg text-xs border border-navy-700">
          <p className="font-bold mb-1 text-slate-200">{label || payload[0]?.name}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} className="font-semibold" style={{ color: entry.color || entry.fill }}>
              {entry.name}: {currency}{entry.value?.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (categorySummary.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
        No expense data available for visualization yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Category Spending Share (Pie Chart) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-soft">
        <h4 className="text-sm font-bold text-navy-900 mb-1">Expense Breakdown by Category</h4>
        <p className="text-xs text-slate-400 mb-4">Share of total spent funds across categories.</p>

        {pieData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-xs text-slate-400">
            Record expenses to see category proportions.
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 2. Planned vs Actual Bar Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-soft">
        <h4 className="text-sm font-bold text-navy-900 mb-1">Planned Budget vs Actual Spent</h4>
        <p className="text-xs text-slate-400 mb-4">
          Compare budget target limits against reality per category.
        </p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              <Bar dataKey="Planned" fill="#94A3B8" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="Spent" fill="#0EA5E9" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

