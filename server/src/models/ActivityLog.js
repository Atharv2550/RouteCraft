import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      required: true
    },
    resourceType: {
      type: String,
      enum: ['TRIP', 'ITINERARY', 'EXPENSE', 'SETTLEMENT', 'MEMBER', 'VOTE', 'RESERVATION', 'COMMENT'],
      required: true
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    summary: {
      type: String,
      required: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

activityLogSchema.index({ trip: 1, createdAt: -1 });

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
