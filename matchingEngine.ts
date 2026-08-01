import { Location, Listing, Pantry, Vendor, MatchScoreBreakdown, AlgorithmWeights } from './types';

export const DEFAULT_WEIGHTS: AlgorithmWeights = {
  w1: 0.4, // Proximity weight
  w2: 0.4, // Urgency weight
  w3: 0.2, // Pantry need weight
};

/**
 * Calculates straight-line Haversine distance in kilometers between two lat/lng coordinates.
 */
export function calculateHaversineDistanceKm(loc1: Location, loc2: Location): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
  const dLng = ((loc2.lng - loc1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((loc1.lat * Math.PI) / 180) *
      Math.cos((loc2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Estimates urban travel time in minutes based on distance and Nairobi traffic factor.
 */
export function estimateTravelTimeMins(distanceKm: number): number {
  // Average urban Nairobi speed including traffic (~20 km/h -> ~3 mins per km + 3 min buffer)
  const estimatedMins = Math.ceil(distanceKm * 3.5 + 3);
  return Math.max(5, estimatedMins);
}

/**
 * Calculates proximity_score (0-100) based on distance.
 * Inverse relationship: closer distance yields higher proximity score.
 */
export function calculateProximityScore(distanceKm: number): number {
  if (distanceKm <= 0.5) return 100;
  // Score drops smoothly as distance increases, minimum 10 at 20km+
  const score = Math.max(10, 100 - distanceKm * 4.5);
  return Math.round(score * 10) / 10;
}

/**
 * Calculates urgency_score (0-100) based on remaining shelf life until expiry_at.
 * Higher score as expiration approaches.
 */
export function calculateUrgencyScore(expiryAtIso: string): number {
  const now = Date.now();
  const expiry = new Date(expiryAtIso).getTime();
  const diffHours = (expiry - now) / (1000 * 60 * 60);

  if (diffHours <= 0) return 100; // Expired / immediate priority
  if (diffHours <= 1) return 98;
  if (diffHours <= 2) return 92;
  if (diffHours <= 4) return 85;
  if (diffHours <= 8) return 72;
  if (diffHours <= 12) return 60;
  if (diffHours <= 24) return 45;
  if (diffHours <= 48) return 30;

  return Math.max(10, Math.round(100 - diffHours * 1.5));
}

/**
 * Calculates pantry_need_score (0-100) based on pantry need_score (1-10)
 * and adjusting for recent pickups count.
 */
export function calculatePantryNeedScore(pantry: Pantry): number {
  const baseNeed = Math.min(10, Math.max(1, pantry.need_score)) * 10;
  // Slight deduction if pantry received many recent pickups (to balance redistribution across pantries)
  const recentPickupDeduction = (pantry.recent_pickups_count || 0) * 3;
  const score = Math.max(20, baseNeed - recentPickupDeduction);
  return Math.round(score * 10) / 10;
}

/**
 * Core Algorithm Engine: Calculates the composite match score.
 * Formula: match_score = (w1 * proximity_score) + (w2 * urgency_score) + (w3 * pantry_need_score)
 */
export function computeMatchScore(
  listing: Listing,
  pantry: Pantry,
  vendor: Vendor,
  weights: AlgorithmWeights = DEFAULT_WEIGHTS
): { score: number; breakdown: MatchScoreBreakdown } {
  // 1. Proximity calculation
  const distance_km = calculateHaversineDistanceKm(vendor.location, pantry.location);
  const travel_time_mins = estimateTravelTimeMins(distance_km);
  const proximity_score = calculateProximityScore(distance_km);

  // 2. Urgency calculation
  const urgency_score = calculateUrgencyScore(listing.expiry_at);

  // 3. Pantry need score calculation
  const pantry_need_score = calculatePantryNeedScore(pantry);

  // Composite Weighted Sum
  const totalWeight = weights.w1 + weights.w2 + weights.w3;
  const normalizedW1 = weights.w1 / totalWeight;
  const normalizedW2 = weights.w2 / totalWeight;
  const normalizedW3 = weights.w3 / totalWeight;

  const rawScore =
    normalizedW1 * proximity_score +
    normalizedW2 * urgency_score +
    normalizedW3 * pantry_need_score;

  const score = Math.round(rawScore * 10) / 10;

  return {
    score,
    breakdown: {
      proximity_score,
      urgency_score,
      pantry_need_score,
      distance_km,
      travel_time_mins,
    },
  };
}
