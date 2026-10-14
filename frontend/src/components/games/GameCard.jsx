import React from 'react';
import {
  Users,
  Clock,
  Sparkles,
  Heart,
  CheckCircle,
  Package,
  Trash2,
  BookOpen,
} from 'lucide-react';

export default function GameCard({
  game,
  onToggleFavorite,
  onTogglePlayed,
  onDeleteGame,
  isCustom = false,
}) {
  const categoryStyles = {
    party: 'bg-rose-50 text-rose-700 border-rose-200',
    'car journey': 'bg-amber-50 text-amber-700 border-amber-200',
    indoor: 'bg-sky-50 text-sky-700 border-sky-200',
    outdoor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft hover:shadow-card transition-all p-5 flex flex-col justify-between space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                categoryStyles[game.category] || 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {game.category}
            </span>
            {game.aiGenerated && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-brand-500/90 text-white flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" />
                AI
              </span>
            )}
            {isCustom && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-navy-800 text-white">
                My Game
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleFavorite && onToggleFavorite(game)}
              className={`p-1 rounded-lg transition-colors ${
                game.isFavorite ? 'text-rose-500' : 'text-slate-300 hover:text-rose-400'
              }`}
              title="Favorite Game"
            >
              <Heart className={`w-4 h-4 ${game.isFavorite ? 'fill-current' : ''}`} />
            </button>
            {isCustom && onDeleteGame && (
              <button
                onClick={() => onDeleteGame(game)}
                className="p-1 rounded-lg text-slate-300 hover:text-rose-600 transition-colors"
                title="Delete Custom Game"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <h4 className="text-base font-extrabold text-navy-900 leading-snug">{game.title}</h4>

        {/* Players & Duration Badges */}
        <div className="flex items-center gap-4 text-xs text-slate-500 font-medium mt-2">
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {game.minPlayers}-{game.maxPlayers} Players
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{game.durationMinutes || 30} mins</span>
          </div>
        </div>
      </div>

      {/* Rules & Materials */}
      <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
        <div>
          <span className="font-bold text-slate-700 flex items-center gap-1 mb-0.5">
            <BookOpen className="w-3 h-3 text-brand-600" />
            Rules:
          </span>
          <p className="text-slate-600 leading-relaxed text-[11px] line-clamp-3">{game.rules}</p>
        </div>

        {game.materialsNeeded && (
          <div className="pt-1 border-t border-slate-200/60 flex items-center gap-1 text-[11px] text-slate-500">
            <Package className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="truncate">{game.materialsNeeded}</span>
          </div>
        )}
      </div>

      {/* Mark Played Status */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
        <button
          onClick={() => onTogglePlayed && onTogglePlayed(game)}
          className={`flex items-center gap-1.5 font-semibold transition-colors ${
            game.isPlayed ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <CheckCircle className={`w-3.5 h-3.5 ${game.isPlayed ? 'text-emerald-600' : ''}`} />
          <span>{game.isPlayed ? 'Played on Trip' : 'Mark as Played'}</span>
        </button>
      </div>
    </div>
  );
}

