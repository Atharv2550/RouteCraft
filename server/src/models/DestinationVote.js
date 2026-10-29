import mongoose from 'mongoose';

const destinationVoteSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      default: null
    },
    destinationName: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      default: '',
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    imageUrl: {
      type: String,
      default: ''
    },
    proposedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['OPEN', 'CLOSED'],
      default: 'OPEN'
    },
    isSelected: {
      type: Boolean,
      default: false
    },
    votes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        votedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

export const DestinationVote = mongoose.model('DestinationVote', destinationVoteSchema);
