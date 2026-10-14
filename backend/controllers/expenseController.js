const Expense = require('../models/Expense');
const Trip = require('../models/Trip');

// @desc    Get all expenses for a specific trip with filters & search
// @route   GET /api/expenses/trip/:tripId
// @access  Private
exports.getTripExpenses = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { category, search, payer, status, startDate, endDate } = req.query;

    // Verify trip ownership
    const trip = await Trip.findOne({ _id: tripId, userId: req.user._id });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized.' });
    }

    const query = { tripId };

    if (category && category !== 'All') {
      query.category = category;
    }
    if (status && status !== 'All') {
      query.status = status;
    }
    if (payer && payer !== 'All') {
      query['payer.name'] = payer;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { 'payer.name': { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query).sort({ date: -1, createdAt: -1 });

    // Calculate aggregated dynamic statistics
    const allTripExpenses = await Expense.find({ tripId });
    const totalSpent = allTripExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const totalBudget = trip.totalBudget;
    const remainingBudget = totalBudget - totalSpent;
    const isOverbudget = totalSpent > totalBudget;
    const overspentAmount = isOverbudget ? totalSpent - totalBudget : 0;

    // Category summary table
    const categorySpendingMap = {};
    allTripExpenses.forEach((e) => {
      const cat = e.category || 'Food';
      categorySpendingMap[cat] = (categorySpendingMap[cat] || 0) + Number(e.amount);
    });

    const categorySummary = (trip.categoryBudgets || []).map((cb) => {
      const actual = categorySpendingMap[cb.category] || 0;
      const planned = cb.plannedAmount || 0;
      const remaining = planned - actual;
      return {
        category: cb.category,
        description: cb.description || `${cb.category} expenses`,
        plannedAmount: planned,
        actualSpent: actual,
        remainingBalance: remaining,
        isOverspent: actual > planned,
        overspentAmount: actual > planned ? actual - planned : 0,
      };
    });

    // Append unbudgeted categories
    Object.entries(categorySpendingMap).forEach(([cat, actual]) => {
      if (!categorySummary.some((cs) => cs.category.toLowerCase() === cat.toLowerCase())) {
        categorySummary.push({
          category: cat,
          description: 'Custom expense category',
          plannedAmount: 0,
          actualSpent: actual,
          remainingBalance: -actual,
          isOverspent: true,
          overspentAmount: actual,
        });
      }
    });

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
      summary: {
        totalBudget,
        totalSpent,
        remainingBudget,
        isOverbudget,
        overspentAmount,
        categorySummary,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new expense to a trip
// @route   POST /api/expenses
// @access  Private
exports.createExpense = async (req, res, next) => {
  try {
    const {
      tripId,
      title,
      amount,
      category,
      date,
      payer,
      splitType = 'equal',
      participants = [],
      status = 'paid',
      notes = '',
    } = req.body;

    if (!tripId || !title || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide trip ID, title, and amount.',
      });
    }

    const trip = await Trip.findOne({ _id: tripId, userId: req.user._id });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized.' });
    }

    const numericAmount = Math.round(Number(amount) * 100) / 100;
    if (numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than zero.',
      });
    }

    // Process participant shares
    let processedParticipants = [];
    if (splitType === 'equal' && participants && participants.length > 0) {
      const count = participants.length;
      const share = Math.round((numericAmount / count) * 100) / 100;
      processedParticipants = participants.map((p) => ({
        friendId: p.friendId || null,
        name: p.name,
        shareAmount: share,
        isSettled: false,
      }));
    } else if (splitType === 'custom' && participants && participants.length > 0) {
      processedParticipants = participants.map((p) => ({
        friendId: p.friendId || null,
        name: p.name,
        shareAmount: Number(p.shareAmount) || 0,
        isSettled: false,
      }));
    }

    const expense = await Expense.create({
      tripId,
      userId: req.user._id,
      title,
      amount: numericAmount,
      category: category || 'Food',
      date: date || new Date(),
      payer: payer || { name: 'You' },
      splitType,
      participants: processedParticipants,
      status,
      notes,
    });

    res.status(201).json({
      success: true,
      data: expense,
      message: 'Expense recorded successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update existing expense
// @route   PUT /api/expenses/:id
// @access  Private
exports.updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found.' });
    }

    const {
      title,
      amount,
      category,
      date,
      payer,
      splitType,
      participants,
      status,
      notes,
    } = req.body;

    if (title !== undefined) expense.title = title;
    if (category !== undefined) expense.category = category;
    if (date !== undefined) expense.date = date;
    if (payer !== undefined) expense.payer = payer;
    if (status !== undefined) expense.status = status;
    if (notes !== undefined) expense.notes = notes;

    if (amount !== undefined) {
      expense.amount = Math.round(Number(amount) * 100) / 100;
    }

    if (splitType !== undefined) {
      expense.splitType = splitType;
    }

    if (participants !== undefined) {
      if (expense.splitType === 'equal' && participants.length > 0) {
        const share = Math.round((expense.amount / participants.length) * 100) / 100;
        expense.participants = participants.map((p) => ({
          friendId: p.friendId || null,
          name: p.name,
          shareAmount: share,
          isSettled: p.isSettled || false,
        }));
      } else {
        expense.participants = participants;
      }
    }

    await expense.save();

    res.status(200).json({
      success: true,
      data: expense,
      message: 'Expense updated successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found.' });
    }

    await Expense.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export trip expenses as CSV
// @route   GET /api/expenses/trip/:tripId/export-csv
// @access  Private
exports.exportExpensesCSV = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const trip = await Trip.findOne({ _id: tripId, userId: req.user._id });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    const expenses = await Expense.find({ tripId }).sort({ date: 1 });

    const headers = ['Date', 'Category', 'Description', 'Amount', 'Payer', 'Split With', 'Status', 'Notes'];
    const rows = expenses.map((e) => {
      const splitNames = (e.participants || []).map((p) => p.name).join('; ');
      return [
        `"${new Date(e.date).toISOString().split('T')[0]}"`,
        `"${e.category}"`,
        `"${(e.title || '').replace(/"/g, '""')}"`,
        `"${e.amount}"`,
        `"${e.payer?.name || 'You'}"`,
        `"${splitNames}"`,
        `"${e.status}"`,
        `"${(e.notes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="tripmate_${trip.title.replace(/\s+/g, '_')}_expenses.csv"`
    );
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

