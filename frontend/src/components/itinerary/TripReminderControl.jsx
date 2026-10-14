import React, { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const REMINDER_LEAD_TIME_MS = 15 * 60 * 1000;
const CHECK_INTERVAL_MS = 30 * 1000;

function getActivityTime(activity, tripStartDate) {
  const dateValue = activity.date || tripStartDate;
  const dateMatch = String(dateValue || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  const timeMatch = String(activity.time || '09:00 AM').trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!dateMatch || !timeMatch) return null;

  let hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  const meridiem = timeMatch[3]?.toUpperCase();
  if (minutes > 59 || (meridiem && (hours < 1 || hours > 12)) || (!meridiem && hours > 23)) {
    return null;
  }
  if (meridiem) {
    hours = (hours % 12) + (meridiem === 'PM' ? 12 : 0);
  }

  const date = new Date(
    Number(dateMatch[1]),
    Number(dateMatch[2]) - 1,
    Number(dateMatch[3]),
    hours,
    minutes
  );
  if (!activity.date) {
    const dayNumber = Number(activity.dayNumber) || 1;
    date.setDate(date.getDate() + Math.max(0, dayNumber - 1));
  }
  return date.getTime();
}

export default function TripReminderControl({ tripId, trip, activities, spent, budget, currency, userId }) {
  const { showToast } = useToast();
  const preferenceKey = `tripmate_reminders_${userId}_${tripId}`;
  const sentKeyPrefix = `tripmate_reminder_sent_${userId}_${tripId}_`;
  const [enabled, setEnabled] = useState(() => localStorage.getItem(preferenceKey) === 'true');

  useEffect(() => {
    if (!enabled || typeof window.Notification === 'undefined' || window.Notification.permission !== 'granted') {
      return undefined;
    }

    const notifyOnce = (identifier, title, body) => {
      const sentKey = `${sentKeyPrefix}${identifier}`;
      if (localStorage.getItem(sentKey) === 'true') return;

      try {
        new window.Notification(title, { body, tag: sentKey });
        localStorage.setItem(sentKey, 'true');
      } catch (error) {
        console.error('Could not show trip reminder notification:', error);
      }
    };

    const checkReminders = () => {
      const now = Date.now();
      activities.forEach((activity) => {
        if (activity.isCompleted || !activity._id) return;
        const startsAt = getActivityTime(activity, trip.startDate);
        if (
          startsAt &&
          startsAt > now &&
          startsAt - now <= REMINDER_LEAD_TIME_MS
        ) {
          notifyOnce(
            `activity_${activity._id}_${startsAt}`,
            `Coming up: ${activity.title}`,
            `${activity.title} is scheduled in about 15 minutes${activity.location ? ` at ${activity.location}` : ''}.`
          );
        }
      });

      if (budget > 0 && spent >= budget) {
        notifyOnce('budget_over', 'Trip budget exceeded', `You have spent ${currency}${spent.toLocaleString()} of your ${currency}${budget.toLocaleString()} trip budget.`);
      } else if (budget > 0 && spent >= budget * 0.8) {
        notifyOnce('budget_80_percent', 'Trip budget getting close', `You have used at least 80% of your ${currency}${budget.toLocaleString()} trip budget.`);
      }
    };

    checkReminders();
    const interval = window.setInterval(checkReminders, CHECK_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [activities, budget, currency, enabled, sentKeyPrefix, spent, trip.startDate]);

  const handleToggle = async () => {
    if (enabled) {
      localStorage.setItem(preferenceKey, 'false');
      setEnabled(false);
      showToast('Trip reminders turned off.', 'info');
      return;
    }

    if (typeof window.Notification === 'undefined') {
      showToast('Browser notifications are not supported in this browser.', 'error');
      return;
    }

    const permission =
      window.Notification.permission === 'granted'
        ? 'granted'
        : await window.Notification.requestPermission();
    if (permission !== 'granted') {
      showToast('Allow notifications in your browser to enable trip reminders.', 'warning');
      return;
    }

    localStorage.setItem(preferenceKey, 'true');
    setEnabled(true);
    showToast('Trip reminders enabled for this browser.', 'success');
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-soft">
      <div className="flex items-start gap-3">
        {enabled ? (
          <Bell className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
        ) : (
          <BellOff className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        )}
        <div>
          <p className="text-xs font-bold text-navy-900">Trip reminders</p>
          <p className="text-[11px] text-slate-500">
            {enabled
              ? 'Activity alerts are sent 15 minutes before, plus a budget alert at 80%. Keep this trip open.'
              : 'Optional browser alerts for upcoming activities and nearing your budget. Only while this trip is open.'}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleToggle}
        className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
          enabled
            ? 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            : 'bg-brand-600 text-white hover:bg-brand-700'
        }`}
      >
        {enabled ? 'Turn off' : 'Enable reminders'}
      </button>
    </div>
  );
}
