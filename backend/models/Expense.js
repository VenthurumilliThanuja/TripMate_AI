const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema(
  {
    friendId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Friend',
    },
    name: {
      type: String,
      required: true,
    },
    shareAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    isSettled: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const expenseSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: [true, 'Expense description/title is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      default: 'Food',
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    payer: {
      friendId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Friend',
      },
      name: {
        type: String,
        required: [true, 'Payer name is required'],
        default: 'You',
      },
    },
    splitType: {
      type: String,
      enum: ['equal', 'custom', 'none'],
      default: 'equal',
    },
    participants: [participantSchema],
    status: {
      type: String,
      enum: ['paid', 'pending'],
      default: 'paid',
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

module.exports = mongoose.model('Expense', expenseSchema);

