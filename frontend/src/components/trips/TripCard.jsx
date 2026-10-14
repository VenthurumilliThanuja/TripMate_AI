import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  Wallet,
  ArrowRight,
  Archive,
  Trash2,
  Edit2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

export default function TripCard({
  trip,
  currency = '₹',
  onEdit,
  onDelete,
  onToggleArchive,
}) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const spent = trip.totalSpent || 0;
  const budget = trip.totalBudget || 0;
  const remaining = budget - spent;
  const isOverbudget = spent > budget;
  const overspentAmount = isOverbudget ? spent - budget : 0;
  const progressPercent = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;

  return (
    <div className="group rounded-2xl bg-white border border-slate-200/90 shadow-soft hover:shadow-elevated transition-all duration-300 overflow-hidden flex flex-col">
      {/* Cover Image Header */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <img
          src={trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'}
          alt={trip.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-navy-900/20 to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md ${
              trip.status === 'archived'
                ? 'bg-slate-700/80 text-slate-200'
                : trip.status === 'active'
                ? 'bg-emerald-500/90 text-white'
                : 'bg-brand-500/90 text-white'
            }`}
          >
            {trip.status}
          </span>
        </div>

        {/* Destination & Title Overlay */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <div className="flex items-center gap-1 text-xs text-brand-200 font-medium mb-1 drop-shadow">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{trip.destination}</span>
          </div>
          <h3 className="font-extrabold text-lg text-white leading-snug truncate drop-shadow">
            {trip.title}
          </h3>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        {/* Dates & Travelers */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-600 font-semibold">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{trip.numTravelers || 1} {trip.numTravelers === 1 ? 'Traveler' : 'Travelers'}</span>
            </div>
          </div>

          {/* Description preview */}
          {trip.description && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed pt-1">
              {trip.description}
            </p>
          )}
        </div>

        {/* Budget & Spending Progress Bar */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-600">Total Budget:</span>
            <span className="font-bold text-navy-900">{currency}{budget.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-600">Actual Spent:</span>
            <span className="font-bold text-slate-900">{currency}{spent.toLocaleString()}</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverbudget ? 'bg-rose-500' : progressPercent > 80 ? 'bg-amber-500' : 'bg-brand-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Balance / Overspent indicator */}
          <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-slate-200/60">
            {isOverbudget ? (
              <>
                <span className="flex items-center gap-1 text-rose-600">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Budget Exceeded:
                </span>
                <span className="text-rose-600">+{currency}{overspentAmount.toLocaleString()}</span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1 text-emerald-700">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Remaining:
                </span>
                <span className="text-emerald-700">{currency}{remaining.toLocaleString()}</span>
              </>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(trip)}
              title="Edit Trip Details"
              className="p-1.5 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleArchive(trip._id)}
              title={trip.status === 'archived' ? 'Restore Trip' : 'Archive Trip'}
              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Archive className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(trip)}
              title="Delete Trip"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <Link
            to={`/trips/${trip._id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-navy-900 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all group-hover:gap-2"
          >
            <span>Open Folder</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

