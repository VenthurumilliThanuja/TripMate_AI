const ItineraryActivity = require('../models/Itinerary');
const Trip = require('../models/Trip');

// @desc    Get all itinerary activities for a trip grouped by day
// @route   GET /api/itineraries/trip/:tripId
// @access  Private
exports.getTripItinerary = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const activities = await ItineraryActivity.find({ tripId, userId: req.user._id }).sort({
      dayNumber: 1,
      timeSlot: 1,
      time: 1,
    });

    // Group activities by dayNumber
    const dayGroups = {};
    activities.forEach((act) => {
      const day = act.dayNumber || 1;
      if (!dayGroups[day]) {
        dayGroups[day] = [];
      }
      dayGroups[day].push(act);
    });

    res.status(200).json({
      success: true,
      data: activities,
      grouped: dayGroups,
      totalActivities: activities.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add single activity to itinerary
// @route   POST /api/itineraries
// @access  Private
exports.createActivity = async (req, res, next) => {
  try {
    const {
      tripId,
      dayNumber,
      timeSlot,
      time,
      title,
      description,
      location,
      estimatedCost,
      travelTime,
      category,
      budgetAlternative,
    } = req.body;

    if (!tripId || !title || !dayNumber) {
      return res.status(400).json({
        success: false,
        message: 'Trip ID, title, and day number are required.',
      });
    }

    const activity = await ItineraryActivity.create({
      tripId,
      userId: req.user._id,
      dayNumber: Number(dayNumber),
      timeSlot: timeSlot || 'Morning',
      time: time || '09:00 AM',
      title,
      description: description || '',
      location: location || '',
      estimatedCost: Number(estimatedCost) || 0,
      travelTime: travelTime || '',
      category: category || 'Sightseeing',
      budgetAlternative: budgetAlternative || '',
    });

    res.status(201).json({
      success: true,
      data: activity,
      message: 'Activity added to itinerary!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update activity
// @route   PUT /api/itineraries/:id
// @access  Private
exports.updateActivity = async (req, res, next) => {
  try {
    let activity = await ItineraryActivity.findOne({ _id: req.params.id, userId: req.user._id });
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found.' });
    }

    activity = await ItineraryActivity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: activity,
      message: 'Activity updated!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete activity
// @route   DELETE /api/itineraries/:id
// @access  Private
exports.deleteActivity = async (req, res, next) => {
  try {
    const activity = await ItineraryActivity.findOne({ _id: req.params.id, userId: req.user._id });
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found.' });
    }

    await ItineraryActivity.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Activity removed from itinerary.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Batch save AI-generated day-wise itinerary
// @route   POST /api/itineraries/batch
// @access  Private
exports.batchSaveItinerary = async (req, res, next) => {
  try {
    const { tripId, days, replaceExisting } = req.body;
    if (!tripId || !Array.isArray(days)) {
      return res.status(400).json({ success: false, message: 'Please provide tripId and days array.' });
    }

    if (replaceExisting) {
      await ItineraryActivity.deleteMany({ tripId, userId: req.user._id });
    }

    const flatActivities = [];
    days.forEach((day) => {
      const dayNum = Number(day.dayNumber) || 1;
      (day.activities || []).forEach((act) => {
        flatActivities.push({
          ...act,
          tripId,
          userId: req.user._id,
          dayNumber: dayNum,
          estimatedCost: Number(act.estimatedCost) || 0,
        });
      });
    });

    const inserted = await ItineraryActivity.insertMany(flatActivities);

    res.status(201).json({
      success: true,
      count: inserted.length,
      data: inserted,
      message: `Itinerary with ${inserted.length} activities created successfully!`,
    });
  } catch (error) {
    next(error);
  }
};

