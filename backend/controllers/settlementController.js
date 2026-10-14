const Expense = require('../models/Expense');
const Trip = require('../models/Trip');
const { calculateSettlements } = require('../services/settlementService');

// @desc    Calculate trip expense settlements
// @route   GET /api/settlements/trip/:tripId
// @access  Private
exports.getTripSettlements = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const trip = await Trip.findOne({ _id: tripId, userId: req.user._id });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    const expenses = await Expense.find({ tripId });

    // Use settlement service
    const settlementData = calculateSettlements(
      expenses,
      trip.friends || [],
      req.user.name || 'You'
    );

    res.status(200).json({
      success: true,
      data: settlementData,
    });
  } catch (error) {
    next(error);
  }
};

