const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null for system preset games
    },
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Game title is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['indoor', 'outdoor', 'car journey', 'party'],
      required: true,
      default: 'party',
    },
    minPlayers: {
      type: Number,
      default: 2,
    },
    maxPlayers: {
      type: Number,
      default: 20,
    },
    durationMinutes: {
      type: Number,
      default: 30,
    },
    rules: {
      type: String,
      required: [true, 'Rules are required'],
    },
    materialsNeeded: {
      type: String,
      default: 'None (No internet required)',
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    isPlayed: {
      type: Boolean,
      default: false,
    },
    isPreset: {
      type: Boolean,
      default: false,
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

module.exports = mongoose.model('Game', gameSchema);

