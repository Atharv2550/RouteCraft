import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Reservation title is required'],
      trim: true,
      maxlength: 120
    },
    type: {
      type: String,
      enum: ['HOTEL', 'FLIGHT', 'TRAIN', 'BUS', 'CAR_RENTAL', 'RESTAURANT', 'ACTIVITY', 'OTHER'],
      required: true,
      default: 'HOTEL'
    },
    providerName: {
      type: String,
      required: [true, 'Provider name is required'],
      trim: true
    },
    bookingReference: {
      type: String,
      default: '',
      trim: true
    },
    startDateTime: {
      type: Date,
      required: [true, 'Start date/time is required']
    },
    endDateTime: {
      type: Date,
      default: null
    },
    location: {
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
    costMinor: {
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
    externalUrl: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: ['CONFIRMED', 'TENTATIVE', 'CANCELLED'],
      default: 'CONFIRMED'
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

reservationSchema.index({ trip: 1, startDateTime: 1 });

export const Reservation = mongoose.model('Reservation', reservationSchema);
