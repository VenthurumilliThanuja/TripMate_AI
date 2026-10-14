import React from 'react';
import {
  Phone,
  Mail,
  ShieldAlert,
  Compass,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function FriendCard({ friend, onEdit, onDelete }) {
  const { showToast } = useToast();

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label}: ${text}`, 'success');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft hover:shadow-card transition-all p-5 flex flex-col justify-between space-y-4">
      {/* Header Info */}
      <div className="flex items-start gap-3.5">
        <img
          src={
            friend.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name)}&background=0ea5e9&color=fff`
          }
          alt={friend.name}
          className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-extrabold text-navy-900 text-sm truncate">{friend.name}</h4>
            {friend.nickname && (
              <span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-1.5 py-0.2 rounded">
                "{friend.nickname}"
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {friend.relationship || 'Friend'}
            </span>
            {friend.isEmergencyContact && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                <ShieldAlert className="w-3 h-3 text-rose-500" />
                Emergency Contact
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Contact Details */}
      <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
        {friend.phone ? (
          <div className="flex items-center justify-between">
            <a
              href={`tel:${friend.phone}`}
              className="flex items-center gap-2 hover:text-brand-600 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{friend.phone}</span>
            </a>
            <button
              onClick={() => copyToClipboard(friend.phone, 'Phone number')}
              className="text-slate-400 hover:text-slate-600 p-0.5"
              title="Copy Phone"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400">
            <Phone className="w-3.5 h-3.5" />
            <span>No phone saved</span>
          </div>
        )}

        {friend.email ? (
          <div className="flex items-center justify-between">
            <a
              href={`mailto:${friend.email}`}
              className="flex items-center gap-2 hover:text-brand-600 transition-colors truncate"
            >
              <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{friend.email}</span>
            </a>
            <button
              onClick={() => copyToClipboard(friend.email, 'Email address')}
              className="text-slate-400 hover:text-slate-600 p-0.5"
              title="Copy Email"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : null}

        {friend.notes && (
          <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 line-clamp-2">
            {friend.notes}
          </p>
        )}
      </div>

      {/* Footer: Trips joined & Action controls */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
          <Compass className="w-3.5 h-3.5 text-brand-500" />
          <span>
            {friend.tripsCount || 0} {friend.tripsCount === 1 ? 'Trip Joined' : 'Trips Joined'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(friend)}
            className="p-1.5 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Edit Contact"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(friend)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Remove Friend"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

