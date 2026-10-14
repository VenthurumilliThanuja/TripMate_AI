const express = require('express');
const router = express.Router();
const {
  getBudgetAdvice,
  getBudgetAllocation,
  getPlaceSuggestions,
  getItineraryGeneration,
  getGameSuggestions,
  getReceiptSuggestion,
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiter for AI routes to protect against abuse
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: {
    success: false,
    message: 'AI Assistant rate limit reached. Please wait a moment and try again.',
  },
});

router.use(protect);
router.use(aiLimiter);

router.post('/budget-advisor', getBudgetAdvice);
router.post('/suggest-budget-allocation', getBudgetAllocation);
router.post('/suggest-places', getPlaceSuggestions);
router.post('/generate-itinerary', getItineraryGeneration);
router.post('/suggest-games', getGameSuggestions);
router.post('/parse-receipt', getReceiptSuggestion);

module.exports = router;
