import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true
    },
    itineraryItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ItineraryItem',
      default: null,
      index: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: 1000
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

commentSchema.index({ trip: 1, createdAt: 1 });

export const Comment = mongoose.model('Comment', commentSchema);
