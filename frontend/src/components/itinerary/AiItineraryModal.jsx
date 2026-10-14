import React, { useState } from 'react';
import Modal from '../common/Modal';
import {
  Sparkles,
  RefreshCw,
  Calendar,
  Clock,
  MapPin,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';

export default function AiItineraryModal({
  isOpen,
  onClose,
  tripId,
  trip,
  currency = '₹',
  onItinerarySaved,
}) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatedDays, setGeneratedDays] = useState([]);
  const [replaceExisting, setReplaceExisting] = useState(true);

  const [plannerParams, setPlannerParams] = useState({
    destination: trip?.destination || '',
    durationDays: trip?.durationDays || 3,
    budget: trip?.totalBudget || 15000,
    numTravelers: trip?.numTravelers || 2,
    interests: ['Sightseeing', 'Food', 'Culture', 'Scenic Views'],
    preferredPace: 'Moderate',
    transportation: 'Cab & Walking',
  });

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const res = await api.post('/ai/generate-itinerary', plannerParams);
      if (res.data.success && res.data.data) {
        setGeneratedDays(res.data.data);
        showToast(`AI constructed ${res.data.data.length}-day itinerary!`, 'success');
      }
    } catch (error) {
      showToast(error.message || 'Itinerary generation failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToTrip = async () => {
    if (generatedDays.length === 0) return;

    try {
      setSaving(true);
      const res = await api.post('/itineraries/batch', {
        tripId,
        days: generatedDays,
        replaceExisting,
      });

      if (res.data.success) {
        showToast(res.data.message || 'Itinerary applied to trip!', 'success');
        if (onItinerarySaved) onItinerarySaved();
        onClose();
      }
    } catch (error) {
      showToast('Failed to apply itinerary to trip.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Day-wise Trip Planner"
      subtitle={`Generate a complete day-by-day plan for ${plannerParams.destination}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-5">
        {/* Planner Settings */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Pace
            </label>
            <select
              value={plannerParams.preferredPace}
              onChange={(e) =>
                setPlannerParams({ ...plannerParams, preferredPace: e.target.value })
              }
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
            >
              <option value="Relaxed">Relaxed (Ample rest)</option>
              <option value="Moderate">Moderate (Balanced)</option>
              <option value="Fast-paced">Fast-paced (Action packed)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Transport
            </label>
            <select
              value={plannerParams.transportation}
              onChange={(e) =>
                setPlannerParams({ ...plannerParams, transportation: e.target.value })
              }
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
            >
              <option value="Cab & Walking">Cab & Walking</option>
              <option value="Public Transit">Public Transit / Metro</option>
              <option value="Self Drive / Scooter">Self-Drive / Scooter</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-2 px-3 bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{loading ? 'Planning Days...' : 'Generate Plan'}</span>
            </button>
          </div>
        </div>

        {/* Generated Itinerary Preview */}
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-navy-900">
              Generating day-wise itinerary for {plannerParams.destination}...
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Balancing morning heritage, culinary feasts, and sunset downtime.
            </p>
          </div>
        ) : generatedDays.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
            <Sparkles className="w-7 h-7 text-brand-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">
              Click "Generate Plan" above to view custom day-by-day morning, afternoon, and evening recommendations.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {generatedDays.map((day) => (
              <div
                key={day.dayNumber}
                className="p-4 rounded-xl border border-slate-200 bg-white shadow-soft space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-extrabold text-navy-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-brand-500 text-white text-xs flex items-center justify-center font-bold">
                      {day.dayNumber}
                    </span>
                    <span>{day.theme || `Day ${day.dayNumber}`}</span>
                  </h4>
                  <span className="text-xs text-slate-400 font-semibold">
                    {day.activities?.length || 0} Scheduled Activities
                  </span>
                </div>

                <div className="space-y-2">
                  {day.activities.map((act, aIdx) => (
                    <div
                      key={aIdx}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span className="text-brand-600 font-bold uppercase text-[10px] tracking-wider">
                          [{act.timeSlot} • {act.time}]
                        </span>
                        <span className="text-navy-900">
                          {act.estimatedCost > 0 ? `${currency}${act.estimatedCost}` : 'Free'}
                        </span>
                      </div>
                      <p className="font-bold text-navy-900">{act.title}</p>
                      <p className="text-slate-500 text-[11px] leading-relaxed">{act.description}</p>
                      {act.budgetAlternative && (
                        <p className="text-[10px] text-amber-700 bg-amber-50/70 p-1 rounded">
                          💡 Alternative: {act.budgetAlternative}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer with replace/append toggle & save button */}
        {generatedDays.length > 0 && (
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-600 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={replaceExisting}
                onChange={(e) => setReplaceExisting(e.target.checked)}
                className="rounded text-brand-600 focus:ring-brand-500"
              />
              <span>Replace existing trip itinerary activities</span>
            </label>

            <div className="flex items-center gap-2.5 self-end sm:self-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveToTrip}
                disabled={saving}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-navy-900 hover:bg-brand-600 transition-all shadow-sm"
              >
                {saving ? 'Applying...' : 'Save Itinerary to Trip'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

