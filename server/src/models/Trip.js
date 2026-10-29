import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Trip title is required'],
      trim: true,
      maxlength: 120
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: 1000
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    destinations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Destination'
      }
    ],
    primaryDestinationName: {
      type: String,
      default: ''
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3
    },
    totalBudgetMinor: {
      type: Number,
      default: 0,
      min: 0
    },
    dailyBudgetMinor: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ['PLANNING', 'ACTIVE', 'COMPLETED', 'ARCHIVED'],
      default: 'PLANNING',
      index: true
    },
    coverImageUrl: {
      type: String,
      default: ''
    },
    visibility: {
      type: String,
      enum: ['PRIVATE', 'SHARED'],
      default: 'PRIVATE'
    },
    preferences: {
      travelStyle: {
        type: String,
        enum: ['BALANCED', 'BUDGET', 'LUXURY', 'FAST_PACED', 'RELAXED'],
        default: 'BALANCED'
      },
      interests: {
        type: [String],
        default: []
      }
    },
    revision: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
);

tripSchema.index({ owner: 1, startDate: -1 });

export const Trip = mongoose.model('Trip', tripSchema);
