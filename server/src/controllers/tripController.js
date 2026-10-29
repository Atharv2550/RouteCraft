import { Trip } from '../models/Trip.js';
import { TripMember } from '../models/TripMember.js';
import { ItineraryDay } from '../models/ItineraryDay.js';
import { ItineraryItem } from '../models/ItineraryItem.js';
import { Expense } from '../models/Expense.js';
import { Settlement } from '../models/Settlement.js';
import { Reservation } from '../models/Reservation.js';
import { Comment } from '../models/Comment.js';
import { DestinationVote } from '../models/DestinationVote.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { toMinorUnits } from '../utils/moneyMath.js';
import { logActivityAndNotify } from '../services/activityLogger.js';

export async function createTrip(req, res, next) {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      destinations,
      primaryDestinationName,
      currency,
      totalBudget,
      dailyBudget,
      travelStyle,
      interests
    } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const trip = await Trip.create({
      title,
      description,
      startDate: start,
      endDate: end,
      destinations: destinations || [],
      primaryDestinationName: primaryDestinationName || '',
      owner: req.user._id,
      currency: currency || req.user.preferredCurrency || 'USD',
      totalBudgetMinor: toMinorUnits(totalBudget || 0),
      dailyBudgetMinor: toMinorUnits(dailyBudget || 0),
      preferences: {
        travelStyle: travelStyle || 'BALANCED',
        interests: interests || []
      }
    });

    // Create owner record in TripMember
    await TripMember.create({
      trip: trip._id,
      user: req.user._id,
      role: 'OWNER',
      status: 'ACTIVE',
      joinedAt: new Date()
    });

    // Automatically generate ItineraryDay records for each calendar day of the trip
    const daysToCreate = [];
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    for (let i = 0; i < diffDays; i++) {
      const curDate = new Date(start);
      curDate.setDate(curDate.getDate() + i);
      daysToCreate.push({
        trip: trip._id,
        date: curDate,
        dayNumber: i + 1,
        title: `Day ${i + 1}`,
        notes: ''
      });
    }

    if (daysToCreate.length > 0) {
      await ItineraryDay.insertMany(daysToCreate);
    }

    await logActivityAndNotify({
      tripId: trip._id,
      actor: req.user,
      action: 'TRIP_CREATED',
      resourceType: 'TRIP',
      resourceId: trip._id,
      summary: `${req.user.name} created trip "${trip.title}" (${diffDays} days).`
    });

    return res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      trip
    });
  } catch (err) {
    next(err);
  }
}

export async function getTrips(req, res, next) {
  try {
    const userId = req.user._id;

    // Find trips where user is owner OR an active member
    const memberships = await TripMember.find({
      user: userId,
      status: 'ACTIVE'
    }).select('trip role');

    const tripIds = memberships.map((m) => m.trip);

    const trips = await Trip.find({
      $or: [{ owner: userId }, { _id: { $in: tripIds } }]
    })
      .populate('owner', 'name email avatarUrl')
      .populate('destinations', 'name country imageReferences')
      .sort({ startDate: 1 });

    const roleMap = new Map();
    memberships.forEach((m) => roleMap.set(m.trip.toString(), m.role));

    const enriched = trips.map((t) => {
      const obj = t.toObject();
      const isOwner = t.owner._id.toString() === userId.toString();
      obj.userRole = isOwner ? 'OWNER' : (roleMap.get(t._id.toString()) || 'VIEWER');
      return obj;
    });

    return res.status(200).json({
      success: true,
      trips: enriched
    });
  } catch (err) {
    next(err);
  }
}

export async function getTripById(req, res, next) {
  try {
    const { tripId } = req.params;
    const userId = req.user._id;

    const trip = await Trip.findById(tripId)
      .populate('owner', 'name email avatarUrl')
      .populate('destinations');

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const isOwner = trip.owner._id.toString() === userId.toString();
    const membership = await TripMember.findOne({ trip: trip._id, user: userId, status: 'ACTIVE' });

    if (!isOwner && !membership) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const tripObj = trip.toObject();
    tripObj.userRole = isOwner ? 'OWNER' : membership.role;

    return res.status(200).json({
      success: true,
      trip: tripObj
    });
  } catch (err) {
    next(err);
  }
}

export async function updateTrip(req, res, next) {
  try {
    const trip = req.trip; // Attached by authorizeTrip middleware
    const {
      title,
      description,
      currency,
      totalBudget,
      dailyBudget,
      travelStyle,
      interests,
      status,
      primaryDestinationName
    } = req.body;

    if (title) trip.title = title;
    if (description !== undefined) trip.description = description;
    if (currency) trip.currency = currency;
    if (totalBudget !== undefined) trip.totalBudgetMinor = toMinorUnits(totalBudget);
    if (dailyBudget !== undefined) trip.dailyBudgetMinor = toMinorUnits(dailyBudget);
    if (status) trip.status = status;
    if (primaryDestinationName !== undefined) trip.primaryDestinationName = primaryDestinationName;

    if (travelStyle || interests) {
      trip.preferences = {
        travelStyle: travelStyle || trip.preferences.travelStyle,
        interests: interests || trip.preferences.interests
      };
    }

    trip.revision = (trip.revision || 1) + 1;
    await trip.save();

    await logActivityAndNotify({
      tripId: trip._id,
      actor: req.user,
      action: 'TRIP_UPDATED',
      resourceType: 'TRIP',
      resourceId: trip._id,
      summary: `${req.user.name} updated trip details for "${trip.title}".`,
      notificationTitle: 'Trip Details Updated'
    });

    return res.status(200).json({
      success: true,
      message: 'Trip updated successfully',
      trip
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteTrip(req, res, next) {
  try {
    const trip = req.trip;

    // Only OWNER can delete
    if (trip.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the trip owner can delete this trip.'
      });
    }

    const tripId = trip._id;

    // Controlled cascade deletion across all associated collections
    await Promise.all([
      Trip.findByIdAndDelete(tripId),
      TripMember.deleteMany({ trip: tripId }),
      ItineraryDay.deleteMany({ trip: tripId }),
      ItineraryItem.deleteMany({ trip: tripId }),
      Expense.deleteMany({ trip: tripId }),
      Settlement.deleteMany({ trip: tripId }),
      Reservation.deleteMany({ trip: tripId }),
      Comment.deleteMany({ trip: tripId }),
      DestinationVote.deleteMany({ trip: tripId }),
      ActivityLog.deleteMany({ trip: tripId })
    ]);

    return res.status(200).json({
      success: true,
      message: 'Trip and all associated records have been permanently deleted.'
    });
  } catch (err) {
    next(err);
  }
}

export async function duplicateTrip(req, res, next) {
  try {
    const originalTrip = req.trip;
    const userId = req.user._id;

    // Duplicate trip document
    const newTrip = await Trip.create({
      title: `${originalTrip.title} (Copy)`,
      description: originalTrip.description,
      startDate: originalTrip.startDate,
      endDate: originalTrip.endDate,
      destinations: originalTrip.destinations,
      primaryDestinationName: originalTrip.primaryDestinationName,
      owner: userId,
      currency: originalTrip.currency,
      totalBudgetMinor: originalTrip.totalBudgetMinor,
      dailyBudgetMinor: originalTrip.dailyBudgetMinor,
      preferences: originalTrip.preferences,
      status: 'PLANNING'
    });

    await TripMember.create({
      trip: newTrip._id,
      user: userId,
      role: 'OWNER',
      status: 'ACTIVE',
      joinedAt: new Date()
    });

    // Copy itinerary days
    const originalDays = await ItineraryDay.find({ trip: originalTrip._id }).sort({ dayNumber: 1 });
    const dayMap = new Map();

    for (const od of originalDays) {
      const newDay = await ItineraryDay.create({
        trip: newTrip._id,
        date: od.date,
        dayNumber: od.dayNumber,
        title: od.title,
        notes: od.notes
      });
      dayMap.set(od._id.toString(), newDay._id);
    }

    // Copy itinerary items
    const originalItems = await ItineraryItem.find({ trip: originalTrip._id });
    const newItems = originalItems.map((item) => ({
      trip: newTrip._id,
      day: dayMap.get(item.day.toString()) || null,
      title: item.title,
      description: item.description,
      locationName: item.locationName,
      latitude: item.latitude,
      longitude: item.longitude,
      startTime: item.startTime,
      endTime: item.endTime,
      durationMinutes: item.durationMinutes,
      estimatedCostMinor: item.estimatedCostMinor,
      currency: item.currency,
      category: item.category,
      status: 'PLANNED',
      displayOrder: item.displayOrder,
      isFixedTime: item.isFixedTime,
      notes: item.notes,
      externalUrl: item.externalUrl,
      createdBy: userId
    })).filter((it) => it.day != null);

    if (newItems.length > 0) {
      await ItineraryItem.insertMany(newItems);
    }

    return res.status(201).json({
      success: true,
      message: 'Trip duplicated successfully',
      trip: newTrip
    });
  } catch (err) {
    next(err);
  }
}
