import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Users, Clock, BookOpen, Package } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function AddGameModal({ isOpen, onClose, onSubmit }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'party',
    minPlayers: 3,
    maxPlayers: 12,
    durationMinutes: 30,
    rules: '',
    materialsNeeded: 'None (No internet required)',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.rules) {
      showToast('Game title and rules are required.', 'error');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      showToast(error.message || 'Failed to add game.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Custom Group Game"
      subtitle="Save your crew's favorite road trip and party games."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Game Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Mafia, Heads Up, Two Truths and a Lie"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="party">Party Game</option>
            <option value="car journey">Car Journey (Road Trip)</option>
            <option value="indoor">Indoor Game</option>
            <option value="outdoor">Outdoor / Campfire Game</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Min Players
            </label>
            <input
              type="number"
              min="1"
              value={formData.minPlayers}
              onChange={(e) => setFormData({ ...formData, minPlayers: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Max Players
            </label>
            <input
              type="number"
              min="2"
              value={formData.maxPlayers}
              onChange={(e) => setFormData({ ...formData, maxPlayers: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Duration (mins)
            </label>
            <input
              type="number"
              min="5"
              value={formData.durationMinutes}
              onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Rules & How to Play *
          </label>
          <textarea
            rows="3"
            required
            placeholder="Explain rounds, turn taking, scoring, and how to win..."
            value={formData.rules}
            onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Materials / Props Needed
          </label>
          <input
            type="text"
            placeholder="e.g. Deck of cards, timer, paper and pens"
            value={formData.materialsNeeded}
            onChange={(e) => setFormData({ ...formData, materialsNeeded: e.target.value })}
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
            {loading ? 'Adding...' : 'Save Game'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

