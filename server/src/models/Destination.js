import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    country: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    region: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    categories: {
      type: [String],
      default: [],
      index: true
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    imageReferences: {
      type: [String],
      default: []
    },
    externalId: {
      type: String,
      default: null
    },
    source: {
      type: String,
      default: 'SEEDED'
    },
    recommendedDurationDays: {
      type: Number,
      default: 3
    },
    averageCostPerDayMinor: {
      type: Number,
      default: 15000 // $150.00
    }
  },
  {
    timestamps: true
  }
);

destinationSchema.index({ name: 'text', country: 'text', description: 'text' });

export const Destination = mongoose.model('Destination', destinationSchema);
