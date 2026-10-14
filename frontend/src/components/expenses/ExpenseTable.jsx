import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

export default function ExpenseTable({
  expenses = [],
  categorySummary = [],
  totalBudget = 0,
  totalSpent = 0,
  currency = '₹',
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  onExportCSV,
  friendsList = [],
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [payerFilter, setPayerFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Filter expenses
  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      (e.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.payer?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
    const matchesPayer = payerFilter === 'All' || e.payer?.name === payerFilter;
    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;

    return matchesSearch && matchesCategory && matchesPayer && matchesStatus;
  });

  const remainingBudget = totalBudget - totalSpent;
  const isOverbudget = totalSpent > totalBudget;
  const overspentAmount = isOverbudget ? totalSpent - totalBudget : 0;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  const categories = [
    'All',
    'Food',
    'Stay',
    'Transport',
    'Activities',
    'Shopping',
    ...categorySummary
      .map((c) => c.category)
      .filter((c) => !['Food', 'Stay', 'Transport', 'Activities', 'Shopping'].includes(c)),
  ];

  return (
    <div className="space-y-6">
      {/* 1. Category Budget Targets Table (as specified in Section 5) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden">
        <div className="px-6 py-4.5 bg-slate-50/70 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-navy-900">
              Trip Budget & Category Allocations
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live comparison of planned thresholds against actual recorded expenditures.
            </p>
          </div>

          {/* Quick summary badges */}
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
              <span className="text-slate-500">Planned Budget: </span>
              <span className="font-bold text-navy-900">{currency}{totalBudget.toLocaleString()}</span>
            </div>
            <div
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                isOverbudget
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {isOverbudget ? (
                <span>Exceeded by: +{currency}{overspentAmount.toLocaleString()}</span>
              ) : (
                <span>Remaining: {currency}{remainingBudget.toLocaleString()}</span>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-6">Expense Category</th>
                <th className="py-3 px-6">Description</th>
                <th className="py-3 px-6 text-right">Planned Amount</th>
                <th className="py-3 px-6 text-right">Actual Spent</th>
                <th className="py-3 px-6 text-right">Remaining Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {categorySummary.map((row) => {
                const isOver = row.isOverspent;
                return (
                  <tr key={row.category} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-navy-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand-500" />
                      <span>{row.category}</span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-500">{row.description}</td>
                    <td className="py-3.5 px-6 text-right font-semibold text-slate-700">
                      {currency}{row.plannedAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-6 text-right font-bold text-slate-900">
                      {currency}{row.actualSpent.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-6 text-right font-bold">
                      {isOver ? (
                        <span className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100">
                          <AlertCircle className="w-3 h-3" />
                          Exceeded +{currency}{row.overspentAmount.toLocaleString()}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                          <CheckCircle2 className="w-3 h-3" />
                          {currency}{row.remainingBalance.toLocaleString()}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100/70 text-xs font-extrabold text-navy-900 border-t-2 border-slate-200">
                <td className="py-3.5 px-6" colSpan={2}>
                  Total Trip Summary
                </td>
                <td className="py-3.5 px-6 text-right">
                  {currency}{totalBudget.toLocaleString()}
                </td>
                <td className="py-3.5 px-6 text-right text-brand-700">
                  {currency}{totalSpent.toLocaleString()}
                </td>
                <td className="py-3.5 px-6 text-right">
                  {isOverbudget ? (
                    <span className="text-rose-600">
                      Overbudget: +{currency}{overspentAmount.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-emerald-700">
                      Safe Balance: {currency}{remainingBudget.toLocaleString()}
                    </span>
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 2. Transactions Log Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 md:p-6 border-b border-slate-200/80 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-slate-50/40">
          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-2 px-3 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Categories' : c}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="All">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onAddExpense}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-navy-900 hover:bg-brand-600 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          {filteredExpenses.length === 0 ? (
            <div className="p-12 text-center">
              <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No expenses found</p>
              <p className="text-xs text-slate-400 mt-1">
                {searchTerm || categoryFilter !== 'All'
                  ? 'Try clearing your filters'
                  : 'Start recording receipts, tickets, and meals.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Title & Notes</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">Paid By</th>
                  <th className="py-3 px-6">Split With</th>
                  <th className="py-3 px-6 text-right">Amount</th>
                  <th className="py-3 px-6 text-center">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredExpenses.map((expense) => {
                  const participantsCount = expense.participants?.length || 0;
                  return (
                    <tr key={expense._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-slate-600 whitespace-nowrap">
                        {formatDate(expense.date)}
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="font-bold text-navy-900">{expense.title}</div>
                        {expense.notes && (
                          <div className="text-[11px] text-slate-400 line-clamp-1">{expense.notes}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200">
                          {expense.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 font-medium text-slate-700">
                        {expense.payer?.name || 'You'}
                      </td>
                      <td className="py-3.5 px-6 text-slate-600">
                        {participantsCount > 0 ? (
                          <span className="text-[11px] font-medium text-slate-600">
                            {participantsCount} {participantsCount === 1 ? 'person' : 'people'}{' '}
                            ({expense.splitType})
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Personal</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right font-extrabold text-navy-900 text-sm whitespace-nowrap">
                        {currency}{expense.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            expense.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {expense.status === 'paid' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          <span className="capitalize">{expense.status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => onEditExpense(expense)}
                            className="p-1.5 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteExpense(expense)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

