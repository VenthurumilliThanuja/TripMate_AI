const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: [true, 'Place name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Tourist attractions',
        'Beaches',
        'Restaurants and cafes',
        'Historical places',
        'Shopping',
        'Nature and adventure',
        'Hidden gems',
        'Free attractions',
        'Other',
      ],
      default: 'Tourist attractions',
    },
    address: {
      type: String,
      default: '',
    },
    estimatedCost: {
      type: Number,
      default: 0,
    },
    openingHours: {
      type: String,
      default: '9:00 AM - 6:00 PM',
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    isVisited: {
      type: Boolean,
      default: false,
    },
    isWishlist: {
      type: Boolean,
      default: true,
    },
    dayNumber: {
      type: Number,
      default: null,
    },
    googleMapsUrl: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    suggestedDuration: {
      type: String,
      default: '1-2 hours',
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Place', placeSchema);

