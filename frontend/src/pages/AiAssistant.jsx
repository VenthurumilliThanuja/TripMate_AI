import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Wallet,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Calendar,
  Compass,
  CheckCircle2,
  RefreshCw,
  Info,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AiAssistant() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeMode, setActiveMode] = useState('budget'); // 'budget' | 'planner' | 'games'
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [loading, setLoading] = useState(false);
  const [budgetAdvice, setBudgetAdvice] = useState(null);

  // Manual query states
  const [manualQuery, setManualQuery] = useState({
    budget: 15000,
    spent: 9000,
    destination: 'Goa',
    durationDays: 3,
    numTravelers: 4,
    travelStyle: 'Moderate',
  });

  // Planner states
  const [plannerData, setPlannerData] = useState({
    destination: 'Goa, India',
    durationDays: 3,
    budget: 18000,
    numTravelers: 4,
    preferredPace: 'Moderate',
    transportation: 'Cab & Walking',
    interests: 'Sightseeing, Seafood, Sunsets, Adventure',
  });
  const [generatedPlan, setGeneratedPlan] = useState(null);

  const currency = user?.currency || '₹';

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await api.get('/trips');
        if (res.data.success) {
          setTrips(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedTripId(res.data.data[0]._id);
          }
        }
      } catch (e) {
        console.error('Failed to load trips for advisor:', e);
      }
    };
    fetchTrips();
  }, []);

  // Run budget analysis for selected trip or manual numbers
  const handleAnalyzeBudget = async () => {
    try {
      setLoading(true);
      let payload = {};

      if (selectedTripId) {
        payload = { tripId: selectedTripId };
      } else {
        payload = {
          totalBudget: manualQuery.budget,
          totalSpent: manualQuery.spent,
          destination: manualQuery.destination,
          durationDays: manualQuery.durationDays,
          numTravelers: manualQuery.numTravelers,
          travelStyle: manualQuery.travelStyle,
        };
      }

      const res = await api.post('/ai/budget-advisor', payload);
      if (res.data.success) {
        setBudgetAdvice(res.data.data);
        showToast('AI Budget Evaluation complete!', 'success');
      }
    } catch (error) {
      showToast('AI Budget Advisor request failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Run standalone AI Itinerary Planner
  const handleGenerateItinerary = async () => {
    try {
      setLoading(true);
      const res = await api.post('/ai/generate-itinerary', {
        ...plannerData,
        interests: plannerData.interests.split(',').map((s) => s.trim()),
      });
      if (res.data.success) {
        setGeneratedPlan(res.data.data);
        showToast('AI Day-wise Itinerary generated!', 'success');
      }
    } catch (error) {
      showToast('Failed to generate itinerary.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 rounded-3xl p-6 md:p-8 text-white shadow-elevated flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>AI Travel Intelligence Co-Pilot</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            AI Travel & Budget Advisor
          </h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Diagnose spending burn-rates, calculate safe daily allowances, generate day-wise schedules,
            and keep your travel companions on budget.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2 bg-navy-950/60 p-1.5 rounded-2xl border border-navy-700/60 self-start md:self-auto">
          <button
            onClick={() => setActiveMode('budget')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === 'budget'
                ? 'bg-brand-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Budget Advisor
          </button>
          <button
            onClick={() => setActiveMode('planner')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === 'planner'
                ? 'bg-brand-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Itinerary Planner
          </button>
        </div>
      </div>

      {/* 1. BUDGET ADVISOR MODE */}
      {activeMode === 'budget' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Column (1 col) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-soft space-y-5">
            <h3 className="text-sm font-extrabold text-navy-900">Select Trip Data Source</h3>

            {/* Select existing trip */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Choose an Existing Trip
              </label>
              <select
                value={selectedTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">-- Custom Simulation Query --</option>
                {trips.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.title} ({t.destination})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                {selectedTripId
                  ? 'Uses exact live expenses and planned targets from your database.'
                  : 'Allows entering hypothetical budget scenario.'}
              </p>
            </div>

            {/* Custom simulation inputs when no trip is selected */}
            {!selectedTripId && (
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Scenario Parameters
                </span>

                <div>
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">
                    Destination
                  </label>
                  <input
                    type="text"
                    value={manualQuery.destination}
                    onChange={(e) =>
                      setManualQuery({ ...manualQuery, destination: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 font-semibold block mb-1">
                      Total Budget ({currency})
                    </label>
                    <input
                      type="number"
                      value={manualQuery.budget}
                      onChange={(e) =>
                        setManualQuery({ ...manualQuery, budget: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-semibold block mb-1">
                      Total Spent ({currency})
                    </label>
                    <input
                      type="number"
                      value={manualQuery.spent}
                      onChange={(e) =>
                        setManualQuery({ ...manualQuery, spent: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 font-semibold block mb-1">
                      Days Left
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={manualQuery.durationDays}
                      onChange={(e) =>
                        setManualQuery({ ...manualQuery, durationDays: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-semibold block mb-1">
                      Travelers
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={manualQuery.numTravelers}
                      onChange={(e) =>
                        setManualQuery({ ...manualQuery, numTravelers: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleAnalyzeBudget}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Analyzing Budget Metrics...' : 'Evaluate Trip Budget'}</span>
            </button>
          </div>

          {/* Results Column (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {!budgetAdvice ? (
              <div className="bg-white p-16 text-center rounded-2xl border border-dashed border-slate-200 shadow-soft">
                <Sparkles className="w-10 h-10 text-brand-400 mx-auto mb-3" />
                <h4 className="text-base font-bold text-navy-900">
                  Ready to Diagnose Your Travel Finances
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Click "Evaluate Trip Budget" to generate safe daily spending limits, pinpoint
                  overspending categories, and receive practical cost-reduction tips.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* 1. Evaluation Summary Banner */}
                <div
                  className={`p-6 rounded-2xl border shadow-soft ${
                    budgetAdvice.isOverbudget
                      ? 'bg-rose-50/70 border-rose-200'
                      : budgetAdvice.percentSpent > 80
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-emerald-50/70 border-emerald-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${
                            budgetAdvice.isOverbudget
                              ? 'bg-rose-600 text-white'
                              : budgetAdvice.percentSpent > 80
                              ? 'bg-amber-600 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          Budget Status: {budgetAdvice.realisticBudgetRating || 'Realistic'}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">
                          ({budgetAdvice.percentSpent}% utilized)
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 leading-relaxed pt-1">
                        {budgetAdvice.summary}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0 bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-slate-200/60 shadow-sm">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Safe Daily Limit
                      </span>
                      <span className="text-xl font-black text-navy-900">
                        {currency}{budgetAdvice.safeDailyLimit?.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        for remaining {budgetAdvice.daysLeft} days
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Category Alerts (if any overspending detected) */}
                {budgetAdvice.categoryAlerts && budgetAdvice.categoryAlerts.length > 0 && (
                  <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-soft space-y-3">
                    <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span>Overspending Alerts Detected</span>
                    </h4>
                    <div className="space-y-2">
                      {budgetAdvice.categoryAlerts.map((ca, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-xl bg-rose-50/50 text-xs text-rose-900 border border-rose-100"
                        >
                          <span className="font-bold">{ca.category}</span>
                          <span>{ca.warning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Actionable Tips */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-soft space-y-3">
                  <h4 className="text-sm font-extrabold text-navy-900 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>Actionable Ways to Stay on Budget</span>
                  </h4>
                  <div className="space-y-2">
                    {(budgetAdvice.actionableTips || []).map((tip, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 text-xs text-slate-700 leading-relaxed border border-slate-100"
                      >
                        <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Verification Note */}
                <div className="p-3 rounded-xl bg-slate-100 text-slate-500 text-[11px] flex items-center gap-2">
                  <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>
                    Note: Projections and daily limits are calculated estimates grounded in your
                    database records. They do not overwrite your verified expenses.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. ITINERARY PLANNER MODE */}
      {activeMode === 'planner' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Planner Inputs */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-soft space-y-4">
            <h3 className="text-sm font-extrabold text-navy-900">Custom Itinerary Generator</h3>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Destination
              </label>
              <input
                type="text"
                value={plannerData.destination}
                onChange={(e) => setPlannerData({ ...plannerData, destination: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Trip Days
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={plannerData.durationDays}
                  onChange={(e) =>
                    setPlannerData({ ...plannerData, durationDays: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Group Size
                </label>
                <input
                  type="number"
                  min="1"
                  value={plannerData.numTravelers}
                  onChange={(e) =>
                    setPlannerData({ ...plannerData, numTravelers: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Budget ({currency})
              </label>
              <input
                type="number"
                value={plannerData.budget}
                onChange={(e) =>
                  setPlannerData({ ...plannerData, budget: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Interests & Vibes
              </label>
              <input
                type="text"
                value={plannerData.interests}
                onChange={(e) => setPlannerData({ ...plannerData, interests: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <button
              onClick={handleGenerateItinerary}
              disabled={loading}
              className="w-full py-3 bg-navy-900 hover:bg-brand-600 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Building Days...' : 'Generate Itinerary'}</span>
            </button>
          </div>

          {/* Planner Output */}
          <div className="lg:col-span-2 space-y-4">
            {!generatedPlan ? (
              <div className="bg-white p-16 text-center rounded-2xl border border-dashed border-slate-200 shadow-soft">
                <Calendar className="w-10 h-10 text-brand-400 mx-auto mb-3" />
                <h4 className="text-base font-bold text-navy-900">
                  Generate Tailored Day-wise Activities
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Click "Generate Itinerary" to produce custom morning, afternoon, and evening
                  schedules complete with budget estimates and alternatives.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[650px] overflow-y-auto pr-1">
                {generatedPlan.map((day) => (
                  <div
                    key={day.dayNumber}
                    className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-soft space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="text-sm font-extrabold text-navy-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-brand-500 text-white text-xs flex items-center justify-center font-bold">
                          {day.dayNumber}
                        </span>
                        <span>{day.theme || `Day ${day.dayNumber}`}</span>
                      </h4>
                      <span className="text-xs text-slate-400 font-semibold">
                        {day.activities?.length || 0} Events
                      </span>
                    </div>

                    <div className="space-y-2">
                      {(day.activities || []).map((act, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between font-bold text-slate-800">
                            <span className="text-brand-600 font-bold uppercase text-[10px]">
                              [{act.timeSlot} • {act.time}]
                            </span>
                            <span className="text-navy-900">
                              {act.estimatedCost > 0 ? `${currency}${act.estimatedCost}` : 'Free'}
                            </span>
                          </div>
                          <p className="font-bold text-navy-900">{act.title}</p>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            {act.description}
                          </p>
                          {act.budgetAlternative && (
                            <p className="text-[10px] text-amber-700 bg-amber-50/70 p-1.5 rounded mt-1">
                              💡 Budget Alt: {act.budgetAlternative}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

