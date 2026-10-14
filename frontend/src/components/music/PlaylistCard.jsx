import React from 'react';
import {
  Music,
  Plus,
  Trash2,
  ExternalLink,
  Play,
  Volume2,
  Disc,
} from 'lucide-react';

export default function PlaylistCard({
  playlist,
  onAddSong,
  onRemoveSong,
  onDeletePlaylist,
}) {
  // Convert Spotify standard URL to embed iframe URL if needed
  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('embed')) return url;
    return url.replace('open.spotify.com/', 'open.spotify.com/embed/');
  };

  const embedUrl = getEmbedUrl(playlist.spotifyEmbedUrl);

  const moodColors = {
    'Road Trip': 'bg-amber-50 text-amber-700 border-amber-200',
    Party: 'bg-rose-50 text-rose-700 border-rose-200',
    Chill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Romantic: 'bg-pink-50 text-pink-700 border-pink-200',
    'Telugu Hits': 'bg-orange-50 text-orange-700 border-orange-200',
    'Hindi Hits': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'English Hits': 'bg-sky-50 text-sky-700 border-sky-200',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden flex flex-col justify-between">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                moodColors[playlist.mood] || 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {playlist.mood}
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              {playlist.songs?.length || 0} Tracks
            </span>
          </div>

          <h4 className="text-base font-extrabold text-navy-900 leading-snug">
            {playlist.name}
          </h4>
          {playlist.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {playlist.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          {playlist.spotifyEmbedUrl && (
            <a
              href={playlist.spotifyEmbedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition-colors"
              title="Open in Spotify"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={() => onDeletePlaylist(playlist._id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
            title="Delete Playlist"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Spotify Embed Player (when supported) */}
      {embedUrl && (
        <div className="px-5 pt-4">
          <iframe
            src={embedUrl}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-xl shadow-sm border border-slate-100"
            title={playlist.name}
          />
        </div>
      )}

      {/* Songs List */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2 mb-4 max-h-56 overflow-y-auto pr-1">
          {(!playlist.songs || playlist.songs.length === 0) ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              <Disc className="w-6 h-6 mx-auto mb-1 text-slate-300" />
              <span>No songs in this playlist yet. Add your favorite tracks!</span>
            </div>
          ) : (
            playlist.songs.map((song) => (
              <div
                key={song._id}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-100/80 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={song.coverImage || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=100&q=80'}
                    alt={song.title}
                    className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{song.title}</p>
                    <p className="text-[11px] text-slate-500 truncate">{song.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[11px] text-slate-400 font-medium">{song.duration}</span>
                  <button
                    onClick={() => onRemoveSong(playlist._id, song._id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="Remove Track"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Song Button */}
        <button
          onClick={() => onAddSong(playlist)}
          className="w-full py-2 px-3 border border-dashed border-slate-300 hover:border-brand-500 rounded-xl text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Song to Playlist</span>
        </button>
      </div>
    </div>
  );
}

