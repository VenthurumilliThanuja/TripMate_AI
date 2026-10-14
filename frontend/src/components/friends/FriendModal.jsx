import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { User, Phone, Mail, ShieldAlert, Heart, FileText } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function FriendModal({ isOpen, onClose, onSubmit, initialData = null }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    phone: '',
    email: '',
    avatar: '',
    relationship: 'Friend',
    isEmergencyContact: false,
    notes: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        nickname: initialData.nickname || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        avatar: initialData.avatar || '',
        relationship: initialData.relationship || 'Friend',
        isEmergencyContact: Boolean(initialData.isEmergencyContact),
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        name: '',
        nickname: '',
        phone: '',
        email: '',
        avatar: '',
        relationship: 'Friend',
        isEmergencyContact: false,
        notes: '',
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      showToast('Friend name is required.', 'error');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      showToast(error.message || 'Failed to save companion.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Companion' : 'Add New Companion'}
      subtitle="Save friend details for shared trip splits and emergency access."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nickname / Alias
            </label>
            <input
              type="text"
              placeholder="e.g. Captain, Bunny"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              placeholder="rahul@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Relationship
            </label>
            <select
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="Friend">Friend</option>
              <option value="Travel Buddy">Travel Buddy</option>
              <option value="Family">Family</option>
              <option value="Partner">Partner</option>
              <option value="Colleague">Colleague</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Avatar Image URL
            </label>
            <input
              type="text"
              placeholder="https://images.unsplash..."
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        {/* Emergency contact toggle */}
        <label className="flex items-center gap-2.5 p-3 rounded-xl border border-rose-100 bg-rose-50/60 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isEmergencyContact}
            onChange={(e) => setFormData({ ...formData, isEmergencyContact: e.target.checked })}
            className="rounded text-rose-600 focus:ring-rose-500 h-4 w-4"
          />
          <div className="flex-1">
            <span className="text-xs font-bold text-rose-900 block flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              Designate as Emergency Contact
            </span>
            <span className="text-[11px] text-rose-700 block">
              Flagged with high priority during trips in case of medical or travel emergencies.
            </span>
          </div>
        </label>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Notes / Preferences
          </label>
          <textarea
            rows="2"
            placeholder="Vegetarian food preference, driving license holder, room preferences..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-navy-900 hover:bg-brand-600 transition-all shadow-sm"
          >
            {loading ? 'Saving...' : initialData ? 'Update Companion' : 'Save Companion'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

