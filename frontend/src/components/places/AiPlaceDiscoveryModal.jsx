import React, { useState } from 'react';
import Modal from '../common/Modal';
import {
  Sparkles,
  MapPin,
  Clock,
  DollarSign,
  Check,
  RefreshCw,
  ExternalLink,
  Info,
} from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';

export default function AiPlaceDiscoveryModal({
  isOpen,
  onClose,
  tripId,
  destination = '',
  travelStyle = 'Moderate',
  currency = '₹',
  onPlacesAdded,
}) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [suggestedPlaces, setSuggestedPlaces] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [interests, setInterests] = useState(['Culture', 'Food', 'Scenery']);

  const interestOptions = [
    'Beaches',
    'Culture',
    'Food',
    'Scenery',
    'Adventure',
    'Nightlife',
    'Shopping',
    'Hidden Gems',
  ];

  const toggleInterest = (tag) => {
    if (interests.includes(tag)) {
      setInterests(interests.filter((i) => i !== tag));
    } else {
      setInterests([...interests, tag]);
    }
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const res = await api.post('/ai/suggest-places', {
        destination,
        travelStyle,
        interests,
      });

      if (res.data.success && res.data.data) {
        setSuggestedPlaces(res.data.data);
        // Select all by default
        setSelectedIndices(res.data.data.map((_, idx) => idx));
        showToast(`AI discovered ${res.data.data.length} places for ${destination}!`, 'success');
      }
    } catch (error) {
      showToast(error.message || 'Discovery failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectPlace = (index) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter((i) => i !== index));
    } else {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  const handleSaveSelected = async () => {
    if (selectedIndices.length === 0) {
      showToast('Select at least one place to add to your trip.', 'warning');
      return;
    }

    try {
      setSaving(true);
      const placesToSave = selectedIndices.map((i) => suggestedPlaces[i]);
      const res = await api.post('/places/batch', {
        tripId,
        places: placesToSave,
      });

      if (res.data.success) {
        showToast(`${placesToSave.length} places added to your trip wishlist!`, 'success');
        if (onPlacesAdded) onPlacesAdded();
        onClose();
      }
    } catch (error) {
      showToast('Failed to save places to trip.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Place Discovery"
      subtitle={`Curated must-visit landmarks, eateries, and spots in ${destination}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        {/* Interests Selector & Generate trigger */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Select Your Travel Interests
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {interestOptions.map((tag) => {
              const active = interests.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleInterest(tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-brand-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Info className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
              <span>Estimates & opening hours require on-ground verification.</span>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{loading ? 'Discovering Places...' : 'AI Suggest Places'}</span>
            </button>
          </div>
        </div>

        {/* Places Recommendations List */}
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-navy-900">Discovering places in {destination}...</p>
            <p className="text-xs text-slate-400 mt-1">
              Analyzing travel style, top-rated landmarks, and scenic spots.
            </p>
          </div>
        ) : suggestedPlaces.length === 0 ? (
          <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-2xl">
            <Sparkles className="w-8 h-8 text-brand-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Ready to explore {destination}</p>
            <p className="text-xs text-slate-400 mt-1">
              Click the "AI Suggest Places" button above to generate personalized attractions.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-semibold">
              <span>{suggestedPlaces.length} Recommendations Found</span>
              <span>{selectedIndices.length} Selected to Save</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestedPlaces.map((place, idx) => {
                const isSelected = selectedIndices.includes(idx);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleSelectPlace(idx)}
                    className={`cursor-pointer p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/40 ring-1 ring-brand-500/30'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-xs font-bold text-navy-900 line-clamp-1">
                          {place.name}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected ? 'bg-brand-600 text-white' : 'border border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>

                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase mb-2">
                        {place.category}
                      </span>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-2">
                        {place.notes}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <span>⏱ {place.suggestedDuration || '2 hours'}</span>
                      <span className="font-bold text-navy-900">
                        {place.estimatedCost > 0 ? `${currency}${place.estimatedCost}` : 'Free'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>

          {suggestedPlaces.length > 0 && (
            <button
              type="button"
              onClick={handleSaveSelected}
              disabled={saving || selectedIndices.length === 0}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-navy-900 hover:bg-brand-600 transition-all shadow-sm"
            >
              {saving
                ? 'Saving Places...'
                : `Save ${selectedIndices.length} Places to Trip Wishlist`}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

