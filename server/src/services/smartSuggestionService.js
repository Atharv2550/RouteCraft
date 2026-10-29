import { calculateDistanceKm } from '../utils/distance.js';
import { toMajorUnits } from '../utils/moneyMath.js';

function parseTimeToMinutes(timeStr) {
  if (!timeStr) return null;
  const parts = timeStr.split(':');
  if (parts.length !== 2) return null;
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

export function generateSmartSuggestions({ trip, days = [], itemsByDay = {}, expenses = [] }) {
  const suggestions = [];

  // 1. Budget Constraint Flags
  const totalBudgetMinor = trip.totalBudgetMinor || 0;
  let totalEstimatedMinor = 0;
  let totalActualMinor = 0;

  // Sum estimated costs from activities
  Object.values(itemsByDay).forEach((dayItems) => {
    dayItems.forEach((it) => {
      totalEstimatedMinor += it.estimatedCostMinor || 0;
    });
  });

  // Sum actual expenses
  expenses.forEach((exp) => {
    totalActualMinor += exp.amountMinor || 0;
  });

  if (totalBudgetMinor > 0) {
    if (totalActualMinor > totalBudgetMinor) {
      const overspent = toMajorUnits(totalActualMinor - totalBudgetMinor);
      suggestions.push({
        id: 'budget-overrun-actual',
        type: 'warning',
        category: 'budget',
        title: 'Trip Budget Exceeded',
        message: `Recorded expenses (${trip.currency} ${toMajorUnits(totalActualMinor)}) exceed your total trip budget by ${trip.currency} ${overspent}.`,
        explanation: 'Your actual recorded spending has surpassed the overall budget allocated for this trip.'
      });
    } else if (totalEstimatedMinor > totalBudgetMinor) {
      const over = toMajorUnits(totalEstimatedMinor - totalBudgetMinor);
      suggestions.push({
        id: 'budget-overrun-estimated',
        type: 'suggestion',
        category: 'budget',
        title: 'Estimated Activities Exceed Budget',
        message: `Planned activity costs (${trip.currency} ${toMajorUnits(totalEstimatedMinor)}) exceed total trip budget by ${trip.currency} ${over}.`,
        explanation: 'Review planned activity costs or consider adjusting free attractions to stay within target budget.'
      });
    }
  }

  // 2. Iterate each day for schedule overlaps, over-scheduling, and missing coordinates
  days.forEach((day) => {
    const dayItems = itemsByDay[day._id.toString()] || [];

    // Missing coordinates
    const noCoords = dayItems.filter((it) => it.latitude == null || it.longitude == null);
    if (noCoords.length > 0) {
      suggestions.push({
        id: `no-coords-day-${day.dayNumber}`,
        type: 'info',
        category: 'mapping',
        dayId: day._id,
        dayNumber: day.dayNumber,
        title: `Day ${day.dayNumber}: Missing Coordinates`,
        message: `${noCoords.length} activity/activities lack map coordinates: "${noCoords.map((c) => c.title).slice(0, 2).join('", "')}".`,
        explanation: 'Adding coordinates enables distance calculation, interactive map plotting, and route navigation.'
      });
    }

    // Over-scheduling (> 5 activities)
    if (dayItems.length > 5) {
      suggestions.push({
        id: `overscheduled-day-${day.dayNumber}`,
        type: 'warning',
        category: 'pacing',
        dayId: day._id,
        dayNumber: day.dayNumber,
        title: `Day ${day.dayNumber}: Packed Schedule (${dayItems.length} activities)`,
        message: `Day ${day.dayNumber} has ${dayItems.length} activities scheduled, which may feel rushed.`,
        explanation: 'Travel research indicates that 3 to 4 key activities per day allow sufficient time for travel, dining, and unexpected delays.'
      });
    }

    // Schedule time overlap detection
    const timedItems = dayItems
      .filter((it) => it.startTime && it.endTime)
      .map((it) => ({
        ...it,
        startMin: parseTimeToMinutes(it.startTime),
        endMin: parseTimeToMinutes(it.endTime)
      }))
      .filter((it) => it.startMin != null && it.endMin != null)
      .sort((a, b) => a.startMin - b.startMin);

    for (let i = 0; i < timedItems.length - 1; i++) {
      const current = timedItems[i];
      const next = timedItems[i + 1];

      if (current.endMin > next.startMin) {
        suggestions.push({
          id: `overlap-${current._id}-${next._id}`,
          type: 'warning',
          category: 'conflict',
          dayId: day._id,
          dayNumber: day.dayNumber,
          title: `Schedule Overlap on Day ${day.dayNumber}`,
          message: `"${current.title}" (${current.startTime}-${current.endTime}) overlaps with "${next.title}" (${next.startTime}-${next.endTime}).`,
          explanation: 'These two activities have overlapping time windows. Adjust start or end times to prevent conflicts.'
        });
      }
    }

    // Consecutive distance check (> 25 km between sequential activities)
    for (let i = 0; i < dayItems.length - 1; i++) {
      const a = dayItems[i];
      const b = dayItems[i + 1];
      if (a.latitude != null && a.longitude != null && b.latitude != null && b.longitude != null) {
        const dist = calculateDistanceKm(a.latitude, a.longitude, b.latitude, b.longitude);
        if (dist > 25) {
          suggestions.push({
            id: `long-dist-${a._id}-${b._id}`,
            type: 'suggestion',
            category: 'travel-time',
            dayId: day._id,
            dayNumber: day.dayNumber,
            title: `High Travel Gap on Day ${day.dayNumber}`,
            message: `"${a.title}" and "${b.title}" are ${dist} km apart.`,
            explanation: `Expect significant transit time between these spots. Consider grouping attractions by neighborhood or reordering with Route Optimization.`
          });
        }
      }
    }
  });

  // 3. Cross-day proximity suggestions (Proximity between days)
  if (days.length > 1) {
    for (let i = 0; i < days.length; i++) {
      for (let j = i + 1; j < days.length; j++) {
        const dayA = days[i];
        const dayB = days[j];
        const itemsA = itemsByDay[dayA._id.toString()] || [];
        const itemsB = itemsByDay[dayB._id.toString()] || [];

        for (const itemA of itemsA) {
          if (itemA.latitude == null || itemA.longitude == null) continue;
          for (const itemB of itemsB) {
            if (itemB.latitude == null || itemB.longitude == null) continue;
            const dist = calculateDistanceKm(itemA.latitude, itemA.longitude, itemB.latitude, itemB.longitude);
            if (dist < 1.5 && suggestions.length < 10) {
              suggestions.push({
                id: `cross-day-prox-${itemA._id}-${itemB._id}`,
                type: 'suggestion',
                category: 'proximity',
                title: 'Nearby Attractions on Different Days',
                message: `"${itemA.title}" (Day ${dayA.dayNumber}) is only ${dist} km from "${itemB.title}" (Day ${dayB.dayNumber}).`,
                explanation: 'Grouping nearby activities onto the same itinerary day reduces transit time and fatigue.'
              });
              break;
            }
          }
        }
      }
    }
  }

  return suggestions;
}
