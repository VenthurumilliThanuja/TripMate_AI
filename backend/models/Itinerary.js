const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    dayNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    date: {
      type: Date,
    },
    timeSlot: {
      type: String,
      enum: ['Morning', 'Afternoon', 'Evening', 'Night'],
      required: true,
      default: 'Morning',
    },
    time: {
      type: String,
      default: '09:00 AM',
    },
    title: {
      type: String,
      required: [true, 'Activity title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    estimatedCost: {
      type: Number,
      default: 0,
    },
    travelTime: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['Sightseeing', 'Meal', 'Rest/Free Time', 'Travel', 'Adventure', 'Shopping', 'Nightlife', 'Other'],
      default: 'Sightseeing',
    },
    budgetAlternative: {
      type: String,
      default: '',
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ItineraryActivity', activitySchema);

