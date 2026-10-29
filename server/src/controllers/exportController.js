import { Trip } from '../models/Trip.js';
import { ItineraryDay } from '../models/ItineraryDay.js';
import { ItineraryItem } from '../models/ItineraryItem.js';
import { Reservation } from '../models/Reservation.js';
import { Expense } from '../models/Expense.js';
import { Settlement } from '../models/Settlement.js';
import { TripMember } from '../models/TripMember.js';
import { calculateNetBalances, generateSettlementSuggestions } from '../utils/moneyMath.js';
import { createItineraryPdfStream, createExpensesPdfStream } from '../services/pdfService.js';

export async function exportItineraryPdf(req, res, next) {
  try {
    const trip = req.trip;

    const [days, items, reservations] = await Promise.all([
      ItineraryDay.find({ trip: trip._id }).sort({ dayNumber: 1 }),
      ItineraryItem.find({ trip: trip._id }).sort({ displayOrder: 1, startTime: 1 }),
      Reservation.find({ trip: trip._id }).sort({ startDateTime: 1 })
    ]);

    const itemsByDay = {};
    days.forEach((d) => {
      itemsByDay[d._id.toString()] = [];
    });
    items.forEach((it) => {
      const dId = it.day.toString();
      if (itemsByDay[dId]) {
        itemsByDay[dId].push(it);
      }
    });

    const safeTitle = (trip.title || 'trip').replace(/[^a-zA-Z0-9_-]/g, '_');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="RouteCraft_${safeTitle}_Itinerary.pdf"`);

    const pdfStream = createItineraryPdfStream({ trip, days, itemsByDay, reservations });
    pdfStream.pipe(res);
  } catch (err) {
    next(err);
  }
}

export async function exportExpensesPdf(req, res, next) {
  try {
    const trip = req.trip;

    const [expenses, settlements, members] = await Promise.all([
      Expense.find({ trip: trip._id })
        .populate('payer', 'name avatarUrl email')
        .populate('shares.user', 'name avatarUrl email')
        .sort({ expenseDate: -1 }),
      Settlement.find({ trip: trip._id })
        .populate('payer', 'name avatarUrl email')
        .populate('receiver', 'name avatarUrl email'),
      TripMember.find({ trip: trip._id, status: 'ACTIVE' })
        .populate('user', 'name avatarUrl email')
    ]);

    const allMembers = members.map((m) => m.user).filter(Boolean);
    const netBalancesMap = calculateNetBalances(expenses, settlements, allMembers);
    const settlementSuggestions = generateSettlementSuggestions(netBalancesMap);

    const safeTitle = (trip.title || 'trip').replace(/[^a-zA-Z0-9_-]/g, '_');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="RouteCraft_${safeTitle}_Expenses.pdf"`);

    const pdfStream = createExpensesPdfStream({
      trip,
      expenses,
      netBalances: netBalancesMap,
      settlementSuggestions,
      members: allMembers
    });
    pdfStream.pipe(res);
  } catch (err) {
    next(err);
  }
}

