import React from 'react';
import {
  MapPin,
  Clock,
  DollarSign,
  ExternalLink,
  CheckCircle2,
  Bookmark,
  Trash2,
  Calendar,
  Sparkles,
} from 'lucide-react';

export default function PlaceCard({
  place,
  currency = '₹',
  onToggleVisited,
  onDeletePlace,
  onAssignDay,
  tripDays = 3,
}) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 shadow-soft hover:shadow-card transition-all overflow-hidden flex flex-col justify-between group">
      {/* Top Image & Category */}
      <div className="relative h-40 w-full bg-slate-100 overflow-hidden">
        <img
          src={place.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'}
          alt={place.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-transparent to-transparent" />

        {/* Priority & AI Generated Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-navy-900/80 text-white">
            {place.category}
          </span>
          {place.aiGenerated && (
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-brand-500/90 text-white flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" />
              AI
            </span>
          )}
        </div>

        {/* Visited Status Badge */}
        <button
          onClick={() => onToggleVisited(place)}
          className={`absolute top-3 right-3 p-1.5 rounded-lg backdrop-blur-md transition-all ${
            place.isVisited
              ? 'bg-emerald-500 text-white'
              : 'bg-white/80 text-slate-600 hover:bg-white'
          }`}
          title={place.isVisited ? 'Mark as Not Visited' : 'Mark as Visited'}
        >
          <CheckCircle2 className="w-4 h-4" />
        </button>

        {/* Place Title */}
        <div className="absolute bottom-2.5 left-3 right-3 text-white">
          <h4 className="font-extrabold text-base leading-snug drop-shadow line-clamp-1">
            {place.name}
          </h4>
        </div>
      </div>

      {/* Place Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Address / Location */}
          {place.address && (
            <div className="flex items-start gap-1.5 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-1">{place.address}</span>
            </div>
          )}

          {/* Quick Metrics */}
          <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
            <div className="flex items-center gap-1 font-semibold">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{place.suggestedDuration || place.openingHours || '1-2 hrs'}</span>
            </div>
            <div className="font-bold text-navy-900">
              {place.estimatedCost > 0 ? `${currency}${place.estimatedCost}` : 'Free Entry'}
            </div>
          </div>

          {/* Notes / Reason to visit */}
          {place.notes && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
              {place.notes}
            </p>
          )}
        </div>

        {/* Day assignment & Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Day Assignment Dropdown */}
          <div className="flex items-center gap-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={place.dayNumber || ''}
              onChange={(e) => onAssignDay(place, e.target.value ? Number(e.target.value) : null)}
              className="py-1 px-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Wishlist (No Day)</option>
              {Array.from({ length: tripDays }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>
                  Day {day}
                </option>
              ))}
            </select>
          </div>

          {/* Map Link & Delete */}
          <div className="flex items-center gap-1">
            {place.googleMapsUrl && (
              <a
                href={place.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open in Google Maps"
                className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={() => onDeletePlace(place)}
              title="Delete Place"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

