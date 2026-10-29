import mongoose from 'mongoose';

const itineraryItemSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true
    },
    day: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ItineraryDay',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Activity title is required'],
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    locationName: {
      type: String,
      default: '',
      trim: true
    },
    latitude: {
      type: Number,
      default: null
    },
    longitude: {
      type: Number,
      default: null
    },
    startTime: {
      type: String, // HH:mm format, e.g. "09:00"
      default: null
    },
    endTime: {
      type: String, // HH:mm format, e.g. "11:30"
      default: null
    },
    durationMinutes: {
      type: Number,
      default: 60
    },
    estimatedCostMinor: {
      type: Number,
      default: 0,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true,
      uppercase: true
    },
    category: {
      type: String,
      enum: ['sightseeing', 'culture', 'nature', 'food', 'accommodation', 'transport', 'shopping', 'entertainment', 'other'],
      default: 'sightseeing'
    },
    status: {
      type: String,
      enum: ['PLANNED', 'COMPLETED', 'SKIPPED'],
      default: 'PLANNED'
    },
    displayOrder: {
      type: Number,
      default: 0
    },
    isFixedTime: {
      type: Boolean,
      default: false
    },
    notes: {
      type: String,
      default: ''
    },
    externalUrl: {
      type: String,
      default: '',
      trim: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

itineraryItemSchema.index({ day: 1, displayOrder: 1 });

export const ItineraryItem = mongoose.model('ItineraryItem', itineraryItemSchema);
