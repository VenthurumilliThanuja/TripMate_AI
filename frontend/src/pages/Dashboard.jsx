import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Wallet,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Plus,
  Sparkles,
  MapPin,
  Calendar,
  Users,
  ArrowRight,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import TripFormModal from '../components/trips/TripFormModal';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const CHART_COLORS = ['#0EA5E9', '#14B8A6', '#F59E0B', '#8B5CF6', '#EC4899', '#10B981'];

export default function Dashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [friends, setFriends] = useState([]);
  const [isCreateTripOpen, setIsCreateTripOpen] = useState(false);

  const currency = user?.currency || '₹';

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [sumRes, friendsRes] = await Promise.all([
        api.get('/trips/dashboard/summary'),
        api.get('/friends'),
      ]);

      if (sumRes.data.success) {
        setSummary(sumRes.data.data);
      }
      if (friendsRes.data.success) {
        setFriends(friendsRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateTrip = async (tripData) => {
    try {
      const res = await api.post('/trips', tripData);
      if (res.data.success) {
        showToast('Trip folder created successfully!', 'success');
        fetchDashboardData();
        navigate(`/trips/${res.data.data._id}`);
      }
    } catch (error) {
      showToast(error.message || 'Failed to create trip.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-semibold">Loading your travel analytics...</p>
        </div>
      </div>
    );
  }

  const {
    totalTrips = 0,
    totalPlannedBudget = 0,
    totalSpent = 0,
    totalRemaining = 0,
    isOverbudget = false,
    overspentAmount = 0,
    upcomingTrips = [],
    recentExpenses = [],
    categoryBreakdown = [],
  } = summary || {};

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="space-y-8">
      {/* 1. Welcome Banner & Quick Action Buttons */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 rounded-3xl p-6 md:p-8 text-white shadow-elevated relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>AI Travel Assistant Online</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Hi, {user?.name?.split(' ')[0] || 'Traveler'}! ✈️
          </h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Ready to explore? You have <span className="font-bold text-white">{totalTrips} active trip folders</span>{' '}
            and {currency}{Math.max(0, totalRemaining).toLocaleString()} remaining in your collective travel budget.
          </p>
        </div>

        {/* Quick Action Badges */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsCreateTripOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-brand-500 to-teal-500 hover:from-brand-600 hover:to-teal-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Trip</span>
          </button>

          <Link
            to="/ai-assistant"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs backdrop-blur-md border border-white/10 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-brand-300" />
            <span>AI Budget Advisor</span>
          </Link>
        </div>
      </div>

      {/* 2. Top Analytics Metrics Cards (Section 3 Requirement) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <StatCard
          title="Total Trips Created"
          value={totalTrips}
          subtext="Active & planned trip folders"
          icon={Compass}
          colorScheme="navy"
        />

        <StatCard
          title="Planned Total Budget"
          value={`${currency}${totalPlannedBudget.toLocaleString()}`}
          subtext="Total allocated target funds"
          icon={Wallet}
          colorScheme="brand"
        />

        <StatCard
          title="Actual Money Spent"
          value={`${currency}${totalSpent.toLocaleString()}`}
          subtext={`${totalPlannedBudget > 0 ? Math.round((totalSpent / totalPlannedBudget) * 100) : 0}% of budget utilized`}
          icon={TrendingDown}
          colorScheme={isOverbudget ? 'rose' : 'brand'}
        />

        {isOverbudget ? (
          <StatCard
            title="Budget Exceeded"
            value={`+${currency}${overspentAmount.toLocaleString()}`}
            subtext="Over budget threshold"
            icon={AlertCircle}
            colorScheme="rose"
            trend={{ isPositive: false, label: 'Exceeded budget target' }}
          />
        ) : (
          <StatCard
            title="Money Remaining"
            value={`${currency}${totalRemaining.toLocaleString()}`}
            subtext="Available safe balance"
            icon={CheckCircle2}
            colorScheme="emerald"
            trend={{ isPositive: true, label: 'Within safe limits' }}
          />
        )}
      </div>

      {/* 3. Middle Section: Upcoming Trips & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Trips List (2 cols on large) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-soft p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-navy-900">Upcoming Trips</h3>
              <p className="text-xs text-slate-400">Your planned group excursions.</p>
            </div>
            <Link
              to="/trips"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingTrips.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Compass className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No trips planned yet</p>
              <button
                onClick={() => setIsCreateTripOpen(true)}
                className="mt-3 px-3.5 py-1.5 bg-navy-900 text-white rounded-lg text-xs font-bold"
              >
                Create First Trip Folder
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {upcomingTrips.map((trip) => {
                const tripSpent = trip.totalSpent || 0;
                const tripBudget = trip.totalBudget || 0;
                const tripRem = tripBudget - tripSpent;
                const tripOver = tripSpent > tripBudget;

                return (
                  <Link
                    key={trip._id}
                    to={`/trips/${trip._id}`}
                    className="group rounded-xl border border-slate-200/80 p-4 hover:border-brand-300 hover:shadow-card transition-all flex flex-col justify-between bg-slate-50/50 hover:bg-white"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 font-medium">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span className="truncate">{trip.destination}</span>
                        </span>
                        <span>{trip.numTravelers || 1} Travelers</span>
                      </div>

                      <h4 className="text-sm font-extrabold text-navy-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
                        {trip.title}
                      </h4>

                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                        </span>
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-semibold">Budget: {currency}{tripBudget.toLocaleString()}</span>
                      <span
                        className={`font-bold ${
                          tripOver ? 'text-rose-600' : 'text-emerald-700'
                        }`}
                      >
                        {tripOver ? `+${currency}${(tripSpent - tripBudget).toLocaleString()} over` : `${currency}${tripRem.toLocaleString()} left`}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Global Category Spending Chart (1 col on large) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-navy-900">Spending by Category</h3>
            <p className="text-xs text-slate-400 mb-4">Total expenditure across all journeys.</p>

            {categoryBreakdown.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-xs text-slate-400 text-center">
                No recorded expenditures yet. Add expenses in trip folders to see breakdown.
              </div>
            ) : (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => `${currency}${val.toLocaleString()}`}
                      contentStyle={{
                        backgroundColor: '#0B132B',
                        borderRadius: '10px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '11px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Category Legends */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600">
            {categoryBreakdown.slice(0, 4).map((c, i) => (
              <div key={c.name} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                />
                <span>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Recent Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden">
        <div className="px-6 py-4.5 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-navy-900">Recent Group Expenses</h3>
            <p className="text-xs text-slate-400">Latest recorded transactions across trips.</p>
          </div>

          <Link
            to="/trips"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>Go to Trip Folders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {recentExpenses.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No recent transactions recorded yet.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Description</th>
                  <th className="py-3 px-6">Trip</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">Payer</th>
                  <th className="py-3 px-6 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recentExpenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-slate-600 whitespace-nowrap">
                      {formatDate(expense.date)}
                    </td>
                    <td className="py-3.5 px-6 font-bold text-navy-900">{expense.title}</td>
                    <td className="py-3.5 px-6 text-slate-600 font-medium">
                      {expense.tripId?.title || 'Trip'}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {expense.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">{expense.payer?.name || 'You'}</td>
                    <td className="py-3.5 px-6 text-right font-extrabold text-navy-900">
                      {currency}{expense.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal for Creating New Trip Folder */}
      <TripFormModal
        isOpen={isCreateTripOpen}
        onClose={() => setIsCreateTripOpen(false)}
        onSubmit={handleCreateTrip}
        availableFriends={friends}
        currency={currency}
      />
    </div>
  );
}

