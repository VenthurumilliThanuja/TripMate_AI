const express = require('express');
const router = express.Router();
const {
  getFriends,
  createFriend,
  updateFriend,
  deleteFriend,
} = require('../controllers/friendController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getFriends).post(createFriend);
router.route('/:id').put(updateFriend).delete(deleteFriend);

module.exports = router;

