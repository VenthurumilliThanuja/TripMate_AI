const Place = require('../models/Place');
const Trip = require('../models/Trip');

// @desc    Get all places for a trip
// @route   GET /api/places/trip/:tripId
// @access  Private
exports.getTripPlaces = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { category, isVisited, isWishlist, dayNumber, search } = req.query;

    const query = { tripId, userId: req.user._id };

    if (category && category !== 'All') {
      query.category = category;
    }
    if (isVisited !== undefined && isVisited !== '') {
      query.isVisited = isVisited === 'true';
    }
    if (isWishlist !== undefined && isWishlist !== '') {
      query.isWishlist = isWishlist === 'true';
    }
    if (dayNumber) {
      query.dayNumber = Number(dayNumber);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    const places = await Place.find(query).sort({ priority: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: places.length,
      data: places,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add place to trip
// @route   POST /api/places
// @access  Private
exports.createPlace = async (req, res, next) => {
  try {
    const {
      tripId,
      name,
      category,
      address,
      estimatedCost,
      openingHours,
      priority,
      isWishlist,
      dayNumber,
      googleMapsUrl,
      notes,
      imageUrl,
      suggestedDuration,
      aiGenerated,
    } = req.body;

    if (!tripId || !name) {
      return res.status(400).json({ success: false, message: 'Trip ID and place name are required.' });
    }

    const mapUrl =
      googleMapsUrl ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${address || ''}`)}`;

    const place = await Place.create({
      tripId,
      userId: req.user._id,
      name,
      category: category || 'Tourist attractions',
      address: address || '',
      estimatedCost: Number(estimatedCost) || 0,
      openingHours: openingHours || '9:00 AM - 6:00 PM',
      priority: priority || 'Medium',
      isVisited: false,
      isWishlist: isWishlist !== undefined ? isWishlist : true,
      dayNumber: dayNumber ? Number(dayNumber) : null,
      googleMapsUrl: mapUrl,
      notes: notes || '',
      imageUrl:
        imageUrl ||
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      suggestedDuration: suggestedDuration || '1-2 hours',
      aiGenerated: Boolean(aiGenerated),
    });

    res.status(201).json({
      success: true,
      data: place,
      message: 'Place added to your trip list!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update place details or toggle visited
// @route   PUT /api/places/:id
// @access  Private
exports.updatePlace = async (req, res, next) => {
  try {
    let place = await Place.findOne({ _id: req.params.id, userId: req.user._id });
    if (!place) {
      return res.status(404).json({ success: false, message: 'Place not found.' });
    }

    place = await Place.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: place,
      message: 'Place details updated!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete place
// @route   DELETE /api/places/:id
// @access  Private
exports.deletePlace = async (req, res, next) => {
  try {
    const place = await Place.findOne({ _id: req.params.id, userId: req.user._id });
    if (!place) {
      return res.status(404).json({ success: false, message: 'Place not found.' });
    }

    await Place.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Place removed from trip.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Batch save places (e.g. from AI suggestions)
// @route   POST /api/places/batch
// @access  Private
exports.batchAddPlaces = async (req, res, next) => {
  try {
    const { tripId, places } = req.body;
    if (!tripId || !Array.isArray(places) || places.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide tripId and places list.' });
    }

    const docs = places.map((p) => ({
      ...p,
      tripId,
      userId: req.user._id,
      googleMapsUrl:
        p.googleMapsUrl ||
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name)}`,
      aiGenerated: true,
    }));

    const inserted = await Place.insertMany(docs);

    res.status(201).json({
      success: true,
      count: inserted.length,
      data: inserted,
      message: `${inserted.length} places successfully saved to trip!`,
    });
  } catch (error) {
    next(error);
  }
};

