import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import api from '../../api/axios';
import confetti from 'canvas-confetti';
import { useToast } from '../../context/ToastContext';

export default function SettlementCard({ tripId, currency = '₹' }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [settlementData, setSettlementData] = useState({
    balances: [],
    suggestedSettlements: [],
    totalSplitExpenses: 0,
  });
  const [copiedIndex, setCopiedIndex] = useState(null);

  const fetchSettlements = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/settlements/trip/${tripId}`);
      if (res.data.success) {
        setSettlementData(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load settlements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tripId) {
      fetchSettlements();
    }
  }, [tripId]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  const copySettlement = (item, index) => {
    const text = `${item.from} pays ${currency}${item.amount.toLocaleString()} to ${item.to}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    showToast(`Copied: "${text}"`, 'success');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (loading) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <RefreshCw className="w-6 h-6 animate-spin text-brand-500 mx-auto mb-2" />
        <p className="text-xs text-slate-400">Computing group balances and minimal payment paths...</p>
      </div>
    );
  }

  const { balances, suggestedSettlements } = settlementData;
  const isAllSettled = suggestedSettlements.length === 0;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white p-6 rounded-2xl shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Smart Debt Minimization</span>
          </div>
          <h3 className="text-lg font-extrabold tracking-tight">Peer Expense Settlement</h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Our algorithm consolidates all group transactions and finds the absolute minimum number of
            payments needed to clear everyone's debts.
          </p>
        </div>

        <button
          onClick={fetchSettlements}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-navy-700 hover:bg-navy-600 text-white rounded-xl text-xs font-semibold self-start sm:self-auto transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Recalculate</span>
        </button>
      </div>

      {/* 2. Balances Breakdown per person */}
      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Individual Balances
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {balances.map((person) => {
            const isOwes = person.status === 'owes';
            const isGetsBack = person.status === 'gets_back';

            return (
              <div
                key={person.name}
                className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-soft flex items-center justify-between"
              >
                <div>
                  <h5 className="text-sm font-bold text-navy-900">{person.name}</h5>
                  <p className="text-[11px] text-slate-400 capitalize">
                    {isOwes ? 'Has pending debts' : isGetsBack ? 'Overpaid for group' : 'Settled up'}
                  </p>
                </div>

                <div className="text-right">
                  <div
                    className={`text-sm font-extrabold ${
                      isOwes ? 'text-rose-600' : isGetsBack ? 'text-emerald-700' : 'text-slate-500'
                    }`}
                  >
                    {isOwes
                      ? `-${currency}${Math.abs(person.netBalance).toLocaleString()}`
                      : isGetsBack
                      ? `+${currency}${person.netBalance.toLocaleString()}`
                      : `${currency}0`}
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      isOwes
                        ? 'bg-rose-50 text-rose-700'
                        : isGetsBack
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isOwes ? 'Owes' : isGetsBack ? 'Gets Back' : 'Settled'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Suggested Payments (Minimized) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-extrabold text-navy-900">Suggested Final Payments</h4>
            <p className="text-xs text-slate-400">
              {suggestedSettlements.length}{' '}
              {suggestedSettlements.length === 1 ? 'transaction' : 'transactions'} required to
              settle all group balances.
            </p>
          </div>

          {!isAllSettled && (
            <button
              onClick={triggerConfetti}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Celebrate Progress
            </button>
          )}
        </div>

        {isAllSettled ? (
          <div className="p-8 text-center bg-emerald-50 rounded-xl border border-emerald-100">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <h5 className="text-sm font-bold text-emerald-900">All Expenses Are Fully Settled!</h5>
            <p className="text-xs text-emerald-700 mt-1">
              Everyone is even. No outstanding payments are required for this trip.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestedSettlements.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <span className="font-extrabold text-navy-900">{item.from}</span>
                    <span className="text-slate-400">pays</span>
                    <ArrowRight className="w-4 h-4 text-brand-500" />
                    <span className="font-extrabold text-navy-900">{item.to}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-extrabold text-brand-700">
                    {currency}{item.amount.toLocaleString()}
                  </span>

                  <button
                    onClick={() => copySettlement(item, index)}
                    title="Copy payment prompt"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                  >
                    {copiedIndex === index ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

