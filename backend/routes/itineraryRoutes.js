const express = require('express');
const router = express.Router();
const {
  getTripItinerary,
  createActivity,
  updateActivity,
  deleteActivity,
  batchSaveItinerary,
} = require('../controllers/itineraryController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/trip/:tripId', getTripItinerary);
router.post('/batch', batchSaveItinerary);
router.route('/').post(createActivity);
router.route('/:id').put(updateActivity).delete(deleteActivity);

module.exports = router;

