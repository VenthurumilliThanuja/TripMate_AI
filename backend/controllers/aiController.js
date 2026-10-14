const Trip = require('../models/Trip');
const Expense = require('../models/Expense');
const {
  analyzeBudget,
  suggestBudgetAllocation,
  suggestPlaces,
  generateItinerary,
  suggestGames,
  parseReceipt,
} = require('../services/aiService');

// @desc    Analyze budget and provide recommendations
// @route   POST /api/ai/budget-advisor
// @access  Private
exports.getBudgetAdvice = async (req, res, next) => {
  try {
    const {
      tripId,
      totalBudget: inputBudget,
      totalSpent: inputSpent,
      destination: inputDest,
      durationDays: inputDays,
      numTravelers: inputTravelers,
      travelStyle: inputStyle,
    } = req.body;

    let totalBudget = Number(inputBudget) || 0;
    let totalSpent = Number(inputSpent) || 0;
    let destination = inputDest || 'Your Destination';
    let durationDays = Number(inputDays) || 3;
    let numTravelers = Number(inputTravelers) || 2;
    let travelStyle = inputStyle || 'Moderate';
    let categoryBreakdown = [];

    // If tripId is provided, pull real database values to ensure truthfulness!
    if (tripId) {
      const trip = await Trip.findOne({ _id: tripId, userId: req.user._id });
      if (trip) {
        totalBudget = trip.totalBudget;
        destination = trip.destination;
        durationDays = trip.durationDays || 3;
        numTravelers = trip.numTravelers || 2;
        travelStyle = trip.travelStyle || 'Moderate';

        const expenses = await Expense.find({ tripId });
        totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

        const spendingMap = {};
        expenses.forEach((e) => {
          spendingMap[e.category] = (spendingMap[e.category] || 0) + Number(e.amount);
        });

        categoryBreakdown = (trip.categoryBudgets || []).map((cb) => ({
          category: cb.category,
          planned: cb.plannedAmount || 0,
          spent: spendingMap[cb.category] || 0,
        }));
      }
    }

    const remainingBudget = totalBudget - totalSpent;

    const analysis = await analyzeBudget({
      totalBudget,
      totalSpent,
      remainingBudget,
      destination,
      durationDays,
      numTravelers,
      travelStyle,
      categoryBreakdown,
    });

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Suggest category allocations for new budget
// @route   POST /api/ai/suggest-budget-allocation
// @access  Private
exports.getBudgetAllocation = async (req, res, next) => {
  try {
    const { totalBudget, travelStyle, durationDays } = req.body;
    if (!totalBudget) {
      return res.status(400).json({ success: false, message: 'Total budget is required.' });
    }

    const allocation = suggestBudgetAllocation(
      Number(totalBudget),
      travelStyle || 'Moderate',
      Number(durationDays) || 3
    );

    res.status(200).json({
      success: true,
      data: allocation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Places Discovery
// @route   POST /api/ai/suggest-places
// @access  Private
exports.getPlaceSuggestions = async (req, res, next) => {
  try {
    const { destination, travelStyle, interests, budget } = req.body;
    if (!destination) {
      return res.status(400).json({ success: false, message: 'Destination is required.' });
    }

    const places = await suggestPlaces({
      destination,
      travelStyle: travelStyle || 'Moderate',
      interests: interests || [],
      budget: Number(budget) || 10000,
    });

    res.status(200).json({
      success: true,
      data: places,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Day-wise Itinerary Generator
// @route   POST /api/ai/generate-itinerary
// @access  Private
exports.getItineraryGeneration = async (req, res, next) => {
  try {
    const {
      destination,
      durationDays,
      budget,
      numTravelers,
      interests,
      travelPreferences,
      preferredPace,
      transportation,
    } = req.body;

    if (!destination) {
      return res.status(400).json({ success: false, message: 'Destination is required.' });
    }

    const itinerary = await generateItinerary({
      destination,
      durationDays: Number(durationDays) || 3,
      budget: Number(budget) || 15000,
      numTravelers: Number(numTravelers) || 2,
      interests: interests || ['Sightseeing', 'Food'],
      travelPreferences: travelPreferences || 'Balanced',
      preferredPace: preferredPace || 'Moderate',
      transportation: transportation || 'Cab & Walking',
    });

    res.status(200).json({
      success: true,
      data: itinerary,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Group Games Suggestions
// @route   POST /api/ai/suggest-games
// @access  Private
exports.getGameSuggestions = async (req, res, next) => {
  try {
    const { numPlayers, category, setting, vibe } = req.body;

    const games = await suggestGames({
      numPlayers: Number(numPlayers) || 4,
      category: category || 'party',
      setting: setting || 'indoor',
      vibe: vibe || 'fun',
    });

    res.status(200).json({
      success: true,
      data: games,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Extract expense suggestions from a receipt image
// @route   POST /api/ai/parse-receipt
// @access  Private
exports.getReceiptSuggestion = async (req, res, next) => {
  try {
    const { imageBase64, mimeType } = req.body;
    const supportedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!imageBase64 || typeof imageBase64 !== 'string' || !mimeType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a receipt image.',
      });
    }
    if (!supportedMimeTypes.includes(mimeType)) {
      return res.status(400).json({
        success: false,
        message: 'Receipt images must be JPEG, PNG, or WebP.',
      });
    }
    if (imageBase64.length > 7_000_000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(imageBase64)) {
      return res.status(400).json({
        success: false,
        message: 'Receipt image is invalid or exceeds the 5 MB limit.',
      });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'Receipt scanning requires a configured Gemini API key.',
      });
    }

    const suggestion = await parseReceipt({ imageBase64, mimeType });
    if (!suggestion) {
      return res.status(502).json({
        success: false,
        message: 'Could not read the receipt. Try a clearer image or enter the details manually.',
      });
    }

    res.status(200).json({
      success: true,
      data: suggestion,
      message: 'Receipt details extracted. Review them before saving.',
    });
  } catch (error) {
    next(error);
  }
};
