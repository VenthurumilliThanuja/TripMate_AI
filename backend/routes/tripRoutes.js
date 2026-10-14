const express = require('express');
const router = express.Router();
const {
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  toggleArchiveTrip,
  deleteTrip,
  getDashboardSummary,
} = require('../controllers/tripController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard/summary', getDashboardSummary);
router.route('/').get(getTrips).post(createTrip);
router.route('/:id').get(getTrip).put(updateTrip).delete(deleteTrip);
router.patch('/:id/archive', toggleArchiveTrip);

module.exports = router;

