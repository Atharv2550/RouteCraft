import { Reservation } from '../models/Reservation.js';
import { toMinorUnits } from '../utils/moneyMath.js';
import { logActivityAndNotify } from '../services/activityLogger.js';
import { emitToTrip } from '../services/socketService.js';

export async function getReservations(req, res, next) {
  try {
    const trip = req.trip;

    const reservations = await Reservation.find({ trip: trip._id })
      .populate('createdBy', 'name')
      .sort({ startDateTime: 1 });

    return res.status(200).json({
      success: true,
      reservations
    });
  } catch (err) {
    next(err);
  }
}

export async function createReservation(req, res, next) {
  try {
    const trip = req.trip;
    const {
      title,
      type,
      providerName,
      bookingReference,
      startDateTime,
      endDateTime,
      location,
      latitude,
      longitude,
      cost,
      currency,
      externalUrl,
      status,
      notes
    } = req.body;

    const start = new Date(startDateTime);
    const end = endDateTime ? new Date(endDateTime) : null;

    // Check for schedule conflicts with existing reservations
    const conflicts = [];
    if (end) {
      const overlapping = await Reservation.find({
        trip: trip._id,
        status: { $ne: 'CANCELLED' },
        $or: [
          { startDateTime: { $lte: end }, endDateTime: { $gte: start } },
          { startDateTime: { $gte: start, $lte: end } }
        ]
      });
      if (overlapping.length > 0) {
        conflicts.push(`Timing overlaps with ${overlapping.length} existing booking(s): "${overlapping.map(o => o.title).join('", "')}".`);
      }
    }

    const reservation = await Reservation.create({
      trip: trip._id,
      title,
      type: type || 'HOTEL',
      providerName,
      bookingReference: bookingReference || '',
      startDateTime: start,
      endDateTime: end,
      location: location || '',
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      costMinor: toMinorUnits(cost || 0),
      currency: currency || trip.currency || 'USD',
      externalUrl: externalUrl || '',
      status: status || 'CONFIRMED',
      notes: notes || '',
      createdBy: req.user._id
    });

    await logActivityAndNotify({
      tripId: trip._id,
      actor: req.user,
      action: 'RESERVATION_ADDED',
      resourceType: 'RESERVATION',
      resourceId: reservation._id,
      summary: `${req.user.name} added reservation: [${reservation.type}] ${reservation.title} (${reservation.providerName}).`,
      notificationTitle: 'New Booking Added'
    });

    emitToTrip(trip._id, 'reservation:created', reservation);

    return res.status(201).json({
      success: true,
      message: 'Reservation recorded successfully',
      reservation,
      conflicts
    });
  } catch (err) {
    next(err);
  }
}

export async function updateReservation(req, res, next) {
  try {
    const trip = req.trip;
    const { reservationId } = req.params;

    const reservation = await Reservation.findOne({ _id: reservationId, trip: trip._id });
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    const {
      title,
      type,
      providerName,
      bookingReference,
      startDateTime,
      endDateTime,
      location,
      latitude,
      longitude,
      cost,
      currency,
      externalUrl,
      status,
      notes
    } = req.body;

    if (title !== undefined) reservation.title = title;
    if (type !== undefined) reservation.type = type;
    if (providerName !== undefined) reservation.providerName = providerName;
    if (bookingReference !== undefined) reservation.bookingReference = bookingReference;
    if (startDateTime !== undefined) reservation.startDateTime = new Date(startDateTime);
    if (endDateTime !== undefined) reservation.endDateTime = endDateTime ? new Date(endDateTime) : null;
    if (location !== undefined) reservation.location = location;
    if (latitude !== undefined) reservation.latitude = latitude;
    if (longitude !== undefined) reservation.longitude = longitude;
    if (cost !== undefined) reservation.costMinor = toMinorUnits(cost);
    if (currency !== undefined) reservation.currency = currency;
    if (externalUrl !== undefined) reservation.externalUrl = externalUrl;
    if (status !== undefined) reservation.status = status;
    if (notes !== undefined) reservation.notes = notes;

    await reservation.save();

    await logActivityAndNotify({
      tripId: trip._id,
      actor: req.user,
      action: 'RESERVATION_UPDATED',
      resourceType: 'RESERVATION',
      resourceId: reservation._id,
      summary: `${req.user.name} updated reservation "${reservation.title}".`,
      notificationTitle: 'Booking Updated'
    });

    emitToTrip(trip._id, 'reservation:updated', reservation);

    return res.status(200).json({
      success: true,
      message: 'Reservation updated successfully',
      reservation
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteReservation(req, res, next) {
  try {
    const trip = req.trip;
    const { reservationId } = req.params;

    const reservation = await Reservation.findOneAndDelete({ _id: reservationId, trip: trip._id });
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    await logActivityAndNotify({
      tripId: trip._id,
      actor: req.user,
      action: 'RESERVATION_DELETED',
      resourceType: 'RESERVATION',
      resourceId: reservation._id,
      summary: `${req.user.name} removed reservation "${reservation.title}".`,
      notificationTitle: 'Booking Removed'
    });

    emitToTrip(trip._id, 'reservation:deleted', { reservationId });

    return res.status(200).json({
      success: true,
      message: 'Reservation deleted successfully'
    });
  } catch (err) {
    next(err);
  }
}
