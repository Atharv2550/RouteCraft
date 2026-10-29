import { calculateDistanceKm, estimateTravelTimeMinutes, calculateTotalRouteDistance } from '../utils/distance.js';

/**
 * Rule-based route optimization for an itinerary day.
 * - Respects fixed-time items (cannot change time/order).
 * - Flags items without valid coordinates.
 * - Uses Nearest Neighbor + 2-Opt heuristic for flexible items with coordinates.
 * - Does NOT mutate DB; returns proposal for user confirmation.
 */
export function optimizeDayRoute(items = []) {
  if (!items || items.length <= 1) {
    return {
      canOptimize: false,
      reason: 'At least 2 activities are required for route optimization',
      originalOrder: items,
      proposedOrder: items,
      originalTotalDistanceKm: 0,
      proposedTotalDistanceKm: 0,
      savedDistanceKm: 0,
      savedTimeMinutes: 0,
      warnings: []
    };
  }

  const warnings = [];
  const itemsWithoutCoords = items.filter(it => it.latitude == null || it.longitude == null);
  if (itemsWithoutCoords.length > 0) {
    warnings.push(`${itemsWithoutCoords.length} activity/activities lack coordinates and will be preserved at their current slots.`);
  }

  const fixedItems = items.filter(it => it.isFixedTime);
  if (fixedItems.length > 0) {
    warnings.push(`${fixedItems.length} fixed-time activity/activities were kept at their scheduled slots.`);
  }

  // Measure original distance
  const originalDistance = calculateTotalRouteDistance(items);
  const originalTime = estimateTravelTimeMinutes(originalDistance);

  // Separate optimizable items from locked items
  // An item is optimizable if it has coordinates and is not fixedTime
  const optimizable = items.filter(it => it.latitude != null && it.longitude != null && !it.isFixedTime);

  if (optimizable.length < 2) {
    return {
      canOptimize: false,
      reason: 'Fewer than 2 flexible activities with coordinates found',
      originalOrder: items.map(it => ({ id: it._id, title: it.title, displayOrder: it.displayOrder })),
      proposedOrder: items.map(it => ({ id: it._id, title: it.title, displayOrder: it.displayOrder })),
      originalTotalDistanceKm: originalDistance,
      proposedTotalDistanceKm: originalDistance,
      savedDistanceKm: 0,
      savedTimeMinutes: 0,
      warnings
    };
  }

  // Nearest Neighbor Heuristic
  const unvisited = [...optimizable];
  const ordered = [unvisited.shift()]; // Start with the first item

  while (unvisited.length > 0) {
    const current = ordered[ordered.length - 1];
    let nearestIdx = -1;
    let shortestDist = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const candidate = unvisited[i];
      const dist = calculateDistanceKm(current.latitude, current.longitude, candidate.latitude, candidate.longitude);
      if (dist < shortestDist) {
        shortestDist = dist;
        nearestIdx = i;
      }
    }

    if (nearestIdx !== -1) {
      ordered.push(unvisited.splice(nearestIdx, 1)[0]);
    } else {
      ordered.push(unvisited.pop());
    }
  }

  // 2-Opt local search improvement on ordered
  let improved = true;
  let iterations = 0;
  const maxIterations = 50;

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;

    for (let i = 0; i < ordered.length - 2; i++) {
      for (let j = i + 2; j < ordered.length; j++) {
        const d1 = calculateDistanceKm(ordered[i].latitude, ordered[i].longitude, ordered[i + 1].latitude, ordered[i + 1].longitude) +
                   (j + 1 < ordered.length ? calculateDistanceKm(ordered[j].latitude, ordered[j].longitude, ordered[j + 1].latitude, ordered[j + 1].longitude) : 0);

        const d2 = calculateDistanceKm(ordered[i].latitude, ordered[i].longitude, ordered[j].latitude, ordered[j].longitude) +
                   (j + 1 < ordered.length ? calculateDistanceKm(ordered[i + 1].latitude, ordered[i + 1].longitude, ordered[j + 1].latitude, ordered[j + 1].longitude) : 0);

        if (d2 < d1 - 0.05) {
          // Reverse sub-path between i+1 and j
          const sub = ordered.slice(i + 1, j + 1).reverse();
          ordered.splice(i + 1, sub.length, ...sub);
          improved = true;
          break;
        }
      }
      if (improved) break;
    }
  }

  // Re-merge ordered optimizable items back with locked / non-coord items into full proposal
  let optIndex = 0;
  const proposedFull = items.map((orig) => {
    if (orig.latitude != null && orig.longitude != null && !orig.isFixedTime) {
      return ordered[optIndex++];
    }
    return orig;
  });

  const proposedDistance = calculateTotalRouteDistance(proposedFull);
  const proposedTime = estimateTravelTimeMinutes(proposedDistance);
  const savedDist = Math.max(0, parseFloat((originalDistance - proposedDistance).toFixed(2)));
  const savedTime = Math.max(0, originalTime - proposedTime);

  return {
    canOptimize: true,
    originalOrder: items.map((it, idx) => ({
      _id: it._id,
      title: it.title,
      latitude: it.latitude,
      longitude: it.longitude,
      startTime: it.startTime,
      displayOrder: idx
    })),
    proposedOrder: proposedFull.map((it, idx) => ({
      _id: it._id,
      title: it.title,
      latitude: it.latitude,
      longitude: it.longitude,
      startTime: it.startTime,
      proposedOrder: idx
    })),
    originalTotalDistanceKm: originalDistance,
    proposedTotalDistanceKm: proposedDistance,
    savedDistanceKm: savedDist,
    savedTimeMinutes: savedTime,
    warnings
  };
}
