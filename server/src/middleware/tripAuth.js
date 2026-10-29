import { Trip } from '../models/Trip.js';
import { TripMember } from '../models/TripMember.js';

export function authorizeTrip(allowedRoles = ['OWNER', 'EDITOR', 'VIEWER']) {
  return async (req, res, next) => {
    try {
      const tripId = req.params.tripId || req.body.tripId;

      if (!tripId) {
        return res.status(400).json({
          success: false,
          message: 'Trip ID parameter is missing'
        });
      }

      const trip = await Trip.findById(tripId);
      if (!trip) {
        return res.status(404).json({
          success: false,
          message: 'Trip not found'
        });
      }

      const currentUserId = req.user._id.toString();

      // Check if user is trip owner
      if (trip.owner.toString() === currentUserId) {
        req.trip = trip;
        req.tripMemberRole = 'OWNER';
        return next();
      }

      // Check TripMember collection for membership
      const member = await TripMember.findOne({
        trip: trip._id,
        user: req.user._id,
        status: 'ACTIVE'
      });

      if (!member) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not a member of this trip.'
        });
      }

      if (!allowedRoles.includes(member.role)) {
        return res.status(403).json({
          success: false,
          message: `Forbidden. Action requires role: ${allowedRoles.join(' or ')}. Your role is: ${member.role}.`
        });
      }

      req.trip = trip;
      req.tripMemberRole = member.role;
      req.tripMember = member;
      next();
    } catch (err) {
      next(err);
    }
  };
}
