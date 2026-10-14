const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Trip title is required'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    totalBudget: {
      type: Number,
      required: [true, 'Total budget is required'],
      min: [0, 'Budget must be a positive number'],
    },
    numTravelers: {
      type: Number,
      default: 1,
      min: [1, 'Number of travelers must be at least 1'],
    },
    friends: [
      {
        friendId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Friend',
        },
        name: {
          type: String,
          required: true,
        },
        phone: String,
        email: String,
      },
    ],
    description: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
    },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'completed', 'archived'],
      default: 'upcoming',
    },
    travelStyle: {
      type: String,
      enum: ['Budget', 'Moderate', 'Luxury', 'Backpacker', 'Adventure'],
      default: 'Moderate',
    },
    categoryBudgets: [
      {
        category: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          default: '',
        },
        plannedAmount: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Virtual for duration in days
tripSchema.virtual('durationDays').get(function () {
  if (this.startDate && this.endDate) {
    const diff = new Date(this.endDate) - new Date(this.startDate);
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  }
  return 1;
});

tripSchema.set('toJSON', { virtuals: true });
tripSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Trip', tripSchema);

