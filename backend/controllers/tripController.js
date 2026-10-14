const Trip = require('../models/Trip');
const Expense = require('../models/Expense');
const Place = require('../models/Place');
const ItineraryActivity = require('../models/Itinerary');
const Playlist = require('../models/Playlist');
const { suggestBudgetAllocation } = require('../services/aiService');

// @desc    Get all trips for current user
// @route   GET /api/trips
// @access  Private
exports.getTrips = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = { userId: req.user._id };

    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
      ];
    }

    const trips = await Trip.find(query).sort({ startDate: 1 });

    // For each trip, compute actual total spent dynamically
    const tripsWithStats = await Promise.all(
      trips.map(async (trip) => {
        const tripObj = trip.toObject();
        const expenses = await Expense.find({ tripId: trip._id });
        const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
        tripObj.totalSpent = totalSpent;
        tripObj.remainingBudget = tripObj.totalBudget - totalSpent;
        tripObj.isOverbudget = totalSpent > tripObj.totalBudget;
        tripObj.overspentAmount = tripObj.isOverbudget ? totalSpent - tripObj.totalBudget : 0;
        tripObj.expenseCount = expenses.length;
        return tripObj;
      })
    );

    res.status(200).json({
      success: true,
      count: tripsWithStats.length,
      data: tripsWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single trip by ID with full financial metrics
// @route   GET /api/trips/:id
// @access  Private
exports.getTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    const tripObj = trip.toObject();

    // Fetch expenses to calculate dynamic totals
    const expenses = await Expense.find({ tripId: trip._id }).sort({ date: -1 });
    const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    // Calculate per-category actual spending
    const categorySpendingMap = {};
    expenses.forEach((e) => {
      const cat = e.category || 'Miscellaneous';
      categorySpendingMap[cat] = (categorySpendingMap[cat] || 0) + (Number(e.amount) || 0);
    });

    // Merge with planned category budgets
    const categoryAnalysis = (tripObj.categoryBudgets || []).map((cb) => {
      const actual = categorySpendingMap[cb.category] || 0;
      const planned = cb.plannedAmount || 0;
      const remaining = planned - actual;
      return {
        category: cb.category,
        description: cb.description,
        plannedAmount: planned,
        actualSpent: actual,
        remainingBalance: remaining,
        isOverspent: actual > planned,
        overspentAmount: actual > planned ? actual - planned : 0,
      };
    });

    // Check for categories spent but not in planned list
    Object.keys(categorySpendingMap).forEach((cat) => {
      if (!categoryAnalysis.some((ca) => ca.category.toLowerCase() === cat.toLowerCase())) {
        const actual = categorySpendingMap[cat];
        categoryAnalysis.push({
          category: cat,
          description: 'Unbudgeted category',
          plannedAmount: 0,
          actualSpent: actual,
          remainingBalance: -actual,
          isOverspent: true,
          overspentAmount: actual,
        });
      }
    });

    tripObj.totalSpent = totalSpent;
    tripObj.remainingBudget = tripObj.totalBudget - totalSpent;
    tripObj.isOverbudget = totalSpent > tripObj.totalBudget;
    tripObj.overspentAmount = tripObj.isOverbudget ? totalSpent - tripObj.totalBudget : 0;
    tripObj.categoryAnalysis = categoryAnalysis;
    tripObj.recentExpenses = expenses.slice(0, 5);

    res.status(200).json({
      success: true,
      data: tripObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new trip
// @route   POST /api/trips
// @access  Private
exports.createTrip = async (req, res, next) => {
  try {
    const {
      title,
      destination,
      startDate,
      endDate,
      totalBudget,
      numTravelers,
      friends,
      description,
      coverImage,
      travelStyle,
      categoryBudgets,
    } = req.body;

    if (!title || !destination || !startDate || !endDate || totalBudget === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide trip title, destination, dates, and total budget.',
      });
    }

    // Default category allocation if none provided
    let finalCategoryBudgets = categoryBudgets;
    if (!finalCategoryBudgets || finalCategoryBudgets.length === 0) {
      const suggested = suggestBudgetAllocation(
        Number(totalBudget),
        travelStyle || 'Moderate'
      );
      finalCategoryBudgets = suggested;
    }

    const trip = await Trip.create({
      userId: req.user._id,
      title,
      destination,
      startDate,
      endDate,
      totalBudget: Number(totalBudget),
      numTravelers: Number(numTravelers) || 1,
      friends: friends || [],
      description: description || '',
      coverImage:
        coverImage ||
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
      travelStyle: travelStyle || 'Moderate',
      categoryBudgets: finalCategoryBudgets,
      status: 'upcoming',
    });

    res.status(201).json({
      success: true,
      data: trip,
      message: 'Trip folder created successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Private
exports.updateTrip = async (req, res, next) => {
  try {
    let trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: trip,
      message: 'Trip updated successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Archive / unarchive trip
// @route   PATCH /api/trips/:id/archive
// @access  Private
exports.toggleArchiveTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    trip.status = trip.status === 'archived' ? 'upcoming' : 'archived';
    await trip.save();

    res.status(200).json({
      success: true,
      data: trip,
      message: `Trip ${trip.status === 'archived' ? 'archived' : 'restored'} successfully!`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete trip and cascade delete related data
// @route   DELETE /api/trips/:id
// @access  Private
exports.deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    // Cascade delete associated collections
    await Expense.deleteMany({ tripId: trip._id });
    await Place.deleteMany({ tripId: trip._id });
    await ItineraryActivity.deleteMany({ tripId: trip._id });
    await Playlist.deleteMany({ tripId: trip._id });
    await Trip.findByIdAndDelete(trip._id);

    res.status(200).json({
      success: true,
      message: 'Trip and all associated records deleted permanently.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard metrics for user
// @route   GET /api/trips/dashboard/summary
// @access  Private
exports.getDashboardSummary = async (req, res, next) => {
  try {
    const trips = await Trip.find({ userId: req.user._id }).sort({ startDate: 1 });
    const expenses = await Expense.find({ userId: req.user._id }).sort({ date: -1 });

    const totalTrips = trips.length;
    const totalPlannedBudget = trips.reduce((sum, t) => sum + (Number(t.totalBudget) || 0), 0);
    const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const totalRemaining = totalPlannedBudget - totalSpent;
    const isOverbudget = totalSpent > totalPlannedBudget;
    const overspentAmount = isOverbudget ? totalSpent - totalPlannedBudget : 0;

    // Upcoming trips (startDate >= today or status === upcoming)
    const now = new Date();
    const upcomingTrips = trips.filter((t) => t.status !== 'archived').slice(0, 4);

    // Recent expenses with trip info
    const recentExpenses = await Expense.find({ userId: req.user._id })
      .populate('tripId', 'title destination')
      .sort({ date: -1 })
      .limit(6);

    // Category breakdown across all trips
    const categoryTotals = {};
    expenses.forEach((e) => {
      const cat = e.category || 'Food';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(e.amount);
    });

    const categoryBreakdown = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
    }));

    res.status(200).json({
      success: true,
      data: {
        totalTrips,
        totalPlannedBudget,
        totalSpent,
        totalRemaining,
        isOverbudget,
        overspentAmount,
        upcomingTrips,
        recentExpenses,
        categoryBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

