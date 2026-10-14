const express = require('express');
const router = express.Router();
const {
  getTripPlaces,
  createPlace,
  updatePlace,
  deletePlace,
  batchAddPlaces,
} = require('../controllers/placeController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/trip/:tripId', getTripPlaces);
router.post('/batch', batchAddPlaces);
router.route('/').post(createPlace);
router.route('/:id').put(updatePlace).delete(deletePlace);

module.exports = router;

