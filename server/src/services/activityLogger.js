import { ActivityLog } from '../models/ActivityLog.js';
import { Notification } from '../models/Notification.js';
import { TripMember } from '../models/TripMember.js';
import { Trip } from '../models/Trip.js';
import { emitToTrip } from './socketService.js';
import { logger } from '../utils/logger.js';

export async function logActivityAndNotify({
  tripId,
  actor,
  action,
  resourceType,
  resourceId = null,
  summary,
  notificationTitle,
  notificationType = 'ITINERARY_UPDATE',
  metadata = {}
}) {
  try {
    // 1. Save ActivityLog
    const log = await ActivityLog.create({
      trip: tripId,
      actor: actor._id,
      action,
      resourceType,
      resourceId,
      summary,
      metadata
    });

    // 2. Identify all trip members to notify (exclude the actor themselves)
    const trip = await Trip.findById(tripId);
    if (!trip) return;

    const activeMembers = await TripMember.find({
      trip: tripId,
      status: 'ACTIVE',
      user: { $ne: null }
    });

    const recipientUserIds = new Set();
    // Add owner if owner is not the actor
    if (trip.owner.toString() !== actor._id.toString()) {
      recipientUserIds.add(trip.owner.toString());
    }
    // Add active members
    activeMembers.forEach((m) => {
      const uid = m.user.toString();
      if (uid !== actor._id.toString()) {
        recipientUserIds.add(uid);
      }
    });

    // Create notifications for each recipient
    if (notificationTitle && recipientUserIds.size > 0) {
      const notifs = Array.from(recipientUserIds).map((userId) => ({
        recipient: userId,
        type: notificationType,
        title: notificationTitle,
        message: summary,
        relatedTrip: tripId,
        relatedResource: {
          resourceType,
          resourceId
        }
      }));
      await Notification.insertMany(notifs);
    }

    // 3. Emit real-time socket event to the trip room
    emitToTrip(tripId, `activity:${action.toLowerCase()}`, {
      logId: log._id,
      action,
      resourceType,
      summary,
      actor: {
        _id: actor._id,
        name: actor.name,
        avatarUrl: actor.avatarUrl
      },
      createdAt: log.createdAt
    });
  } catch (err) {
    logger.error(`Failed to log activity: ${err.message}`);
  }
}
