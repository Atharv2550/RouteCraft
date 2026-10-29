/**
 * Haversine formula to compute distance between two latitude/longitude points in kilometers.
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (
    lat1 === undefined || lon1 === undefined ||
    lat2 === undefined || lon2 === undefined ||
    isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)
  ) {
    return 0;
  }

  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

/**
 * Estimate travel time in minutes based on distance in kilometers.
 * Assumes walking for < 1.5 km (~4.5 km/h), urban transit/driving for >= 1.5 km (~30 km/h) plus 5 min traffic buffer.
 */
export function estimateTravelTimeMinutes(distanceKm) {
  if (distanceKm <= 0) return 0;
  if (distanceKm < 1.5) {
    return Math.max(5, Math.round((distanceKm / 4.5) * 60));
  }
  // Urban travel speed 30 km/h + 5 min buffer
  return Math.max(10, Math.round((distanceKm / 30) * 60 + 5));
}

/**
 * Total route distance for an ordered array of items with coordinates.
 */
export function calculateTotalRouteDistance(items) {
  let totalKm = 0;
  for (let i = 0; i < items.length - 1; i++) {
    const a = items[i];
    const b = items[i + 1];
    if (a.latitude != null && a.longitude != null && b.latitude != null && b.longitude != null) {
      totalKm += calculateDistanceKm(a.latitude, a.longitude, b.latitude, b.longitude);
    }
  }
  return parseFloat(totalKm.toFixed(2));
}
