import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Music, Radio, Disc, Sparkles } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function CreatePlaylistModal({ isOpen, onClose, onSubmit }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const moods = [
    'Road Trip',
    'Party',
    'Chill',
    'Romantic',
    'Telugu Hits',
    'Hindi Hits',
    'English Hits',
    'Other',
  ];

  const [formData, setFormData] = useState({
    name: '',
    mood: 'Road Trip',
    spotifyEmbedUrl: '',
    description: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      showToast('Playlist name is required.', 'error');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      showToast(error.message || 'Failed to create playlist.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Travel Playlist"
      subtitle="Curate moods and soundtracks for road trips, flights, and campfire evenings."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Playlist Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Goa Sunset Acoustic, Highway 66 Vibes"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Vibe / Mood
          </label>
          <select
            value={formData.mood}
            onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            {moods.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Spotify Playlist Link (Optional)
          </label>
          <input
            type="text"
            placeholder="https://open.spotify.com/playlist/..."
            value={formData.spotifyEmbedUrl}
            onChange={(e) => setFormData({ ...formData, spotifyEmbedUrl: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Paste a public Spotify link to enable direct playback and embedded listening.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            rows="2"
            placeholder="High-energy tracks for afternoon highway cruising..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
            {loading ? 'Creating...' : 'Create Playlist'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

