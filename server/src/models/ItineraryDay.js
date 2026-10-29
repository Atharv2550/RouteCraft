import mongoose from 'mongoose';

const itineraryDaySchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true
    },
    date: {
      type: Date,
      required: true
    },
    dayNumber: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      default: '',
      trim: true
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

itineraryDaySchema.index({ trip: 1, dayNumber: 1 }, { unique: true });

export const ItineraryDay = mongoose.model('ItineraryDay', itineraryDaySchema);
