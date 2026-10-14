const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Friend name is required'],
      trim: true,
    },
    nickname: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    isEmergencyContact: {
      type: Boolean,
      default: false,
    },
    relationship: {
      type: String,
      default: 'Friend',
      enum: ['Friend', 'Family', 'Colleague', 'Partner', 'Travel Buddy'],
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Friend', friendSchema);

