import { Trip } from '../models/Trip.js';
import { TripMember } from '../models/TripMember.js';
import { Expense } from '../models/Expense.js';
import { Settlement } from '../models/Settlement.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { toMajorUnits, calculateNetBalances } from '../utils/moneyMath.js';

export async function getDashboardSummary(req, res, next) {
  try {
    const userId = req.user._id;
    const now = new Date();

    // 1. Get all memberships where user is active
    const memberships = await TripMember.find({ user: userId, status: 'ACTIVE' }).select('trip role');
    const memberTripIds = memberships.map((m) => m.trip);

    // 2. Fetch all trips where user is owner or member
    const allUserTrips = await Trip.find({
      $or: [{ owner: userId }, { _id: { $in: memberTripIds } }]
    })
      .populate('owner', 'name avatarUrl')
      .populate('destinations', 'name country imageReferences')
      .sort({ startDate: 1 });

    const roleMap = new Map();
    memberships.forEach((m) => roleMap.set(m.trip.toString(), m.role));

    const upcomingTrips = [];
    const ongoingTrips = [];
    const completedTrips = [];
    const sharedTrips = [];

    let totalPlannedBudgetMinor = 0;

    allUserTrips.forEach((trip) => {
      const tripObj = trip.toObject();
      const isOwner = trip.owner._id.toString() === userId.toString();
      tripObj.userRole = isOwner ? 'OWNER' : (roleMap.get(trip._id.toString()) || 'VIEWER');

      totalPlannedBudgetMinor += trip.totalBudgetMinor || 0;

      if (!isOwner) {
        sharedTrips.push(tripObj);
      }

      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);

      if (start > now) {
        upcomingTrips.push(tripObj);
      } else if (end < now) {
        completedTrips.push(tripObj);
      } else {
        ongoingTrips.push(tripObj);
      }
    });

    const allTripIds = allUserTrips.map((t) => t._id);

    // 3. Recent expenses across user's trips
    const recentExpenses = await Expense.find({ trip: { $in: allTripIds } })
      .populate('payer', 'name avatarUrl')
      .populate('trip', 'title currency')
      .sort({ expenseDate: -1 })
      .limit(8);

    // 4. Calculate user's net balance across all their trips
    const [allTripExpenses, allTripSettlements] = await Promise.all([
      Expense.find({ trip: { $in: allTripIds } }),
      Settlement.find({ trip: { $in: allTripIds } })
    ]);

    const netBalancesMap = calculateNetBalances(allTripExpenses, allTripSettlements, [req.user]);
    const userNetBalanceMinor = netBalancesMap.get(userId.toString()) || 0;

    // 5. Recent activity logs across user's trips
    const recentActivity = await ActivityLog.find({ trip: { $in: allTripIds } })
      .populate('actor', 'name avatarUrl')
      .populate('trip', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      stats: {
        totalTrips: allUserTrips.length,
        upcomingTripsCount: upcomingTrips.length,
        ongoingTripsCount: ongoingTrips.length,
        completedTripsCount: completedTrips.length,
        sharedTripsCount: sharedTrips.length,
        totalPlannedBudget: toMajorUnits(totalPlannedBudgetMinor),
        userNetBalance: toMajorUnits(userNetBalanceMinor),
        currency: req.user.preferredCurrency || 'USD'
      },
      upcomingTrips: upcomingTrips.slice(0, 4),
      ongoingTrips,
      completedTrips: completedTrips.slice(0, 4),
      sharedTrips: sharedTrips.slice(0, 4),
      recentExpenses,
      recentActivity
    });
  } catch (err) {
    next(err);
  }
}

