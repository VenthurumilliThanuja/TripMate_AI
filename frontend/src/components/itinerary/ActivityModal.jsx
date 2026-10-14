import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Clock, MapPin, DollarSign, Tag, Lightbulb } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function ActivityModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  dayNumber = 1,
  currency = '₹',
}) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    timeSlot: 'Morning',
    time: '09:00 AM',
    location: '',
    description: '',
    estimatedCost: 0,
    travelTime: '',
    category: 'Sightseeing',
    budgetAlternative: '',
  });

  const categories = [
    'Sightseeing',
    'Meal',
    'Rest/Free Time',
    'Travel',
    'Adventure',
    'Shopping',
    'Nightlife',
    'Other',
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        timeSlot: initialData.timeSlot || 'Morning',
        time: initialData.time || '09:00 AM',
        location: initialData.location || '',
        description: initialData.description || '',
        estimatedCost: initialData.estimatedCost || 0,
        travelTime: initialData.travelTime || '',
        category: initialData.category || 'Sightseeing',
        budgetAlternative: initialData.budgetAlternative || '',
      });
    } else {
      setFormData({
        title: '',
        timeSlot: 'Morning',
        time: '09:00 AM',
        location: '',
        description: '',
        estimatedCost: 0,
        travelTime: '',
        category: 'Sightseeing',
        budgetAlternative: '',
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      showToast('Activity title is required.', 'error');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        ...formData,
        dayNumber: Number(dayNumber),
        estimatedCost: Number(formData.estimatedCost) || 0,
      });
      onClose();
    } catch (error) {
      showToast(error.message || 'Failed to save activity.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Day Activity' : `Add Activity to Day ${dayNumber}`}
      subtitle="Schedule morning, afternoon, or evening events with estimated budget."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Activity Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Scuba diving lesson, Goan heritage lunch, Sunset hike"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Time Slot
            </label>
            <select
              value={formData.timeSlot}
              onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
              <option value="Night">Night</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Scheduled Time
            </label>
            <input
              type="text"
              placeholder="e.g. 09:30 AM"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Location / Venue
            </label>
            <input
              type="text"
              placeholder="e.g. Baga Beach Promenade"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Planned Cost ({currency})
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={formData.estimatedCost}
              onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Transit / Travel Time
          </label>
          <input
            type="text"
            placeholder="e.g. 20 mins cab ride from hotel"
            value={formData.travelTime}
            onChange={(e) => setFormData({ ...formData, travelTime: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            rows="2"
            placeholder="Details, reservation notes, what to pack..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Budget-Friendly Alternative
          </label>
          <input
            type="text"
            placeholder="e.g. Free beach walk or street food market if overbudget"
            value={formData.budgetAlternative}
            onChange={(e) => setFormData({ ...formData, budgetAlternative: e.target.value })}
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
            {loading ? 'Saving...' : initialData ? 'Update Activity' : 'Save Activity'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

