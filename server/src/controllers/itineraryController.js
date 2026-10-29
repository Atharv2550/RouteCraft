import { ItineraryDay } from '../models/ItineraryDay.js';
import { ItineraryItem } from '../models/ItineraryItem.js';
import { Expense } from '../models/Expense.js';
import { toMinorUnits } from '../utils/moneyMath.js';
import { optimizeDayRoute } from '../services/optimizationService.js';
import { generateSmartSuggestions } from '../services/smartSuggestionService.js';
import { logActivityAndNotify } from '../services/activityLogger.js';
import { emitToTrip } from '../services/socketService.js';

export async function getTripItinerary(req, res, next) {
  try {
    const trip = req.trip;

    const [days, items, expenses] = await Promise.all([
      ItineraryDay.find({ trip: trip._id }).sort({ dayNumber: 1 }),
      ItineraryItem.find({ trip: trip._id }).sort({ displayOrder: 1, startTime: 1 }),
      Expense.find({ trip: trip._id })
    ]);

    // Group items by day
    const itemsByDay = {};
    days.forEach((d) => {
      itemsByDay[d._id.toString()] = [];
    });

    items.forEach((item) => {
      const dayId = item.day.toString();
      if (itemsByDay[dayId]) {
        itemsByDay[dayId].push(item);
      }
    });

    // Run rule-based smart suggestions engine (Section 10 - No AI/ML)
    const suggestions = generateSmartSuggestions({
      trip,
      days,
      itemsByDay,
      expenses
    });

    return res.status(200).json({
      success: true,
      days,
      itemsByDay,
      items,
      suggestions
    });
  } catch (err) {
    next(err);
  }
}

export async function createDay(req, res, next) {
  try {
    const trip = req.trip;
    const { date, dayNumber, title, notes } = req.body;

    const day = await ItineraryDay.create({
      trip: trip._id,
      date: new Date(date),
      dayNumber,
      title: title || `Day ${dayNumber}`,
      notes: notes || ''
    });

    emitToTrip(trip._id, 'itinerary:day-created', day);

    return res.status(201).json({
      success: true,
      day
    });
  } catch (err) {
    next(err);
  }
}

export async function createItem(req, res, next) {
  try {
    const trip = req.trip;
    const {
      dayId,
      title,
      description,
      locationName,
      latitude,
      longitude,
      startTime,
      endTime,
      durationMinutes,
      estimatedCost,
      currency,
      category,
      status,
      displayOrder,
      isFixedTime,
      notes,
      externalUrl
    } = req.body;

    const day = await ItineraryDay.findOne({ _id: dayId, trip: trip._id });
    if (!day) {
      return res.status(404).json({ success: false, message: 'Itinerary day not found in this trip' });
    }

    // Determine display order if not specified
    let finalOrder = displayOrder;
    if (finalOrder == null || finalOrder === 0) {
      const count = await ItineraryItem.countDocuments({ day: dayId });
      finalOrder = count;
    }

    const item = await ItineraryItem.create({
      trip: trip._id,
      day: dayId,
      title,
      description: description || '',
      locationName: locationName || '',
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      startTime: startTime || null,
      endTime: endTime || null,
      durationMinutes: durationMinutes || 60,
      estimatedCostMinor: toMinorUnits(estimatedCost || 0),
      currency: currency || trip.currency || 'USD',
      category: category || 'sightseeing',
      status: status || 'PLANNED',
      displayOrder: finalOrder,
      isFixedTime: !!isFixedTime,
      notes: notes || '',
      externalUrl: externalUrl || '',
      createdBy: req.user._id
    });

    await logActivityAndNotify({
      tripId: trip._id,
      actor: req.user,
      action: 'ITINERARY_ITEM_ADDED',
      resourceType: 'ITINERARY',
      resourceId: item._id,
      summary: `${req.user.name} added activity "${item.title}" to Day ${day.dayNumber}.`,
      notificationTitle: 'New Activity Added'
    });

    emitToTrip(trip._id, 'itinerary:item-created', item);

    return res.status(201).json({
      success: true,
      message: 'Activity added successfully',
      item
    });
  } catch (err) {
    next(err);
  }
}

export async function updateItem(req, res, next) {
  try {
    const trip = req.trip;
    const { itemId } = req.params;

    const item = await ItineraryItem.findOne({ _id: itemId, trip: trip._id });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    const {
      dayId,
      title,
      description,
      locationName,
      latitude,
      longitude,
      startTime,
      endTime,
      durationMinutes,
      estimatedCost,
      currency,
      category,
      status,
      displayOrder,
      isFixedTime,
      notes,
      externalUrl
    } = req.body;

    if (dayId && dayId !== item.day.toString()) {
      const day = await ItineraryDay.findOne({ _id: dayId, trip: trip._id });
      if (!day) {
        return res.status(400).json({ success: false, message: 'Target day does not belong to this trip' });
      }
      item.day = dayId;
    }

    if (title !== undefined) item.title = title;
    if (description !== undefined) item.description = description;
    if (locationName !== undefined) item.locationName = locationName;
    if (latitude !== undefined) item.latitude = latitude;
    if (longitude !== undefined) item.longitude = longitude;
    if (startTime !== undefined) item.startTime = startTime;
    if (endTime !== undefined) item.endTime = endTime;
    if (durationMinutes !== undefined) item.durationMinutes = durationMinutes;
    if (estimatedCost !== undefined) item.estimatedCostMinor = toMinorUnits(estimatedCost);
    if (currency !== undefined) item.currency = currency;
    if (category !== undefined) item.category = category;
    if (status !== undefined) item.status = status;
    if (displayOrder !== undefined) item.displayOrder = displayOrder;
    if (isFixedTime !== undefined) item.isFixedTime = isFixedTime;
    if (notes !== undefined) item.notes = notes;
    if (externalUrl !== undefined) item.externalUrl = externalUrl;

    await item.save();

    await logActivityAndNotify({
      tripId: trip._id,
      actor: req.user,
      action: 'ITINERARY_ITEM_UPDATED',
      resourceType: 'ITINERARY',
      resourceId: item._id,
      summary: `${req.user.name} updated activity "${item.title}".`,
      notificationTitle: 'Activity Updated'
    });

    emitToTrip(trip._id, 'itinerary:item-updated', item);

    return res.status(200).json({
      success: true,
      message: 'Activity updated successfully',
      item
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteItem(req, res, next) {
  try {
    const trip = req.trip;
    const { itemId } = req.params;

    const item = await ItineraryItem.findOneAndDelete({ _id: itemId, trip: trip._id });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    await logActivityAndNotify({
      tripId: trip._id,
      actor: req.user,
      action: 'ITINERARY_ITEM_DELETED',
      resourceType: 'ITINERARY',
      resourceId: item._id,
      summary: `${req.user.name} removed activity "${item.title}".`,
      notificationTitle: 'Activity Removed'
    });

    emitToTrip(trip._id, 'itinerary:item-deleted', { itemId });

    return res.status(200).json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (err) {
    next(err);
  }
}

export async function reorderItems(req, res, next) {
  try {
    const trip = req.trip;
    const { items } = req.body; // Array<{ itemId, displayOrder }>

    const updateOps = items.map((it) =>
      ItineraryItem.updateOne(
        { _id: it.itemId, trip: trip._id },
        { $set: { displayOrder: it.displayOrder } }
      )
    );

    await Promise.all(updateOps);

    await logActivityAndNotify({
      tripId: trip._id,
      actor: req.user,
      action: 'ITINERARY_REORDERED',
      resourceType: 'ITINERARY',
      summary: `${req.user.name} reordered itinerary activities.`
    });

    emitToTrip(trip._id, 'itinerary:reordered', { items });

    return res.status(200).json({
      success: true,
      message: 'Activities reordered successfully'
    });
  } catch (err) {
    next(err);
  }
}

export async function optimizeDay(req, res, next) {
  try {
    const trip = req.trip;
    const { dayId } = req.body;

    if (!dayId) {
      return res.status(400).json({ success: false, message: 'Day ID is required' });
    }

    const items = await ItineraryItem.find({ trip: trip._id, day: dayId }).sort({ displayOrder: 1 });

    const proposal = optimizeDayRoute(items);

    return res.status(200).json({
      success: true,
      proposal
    });
  } catch (err) {
    next(err);
  }
}

export async function applyOptimizedOrder(req, res, next) {
  try {
    const trip = req.trip;
    const { dayId, proposedOrder } = req.body; // Array<{ _id, proposedOrder }>

    if (!dayId || !Array.isArray(proposedOrder)) {
      return res.status(400).json({ success: false, message: 'Day ID and proposedOrder array are required' });
    }

    const updateOps = proposedOrder.map((it, idx) =>
      ItineraryItem.updateOne(
        { _id: it._id, trip: trip._id, day: dayId },
        { $set: { displayOrder: it.proposedOrder ?? idx } }
      )
    );

    await Promise.all(updateOps);

    await logActivityAndNotify({
      tripId: trip._id,
      actor: req.user,
      action: 'ROUTE_OPTIMIZATION_APPLIED',
      resourceType: 'ITINERARY',
      summary: `${req.user.name} applied route optimization for an itinerary day.`,
      notificationTitle: 'Route Optimization Applied'
    });

    emitToTrip(trip._id, 'itinerary:reordered', { dayId });

    return res.status(200).json({
      success: true,
      message: 'Optimized route sequence applied successfully'
    });
  } catch (err) {
    next(err);
  }
}
