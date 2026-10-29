import mongoose from 'mongoose';

const shareSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amountMinor: {
      type: Number,
      required: true,
      min: 0
    },
    percentage: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const expenseSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
      maxlength: 120
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    amountMinor: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be greater than zero']
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true,
      uppercase: true
    },
    category: {
      type: String,
      enum: ['accommodation', 'food', 'transport', 'activities', 'shopping', 'other'],
      default: 'other',
      index: true
    },
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Payer is required'],
      index: true
    },
    expenseDate: {
      type: Date,
      default: Date.now
    },
    splitMethod: {
      type: String,
      enum: ['EQUAL', 'EXACT', 'PERCENTAGE'],
      default: 'EQUAL'
    },
    shares: {
      type: [shareSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one participant share is required'
      }
    },
    notes: {
      type: String,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

expenseSchema.index({ trip: 1, expenseDate: -1 });

export const Expense = mongoose.model('Expense', expenseSchema);
