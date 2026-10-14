const express = require('express');
const router = express.Router();
const { getTripSettlements } = require('../controllers/settlementController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/trip/:tripId', getTripSettlements);

module.exports = router;

