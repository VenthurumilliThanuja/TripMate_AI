const express = require('express');
const router = express.Router();
const {
  getGames,
  createGame,
  updateGame,
  deleteGame,
  pickRandomGame,
} = require('../controllers/gameController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/random-picker', pickRandomGame);
router.route('/').get(getGames).post(createGame);
router.route('/:id').put(updateGame).delete(deleteGame);

module.exports = router;

