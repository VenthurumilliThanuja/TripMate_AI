import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Sparkles,
  Trash2,
  Edit2,
  CheckCircle2,
  DollarSign,
  Car,
  Lightbulb,
} from 'lucide-react';

export default function DayItinerary({
  activities = [],
  tripDays = 3,
  currency = '₹',
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
  onToggleComplete,
  onOpenAiPlanner,
}) {
  const [selectedDay, setSelectedDay] = useState(1);

  // Group activities by day
  const dayActivities = activities
    .filter((a) => (a.dayNumber || 1) === selectedDay)
    .sort((a, b) => {
      const order = { Morning: 1, Afternoon: 2, Evening: 3, Night: 4 };
      return (order[a.timeSlot] || 5) - (order[b.timeSlot] || 5);
    });

  const dayTotalEstimated = dayActivities.reduce(
    (sum, a) => sum + (Number(a.estimatedCost) || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/90 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Day selection tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {Array.from({ length: Math.max(1, tripDays) }, (_, i) => i + 1).map((day) => {
            const count = activities.filter((a) => (a.dayNumber || 1) === day).length;
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-navy-900 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>Day {day}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenAiPlanner}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 hover:bg-brand-100 transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>AI Trip Planner</span>
          </button>

          <button
            onClick={() => onAddActivity(selectedDay)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-navy-900 hover:bg-brand-600 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Day Overview Summary */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h3 className="text-sm font-extrabold text-navy-900">Day {selectedDay} Schedule</h3>
          <p className="text-xs text-slate-400">
            {dayActivities.length} planned {dayActivities.length === 1 ? 'activity' : 'activities'}{' '}
            for this day
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-500">Day Planned Cost: </span>
          <span className="text-sm font-extrabold text-navy-900">
            {currency}{dayTotalEstimated.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Activities Timeline / Cards */}
      {dayActivities.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-soft">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-700">No activities scheduled for Day {selectedDay}</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Add your own itinerary events or click the "AI Trip Planner" to generate a tailored
            day-wise schedule automatically.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => onAddActivity(selectedDay)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              Add Activity
            </button>
            <button
              onClick={onOpenAiPlanner}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-600 text-white hover:bg-brand-700"
            >
              Generate with AI
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {dayActivities.map((act) => {
            let slotColor = 'bg-sky-50 text-sky-700 border-sky-200';
            if (act.timeSlot === 'Afternoon') slotColor = 'bg-amber-50 text-amber-700 border-amber-200';
            if (act.timeSlot === 'Evening') slotColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
            if (act.timeSlot === 'Night') slotColor = 'bg-purple-50 text-purple-700 border-purple-200';

            return (
              <div
                key={act._id}
                className={`p-4 rounded-2xl bg-white border border-slate-200/90 shadow-soft hover:shadow-card transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  act.isCompleted ? 'opacity-60 bg-slate-50/70' : ''
                }`}
              >
                {/* Left Time & Details */}
                <div className="flex items-start gap-3.5 flex-1">
                  {/* Complete Checkbox */}
                  <button
                    onClick={() => onToggleComplete(act)}
                    className={`mt-1 p-1 rounded-lg border transition-colors ${
                      act.isCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 text-transparent hover:border-slate-400'
                    }`}
                    title={act.isCompleted ? 'Mark Incomplete' : 'Mark Completed'}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${slotColor}`}
                      >
                        {act.timeSlot} • {act.time}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {act.category}
                      </span>
                    </div>

                    <h4
                      className={`text-sm font-bold text-navy-900 ${
                        act.isCompleted ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {act.title}
                    </h4>

                    {act.description && (
                      <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                        {act.description}
                      </p>
                    )}

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
                      {act.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{act.location}</span>
                        </div>
                      )}
                      {act.travelTime && (
                        <div className="flex items-center gap-1">
                          <Car className="w-3 h-3 text-slate-400" />
                          <span>{act.travelTime}</span>
                        </div>
                      )}
                      {act.budgetAlternative && (
                        <div className="flex items-center gap-1 text-amber-700 font-medium">
                          <Lightbulb className="w-3 h-3" />
                          <span>Alt: {act.budgetAlternative}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Cost & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-navy-900">
                      {act.estimatedCost > 0 ? `${currency}${act.estimatedCost}` : 'Free'}
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Planned</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditActivity(act)}
                      className="p-1.5 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Event"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteActivity(act)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Delete Event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

