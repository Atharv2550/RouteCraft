import { Comment } from '../models/Comment.js';
import { logActivityAndNotify } from '../services/activityLogger.js';
import { emitToTrip } from '../services/socketService.js';

export async function getComments(req, res, next) {
  try {
    const trip = req.trip;
    const { itemId } = req.query;

    const query = { trip: trip._id, isDeleted: false };
    if (itemId) {
      query.itineraryItem = itemId;
    }

    const comments = await Comment.find(query)
      .populate('author', 'name avatarUrl email')
      .populate('itineraryItem', 'title')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      comments
    });
  } catch (err) {
    next(err);
  }
}

export async function createComment(req, res, next) {
  try {
    const trip = req.trip;
    const { content, itineraryItemId } = req.body;

    const comment = await Comment.create({
      trip: trip._id,
      itineraryItem: itineraryItemId || null,
      author: req.user._id,
      content
    });

    const populated = await Comment.findById(comment._id)
      .populate('author', 'name avatarUrl email')
      .populate('itineraryItem', 'title');

    await logActivityAndNotify({
      tripId: trip._id,
      actor: req.user,
      action: 'COMMENT_ADDED',
      resourceType: 'COMMENT',
      resourceId: comment._id,
      summary: `${req.user.name} posted a comment: "${content.slice(0, 40)}${content.length > 40 ? '...' : ''}"`,
      notificationTitle: 'New Trip Comment'
    });

    emitToTrip(trip._id, 'comment:created', populated);

    return res.status(201).json({
      success: true,
      comment: populated
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteComment(req, res, next) {
  try {
    const trip = req.trip;
    const { commentId } = req.params;
    const currentUserId = req.user._id.toString();

    const comment = await Comment.findOne({ _id: commentId, trip: trip._id });
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const isAuthor = comment.author.toString() === currentUserId;
    const isOwner = trip.owner.toString() === currentUserId;

    if (!isAuthor && !isOwner) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this comment' });
    }

    comment.isDeleted = true;
    await comment.save();

    emitToTrip(trip._id, 'comment:deleted', { commentId });

    return res.status(200).json({
      success: true,
      message: 'Comment deleted'
    });
  } catch (err) {
    next(err);
  }
}
