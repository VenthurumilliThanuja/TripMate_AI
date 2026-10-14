import React, { useState, useEffect, useRef } from 'react';
import Modal from '../common/Modal';
import { DollarSign, Calendar, Tag, User, Users, Check, AlertCircle, ScanLine } from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';

export default function ExpenseFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  tripFriends = [],
  currency = '₹',
}) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isScanningReceipt, setIsScanningReceipt] = useState(false);
  const receiptInputRef = useRef(null);

  // Available payers: 'You' + all trip companions
  const allPeople = [
    { name: 'You', id: 'you' },
    ...tripFriends.map((f) => ({ name: f.name, id: f.friendId || f._id })),
  ];

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food',
    customCategory: '',
    date: new Date().toISOString().split('T')[0],
    payerName: 'You',
    splitType: 'equal',
    selectedParticipants: allPeople.map((p) => p.name),
    customShares: {}, // name -> amount
    status: 'paid',
    notes: '',
  });

  const categories = ['Food', 'Stay', 'Transport', 'Activities', 'Shopping', 'Miscellaneous', 'Custom...'];

  const handleReceiptUpload = async (event) => {
    const input = event.target;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Choose a JPEG, PNG, or WebP receipt image.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Receipt images must be 5 MB or smaller.', 'error');
      return;
    }

    try {
      setIsScanningReceipt(true);
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Could not read the selected image.'));
        reader.readAsDataURL(file);
      });
      const imageBase64 = String(dataUrl).split(',')[1];
      if (!imageBase64) {
        throw new Error('Could not read the selected image.');
      }

      const response = await api.post('/ai/parse-receipt', {
        imageBase64,
        mimeType: file.type,
      });
      const suggestion = response.data.data;
      const standardCategories = categories.filter((category) => category !== 'Custom...');
      setFormData((current) => ({
        ...current,
        title: suggestion.title,
        amount: String(suggestion.amount),
        category: standardCategories.includes(suggestion.category) ? suggestion.category : 'Custom...',
        customCategory: standardCategories.includes(suggestion.category) ? '' : suggestion.category,
        date: suggestion.date || current.date,
      }));
      showToast('Receipt details added. Review them before saving.', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || error.message || 'Receipt scan failed.', 'error');
    } finally {
      setIsScanningReceipt(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      const isCustomCat = !['Food', 'Stay', 'Transport', 'Activities', 'Shopping', 'Miscellaneous'].includes(
        initialData.category
      );

      const sharesObj = {};
      (initialData.participants || []).forEach((p) => {
        sharesObj[p.name] = p.shareAmount;
      });

      setFormData({
        title: initialData.title || '',
        amount: initialData.amount || '',
        category: isCustomCat ? 'Custom...' : initialData.category || 'Food',
        customCategory: isCustomCat ? initialData.category : '',
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
        payerName: initialData.payer?.name || 'You',
        splitType: initialData.splitType || 'equal',
        selectedParticipants: initialData.participants?.length
          ? initialData.participants.map((p) => p.name)
          : allPeople.map((p) => p.name),
        customShares: sharesObj,
        status: initialData.status || 'paid',
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        category: 'Food',
        customCategory: '',
        date: new Date().toISOString().split('T')[0],
        payerName: 'You',
        splitType: 'equal',
        selectedParticipants: allPeople.map((p) => p.name),
        customShares: {},
        status: 'paid',
        notes: '',
      });
    }
  }, [initialData, isOpen]);

  const toggleParticipant = (personName) => {
    const exists = formData.selectedParticipants.includes(personName);
    if (exists) {
      if (formData.selectedParticipants.length === 1) {
        showToast('At least one person must participate in the expense.', 'warning');
        return;
      }
      setFormData({
        ...formData,
        selectedParticipants: formData.selectedParticipants.filter((n) => n !== personName),
      });
    } else {
      setFormData({
        ...formData,
        selectedParticipants: [...formData.selectedParticipants, personName],
      });
    }
  };

  const handleCustomShareChange = (personName, val) => {
    setFormData({
      ...formData,
      customShares: {
        ...formData.customShares,
        [personName]: Math.max(0, Number(val) || 0),
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(formData.amount);
    if (!formData.title || !numAmount || numAmount <= 0) {
      showToast('Please provide a valid description and amount.', 'error');
      return;
    }

    const finalCategory =
      formData.category === 'Custom...'
        ? formData.customCategory.trim() || 'Miscellaneous'
        : formData.category;

    // Build participants array
    let participants = [];
    if (formData.splitType === 'equal') {
      const share = Math.round((numAmount / formData.selectedParticipants.length) * 100) / 100;
      participants = formData.selectedParticipants.map((name) => {
        const found = allPeople.find((p) => p.name === name);
        return {
          name,
          friendId: found?.id !== 'you' ? found?.id : null,
          shareAmount: share,
        };
      });
    } else {
      // Custom split validation
      const totalCustom = formData.selectedParticipants.reduce(
        (sum, name) => sum + (Number(formData.customShares[name]) || 0),
        0
      );
      if (Math.abs(totalCustom - numAmount) > 1) {
        showToast(
          `Custom split total (${currency}${totalCustom}) does not match expense amount (${currency}${numAmount}).`,
          'error'
        );
        return;
      }

      participants = formData.selectedParticipants.map((name) => {
        const found = allPeople.find((p) => p.name === name);
        return {
          name,
          friendId: found?.id !== 'you' ? found?.id : null,
          shareAmount: Number(formData.customShares[name]) || 0,
        };
      });
    }

    const payerPerson = allPeople.find((p) => p.name === formData.payerName);

    try {
      setLoading(true);
      await onSubmit({
        title: formData.title,
        amount: numAmount,
        category: finalCategory,
        date: formData.date,
        payer: {
          name: formData.payerName,
          friendId: payerPerson?.id !== 'you' ? payerPerson?.id : null,
        },
        splitType: formData.splitType,
        participants,
        status: formData.status,
        notes: formData.notes,
      });
      onClose();
    } catch (error) {
      showToast(error.message || 'Failed to save expense', 'error');
    } finally {
      setLoading(false);
    }
  };

  const perPersonEqualShare =
    formData.amount && formData.selectedParticipants.length > 0
      ? (Number(formData.amount) / formData.selectedParticipants.length).toFixed(2)
      : '0.00';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Expense Transaction' : 'Record New Expense'}
      subtitle="Track expenses, designate payer, and configure shared friend splits."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl border border-brand-200 bg-brand-50/70 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <p className="text-xs font-bold text-navy-900">Add details from a receipt</p>
            <p className="text-[11px] text-slate-500">
              Gemini will suggest the amount, description, category, and date. The image is not saved.
            </p>
          </div>
          <input
            ref={receiptInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            onChange={handleReceiptUpload}
            className="hidden"
            aria-label="Choose receipt image"
          />
          <button
            type="button"
            onClick={() => receiptInputRef.current?.click()}
            disabled={isScanningReceipt}
            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white border border-brand-200 text-brand-700 text-xs font-bold hover:bg-brand-100 disabled:opacity-60"
          >
            <ScanLine className="w-4 h-4" />
            {isScanningReceipt ? 'Scanning...' : 'Scan receipt'}
          </button>
        </div>

        {/* Row 1: Amount & Title */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Amount ({currency}) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-extrabold text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description / Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dinner at Fisherman’s Wharf, Beach cab, Fuel"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        {/* Row 2: Category & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {formData.category === 'Custom...' && (
              <input
                type="text"
                placeholder="Enter custom category name"
                required
                value={formData.customCategory}
                onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                className="mt-2 w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Date
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        {/* Row 3: Paid by & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Paid By
            </label>
            <select
              value={formData.payerName}
              onChange={(e) => setFormData({ ...formData, payerName: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              {allPeople.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Row 4: Shared Expense Split Options */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Split Among Companions
            </label>
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, splitType: 'equal' })}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  formData.splitType === 'equal'
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                Equal Split
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, splitType: 'custom' })}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  formData.splitType === 'custom'
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                Custom Split
              </button>
            </div>
          </div>

          {/* Participants toggles */}
          <div className="flex flex-wrap gap-2 mb-3">
            {allPeople.map((p) => {
              const isSelected = formData.selectedParticipants.includes(p.name);
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => toggleParticipant(p.name)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-navy-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-brand-400" />}
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>

          {/* Equal split preview vs Custom split inputs */}
          {formData.splitType === 'equal' ? (
            <div className="text-xs text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <span>Share per participant ({formData.selectedParticipants.length} people):</span>
              <span className="font-extrabold text-navy-900">
                {currency}{perPersonEqualShare}
              </span>
            </div>
          ) : (
            <div className="space-y-2 pt-2 border-t border-slate-200/60">
              <p className="text-[11px] text-slate-500">Specify each participant's share:</p>
              <div className="grid grid-cols-2 gap-2">
                {formData.selectedParticipants.map((name) => (
                  <div key={name} className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                    <span className="text-xs font-semibold text-slate-700 truncate">{name}</span>
                    <div className="flex items-center gap-1 w-24">
                      <span className="text-xs text-slate-400">{currency}</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0"
                        value={formData.customShares[name] || ''}
                        onChange={(e) => handleCustomShareChange(name, e.target.value)}
                        className="w-full text-xs font-bold border rounded px-1.5 py-0.5 text-right focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Notes / Receipt Details
          </label>
          <input
            type="text"
            placeholder="Add receipt number, payment mode, or extra details..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-navy-900 hover:bg-brand-600 transition-all shadow-sm"
          >
            {loading ? 'Saving...' : initialData ? 'Update Expense' : 'Record Expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
