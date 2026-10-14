const express = require('express');
const router = express.Router();
const {
  getTripPlaylists,
  createPlaylist,
  addSong,
  removeSong,
  deletePlaylist,
} = require('../controllers/musicController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/trip/:tripId', getTripPlaylists);
router.post('/playlists', createPlaylist);
router.delete('/playlists/:id', deletePlaylist);
router.post('/playlists/:id/songs', addSong);
router.delete('/playlists/:id/songs/:songId', removeSong);

module.exports = router;

