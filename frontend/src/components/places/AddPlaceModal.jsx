import React, { useState } from 'react';
import Modal from '../common/Modal';
import { MapPin, DollarSign, Clock, Tag, ExternalLink } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function AddPlaceModal({
  isOpen,
  onClose,
  onSubmit,
  tripDays = 3,
  destination = '',
  currency = '₹',
}) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const categories = [
    'Tourist attractions',
    'Beaches',
    'Restaurants and cafes',
    'Historical places',
    'Shopping',
    'Nature and adventure',
    'Hidden gems',
    'Free attractions',
    'Other',
  ];

  const [formData, setFormData] = useState({
    name: '',
    category: 'Tourist attractions',
    address: destination,
    estimatedCost: 0,
    openingHours: '9:00 AM - 6:00 PM',
    priority: 'Medium',
    suggestedDuration: '2 hours',
    dayNumber: '',
    notes: '',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      showToast('Place name is required.', 'error');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        ...formData,
        estimatedCost: Number(formData.estimatedCost) || 0,
        dayNumber: formData.dayNumber ? Number(formData.dayNumber) : null,
      });
      onClose();
    } catch (error) {
      showToast(error.message || 'Failed to add place.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Place to Trip"
      subtitle="Pin attractions, cafes, viewpoints, and adventures to your itinerary."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Place Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Aguada Fort, Chapora Point"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Address & Estimated Cost */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Address / Area
            </label>
            <input
              type="text"
              placeholder="e.g. Candolim, North Goa"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Estimated Entry / Cost ({currency})
            </label>
            <input
              type="number"
              min="0"
              value={formData.estimatedCost}
              onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        {/* Opening Hours, Duration & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Opening Hours
            </label>
            <input
              type="text"
              placeholder="e.g. 9:00 AM - 6:00 PM"
              value={formData.openingHours}
              onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Visit Duration
            </label>
            <input
              type="text"
              placeholder="e.g. 2 hours"
              value={formData.suggestedDuration}
              onChange={(e) => setFormData({ ...formData, suggestedDuration: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Assign to Day
            </label>
            <select
              value={formData.dayNumber}
              onChange={(e) => setFormData({ ...formData, dayNumber: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">Wishlist (Unassigned)</option>
              {Array.from({ length: tripDays }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  Day {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Photo URL
          </label>
          <input
            type="text"
            placeholder="https://..."
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Notes / Why Visit
          </label>
          <textarea
            rows="2"
            placeholder="Key highlights, photo spots, best time to visit..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-navy-900 hover:bg-brand-600 transition-all shadow-sm"
          >
            {loading ? 'Adding...' : 'Add Place'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

