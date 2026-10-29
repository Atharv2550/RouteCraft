import mongoose from 'mongoose';

const settlementSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true
    },
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amountMinor: {
      type: Number,
      required: true,
      min: [1, 'Settlement amount must be positive']
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true,
      uppercase: true
    },
    status: {
      type: String,
      enum: ['SUGGESTED', 'RECORDED', 'COMPLETED'],
      default: 'SUGGESTED',
      index: true
    },
    notes: {
      type: String,
      default: ''
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

settlementSchema.index({ trip: 1, status: 1 });

export const Settlement = mongoose.model('Settlement', settlementSchema);
