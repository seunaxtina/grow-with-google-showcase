export interface Location {
  lat: number;
  lng: number;
  address: string;
  subCounty?: string;
}

export interface Vendor {
  vendor_id: string;
  name: string;
  type: 'supermarket' | 'grocery_store' | 'market_stall' | 'hotel_restaurant' | 'farm';
  location: Location;
  contact: string;
  created_at: string;
  rating?: number;
}

export interface Pantry {
  pantry_id: string;
  name: string;
  type: 'community_center' | 'orphanage' | 'school_feeding' | 'shelter' | 'pantry';
  location: Location;
  need_score: number; // 1 to 10
  beneficiaries_count: number;
  contact: string;
  created_at: string;
  recent_pickups_count: number;
}

export interface Volunteer {
  volunteer_id: string;
  name: string;
  phone: string;
  vehicle_type: 'walking' | 'boda_boda' | 'tuk_tuk' | 'pickup_truck';
  status: 'available' | 'busy';
  current_location?: Location;
  total_deliveries: number;
}

export interface Listing {
  listing_id: string;
  vendor_id: string;
  vendor_name: string;
  vendor_address: string;
  vendor_location: Location;
  item_name: string;
  category: 'produce' | 'bakery' | 'dairy' | 'cooked_meals' | 'packaged_goods';
  quantity: number; // in kg or units
  unit: 'kg' | 'units' | 'crates' | 'boxes';
  expiry_at: string; // ISO date string
  status: 'open' | 'reserved' | 'completed';
  created_at: string;
  photo_url?: string;
  notes?: string;
}

export interface MatchScoreBreakdown {
  proximity_score: number; // 0 - 100
  urgency_score: number; // 0 - 100
  pantry_need_score: number; // 0 - 100
  distance_km: number;
  travel_time_mins: number;
}

export interface Match {
  match_id: string;
  listing_id: string;
  pantry_id: string;
  volunteer_id?: string;
  score: number; // Final weighted score
  breakdown: MatchScoreBreakdown;
  status: 'assigned' | 'picked_up' | 'delivered';
  matched_at: string;
  listing?: Listing;
  pantry?: Pantry;
  volunteer?: Volunteer;
  vendor?: Vendor;
}

export interface ImpactLog {
  log_id: string;
  match_id: string;
  kg_redirected: number;
  meals_estimated: number; // kg * 2.5
  co2_avoided_kg: number; // kg * 2.5
  timestamp: string;
  item_name: string;
  pantry_name: string;
  vendor_name: string;
}

export interface AlgorithmWeights {
  w1: number; // proximity weight (default 0.4)
  w2: number; // urgency weight (default 0.4)
  w3: number; // pantry need weight (default 0.2)
}

export interface ImpactSummary {
  total_kg_redirected: number;
  total_meals_estimated: number;
  matches_completed: number;
  co2_avoided_kg: number;
  active_listings_count: number;
  available_volunteers_count: number;
}
