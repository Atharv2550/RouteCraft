import { describe, it, expect } from 'vitest';
import { optimizeDayRoute } from '../src/services/optimizationService.js';
import { calculateDistanceKm } from '../src/utils/distance.js';

describe('Route Optimization & Geodesic Distance', () => {
  it('calculates Haversine distance correctly between coordinates', () => {
    // Tokyo Station (35.6812, 139.7671) to Shibuya (35.6595, 139.7005) ~6.5 - 7.0 km
    const dist = calculateDistanceKm(35.6812, 139.7671, 35.6595, 139.7005);
    expect(dist).toBeGreaterThan(6.0);
    expect(dist).toBeLessThan(7.5);
  });

  it('optimizes a zigzag route and returns proposal without modifying source', () => {
    // 3 locations in a line: A (lat: 35.60), B (lat: 35.70), C (lat: 35.80)
    // Order given: A -> C -> B (zigzag)
    const items = [
      { _id: '1', title: 'Location A', latitude: 35.60, longitude: 139.70, isFixedTime: false, displayOrder: 0 },
      { _id: '2', title: 'Location C', latitude: 35.80, longitude: 139.70, isFixedTime: false, displayOrder: 1 },
      { _id: '3', title: 'Location B', latitude: 35.70, longitude: 139.70, isFixedTime: false, displayOrder: 2 }
    ];

    const proposal = optimizeDayRoute(items);

    expect(proposal.canOptimize).toBe(true);
    expect(proposal.proposedOrder.length).toBe(3);
    // Proposed order should visit B before C: A -> B -> C
    const titles = proposal.proposedOrder.map((it) => it.title);
    expect(titles).toEqual(['Location A', 'Location B', 'Location C']);
    expect(proposal.proposedTotalDistanceKm).toBeLessThan(proposal.originalTotalDistanceKm);
    expect(proposal.savedDistanceKm).toBeGreaterThan(0);
  });

  it('preserves fixed-time activities at their designated slots', () => {
    const items = [
      { _id: '1', title: 'Hotel Gracery', latitude: 35.6953, longitude: 139.7022, isFixedTime: true, displayOrder: 0 },
      { _id: '2', title: 'Far Attraction', latitude: 35.8500, longitude: 139.7000, isFixedTime: false, displayOrder: 1 },
      { _id: '3', title: 'Near Attraction', latitude: 35.7000, longitude: 139.7000, isFixedTime: false, displayOrder: 2 }
    ];

    const proposal = optimizeDayRoute(items);

    expect(proposal.canOptimize).toBe(true);
    // First item is fixed-time, so it must remain at index 0
    expect(proposal.proposedOrder[0].title).toBe('Hotel Gracery');
    expect(proposal.warnings.some((w) => w.includes('fixed-time'))).toBe(true);
  });
});

