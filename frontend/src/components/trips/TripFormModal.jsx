import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Sparkles, Calendar, MapPin, Users, DollarSign, Image, Check, Plus } from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';

export default function TripFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  availableFriends = [],
  currency = '₹',
}) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [aiAllocating, setAiAllocating] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    totalBudget: 15000,
    numTravelers: 2,
    travelStyle: 'Moderate',
    description: '',
    coverImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
    selectedFriendIds: [],
    categoryBudgets: [
      { category: 'Food', description: 'Restaurants and snacks', plannedAmount: 3750 },
      { category: 'Stay', description: 'Hotels and rooms', plannedAmount: 5250 },
      { category: 'Transport', description: 'Bus, train, fuel', plannedAmount: 3000 },
      { category: 'Activities', description: 'Tickets and activities', plannedAmount: 1800 },
      { category: 'Shopping', description: 'Personal shopping', plannedAmount: 1200 },
    ],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        destination: initialData.destination || '',
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
        totalBudget: initialData.totalBudget || 15000,
        numTravelers: initialData.numTravelers || 2,
        travelStyle: initialData.travelStyle || 'Moderate',
        description: initialData.description || '',
        coverImage: initialData.coverImage || '',
        selectedFriendIds: (initialData.friends || []).map((f) => f.friendId || f._id),
        categoryBudgets: initialData.categoryBudgets?.length
          ? initialData.categoryBudgets
          : [
              { category: 'Food', description: 'Restaurants and snacks', plannedAmount: 3750 },
              { category: 'Stay', description: 'Hotels and rooms', plannedAmount: 5250 },
              { category: 'Transport', description: 'Bus, train, fuel', plannedAmount: 3000 },
              { category: 'Activities', description: 'Tickets and activities', plannedAmount: 1800 },
              { category: 'Shopping', description: 'Personal shopping', plannedAmount: 1200 },
            ],
      });
    } else {
      setFormData({
        title: '',
        destination: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
        totalBudget: 15000,
        numTravelers: 2,
        travelStyle: 'Moderate',
        description: '',
        coverImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
        selectedFriendIds: [],
        categoryBudgets: [
          { category: 'Food', description: 'Restaurants and snacks', plannedAmount: 3750 },
          { category: 'Stay', description: 'Hotels and rooms', plannedAmount: 5250 },
          { category: 'Transport', description: 'Bus, train, fuel', plannedAmount: 3000 },
          { category: 'Activities', description: 'Tickets and activities', plannedAmount: 1800 },
          { category: 'Shopping', description: 'Personal shopping', plannedAmount: 1200 },
        ],
      });
    }
  }, [initialData, isOpen]);

  const handleAiAutoAllocate = async () => {
    try {
      setAiAllocating(true);
      const res = await api.post('/ai/suggest-budget-allocation', {
        totalBudget: Number(formData.totalBudget),
        travelStyle: formData.travelStyle,
      });

      if (res.data.success && res.data.data) {
        setFormData((prev) => ({
          ...prev,
          categoryBudgets: res.data.data.map((cat) => ({
            category: cat.category,
            description: cat.description,
            plannedAmount: cat.plannedAmount,
          })),
        }));
        showToast('AI smart allocation applied to categories!', 'success');
      }
    } catch (error) {
      showToast('Could not auto-allocate. Please adjust manually.', 'warning');
    } finally {
      setAiAllocating(false);
    }
  };

  const handleCategoryAmountChange = (index, val) => {
    const updated = [...formData.categoryBudgets];
    updated[index].plannedAmount = Math.max(0, Number(val) || 0);
    setFormData({ ...formData, categoryBudgets: updated });
  };

  const toggleFriend = (friend) => {
    const id = friend._id;
    const exists = formData.selectedFriendIds.includes(id);
    if (exists) {
      setFormData({
        ...formData,
        selectedFriendIds: formData.selectedFriendIds.filter((fid) => fid !== id),
      });
    } else {
      setFormData({
        ...formData,
        selectedFriendIds: [...formData.selectedFriendIds, id],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.destination || !formData.startDate || !formData.endDate) {
      showToast('Please fill all required trip details.', 'error');
      return;
    }

    try {
      setLoading(true);
      // Map selected friends to objects
      const friendsData = availableFriends
        .filter((f) => formData.selectedFriendIds.includes(f._id))
        .map((f) => ({
          friendId: f._id,
          name: f.name,
          phone: f.phone,
          email: f.email,
        }));

      await onSubmit({
        ...formData,
        totalBudget: Number(formData.totalBudget),
        numTravelers: Number(formData.numTravelers) || 1,
        friends: friendsData,
      });

      onClose();
    } catch (error) {
      showToast(error.message || 'Operation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const sampleCoverImages = [
    { name: 'Tropical Beach', url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80' },
    { name: 'Mountain Adventure', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80' },
    { name: 'Heritage & City', url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80' },
    { name: 'Lakes & Nature', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Trip Folder' : 'Create New Trip Folder'}
      subtitle="Organize budgets, itineraries, and friends under a dedicated travel workspace."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Row 1: Trip Title & Destination */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Trip Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Goa Trip 2027, Ooty Weekend"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Destination *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="e.g. Goa, India"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Start Date *
            </label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              End Date *
            </label>
            <input
              type="date"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        {/* Row 3: Budget, Travelers & Travel Style */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Total Budget ({currency}) *
            </label>
            <input
              type="number"
              min="0"
              required
              value={formData.totalBudget}
              onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Travelers Count
            </label>
            <input
              type="number"
              min="1"
              value={formData.numTravelers}
              onChange={(e) => setFormData({ ...formData, numTravelers: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Travel Style
            </label>
            <select
              value={formData.travelStyle}
              onChange={(e) => setFormData({ ...formData, travelStyle: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="Budget">Budget</option>
              <option value="Moderate">Moderate</option>
              <option value="Luxury">Luxury</option>
              <option value="Backpacker">Backpacker</option>
              <option value="Adventure">Adventure</option>
            </select>
          </div>
        </div>

        {/* Row 4: Select Companions */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Add Friends from Travel Circle ({formData.selectedFriendIds.length} Selected)
          </label>
          {availableFriends.length === 0 ? (
            <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-100">
              No saved contacts yet. You can add companions in the Travel Circle page anytime.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1.5 border border-slate-100 rounded-xl bg-slate-50">
              {availableFriends.map((f) => {
                const isSelected = formData.selectedFriendIds.includes(f._id);
                return (
                  <button
                    key={f._id}
                    type="button"
                    onClick={() => toggleFriend(f)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-brand-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{f.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Row 5: Planned Category Budgets with AI button */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Planned Category Allocations
              </h4>
              <p className="text-[11px] text-slate-500">
                Pre-plan target thresholds for each expense category.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAiAutoAllocate}
              disabled={aiAllocating}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-lg border border-brand-200 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>{aiAllocating ? 'Calculating...' : 'AI Auto-Split'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {formData.categoryBudgets.map((cat, idx) => (
              <div key={cat.category} className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="block text-xs font-bold text-navy-900 mb-1">{cat.category}</span>
                <div className="relative">
                  <span className="absolute left-2 top-1.5 text-xs text-slate-400 font-bold">
                    {currency}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={cat.plannedAmount}
                    onChange={(e) => handleCategoryAmountChange(idx, e.target.value)}
                    className="w-full pl-6 pr-2 py-1 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cover Image Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Cover Image
          </label>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {sampleCoverImages.map((img) => (
              <button
                key={img.name}
                type="button"
                onClick={() => setFormData({ ...formData, coverImage: img.url })}
                className={`relative h-14 rounded-lg overflow-hidden border-2 transition-all ${
                  formData.coverImage === img.url
                    ? 'border-brand-500 ring-2 ring-brand-500/30'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Or enter custom image URL"
            value={formData.coverImage}
            onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Trip Notes / Description
          </label>
          <textarea
            rows="2"
            placeholder="Add notes about flight bookings, packing lists, meeting points..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 shadow-md shadow-brand-500/20 transition-all"
          >
            {loading ? 'Saving Trip...' : initialData ? 'Update Trip' : 'Create Trip Folder'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

