const Friend = require('../models/Friend');
const Trip = require('../models/Trip');

// @desc    Get all friends of current user
// @route   GET /api/friends
// @access  Private
exports.getFriends = async (req, res, next) => {
  try {
    const friends = await Friend.find({ userId: req.user._id }).sort({ name: 1 });

    // Calculate how many trips each friend has joined
    const trips = await Trip.find({ userId: req.user._id });
    const friendsWithTrips = friends.map((friend) => {
      const fObj = friend.toObject();
      const joinedTrips = trips.filter((t) =>
        (t.friends || []).some(
          (tf) => tf.friendId?.toString() === friend._id.toString() || tf.name === friend.name
        )
      );
      fObj.tripsCount = joinedTrips.length;
      fObj.tripsJoined = joinedTrips.map((t) => ({ id: t._id, title: t.title }));
      return fObj;
    });

    res.status(200).json({
      success: true,
      count: friendsWithTrips.length,
      data: friendsWithTrips,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add friend
// @route   POST /api/friends
// @access  Private
exports.createFriend = async (req, res, next) => {
  try {
    const { name, nickname, phone, email, avatar, isEmergencyContact, relationship, notes } =
      req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Please provide friend name.' });
    }

    const friend = await Friend.create({
      userId: req.user._id,
      name,
      nickname,
      phone,
      email,
      avatar,
      isEmergencyContact: Boolean(isEmergencyContact),
      relationship: relationship || 'Friend',
      notes,
    });

    res.status(201).json({
      success: true,
      data: friend,
      message: 'Friend added to your travel circle!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update friend details
// @route   PUT /api/friends/:id
// @access  Private
exports.updateFriend = async (req, res, next) => {
  try {
    let friend = await Friend.findOne({ _id: req.params.id, userId: req.user._id });
    if (!friend) {
      return res.status(404).json({ success: false, message: 'Friend not found.' });
    }

    friend = await Friend.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: friend,
      message: 'Friend contact updated!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete friend
// @route   DELETE /api/friends/:id
// @access  Private
exports.deleteFriend = async (req, res, next) => {
  try {
    const friend = await Friend.findOne({ _id: req.params.id, userId: req.user._id });
    if (!friend) {
      return res.status(404).json({ success: false, message: 'Friend not found.' });
    }

    await Friend.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Friend removed from your contacts.',
    });
  } catch (error) {
    next(error);
  }
};

