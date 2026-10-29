import mongoose from 'mongoose';

const tripMemberSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    invitedEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: null
    },
    role: {
      type: String,
      enum: ['OWNER', 'EDITOR', 'VIEWER'],
      required: true,
      default: 'VIEWER'
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INVITED', 'DECLINED'],
      default: 'INVITED'
    },
    invitationToken: {
      type: String,
      default: null,
      index: true
    },
    invitationExpiresAt: {
      type: Date,
      default: null
    },
    joinedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate active membership for the same user in a trip
tripMemberSchema.index({ trip: 1, user: 1 }, { unique: true, partialFilterExpression: { user: { $exists: true, $ne: null } } });

export const TripMember = mongoose.model('TripMember', tripMemberSchema);
